const Team = require('../models/Team');
const User = require('../models/User');

const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const team = await Team.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ 'members.user': req.user._id })
      .populate('members.user', 'name email avatar')
      .populate('owner', 'name email');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'name email avatar')
      .populate('owner', 'name email');
    if (!team) return res.status(404).json({ message: 'Team not found' });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ message: 'Team removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const inviteMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    const teamId = req.params.id;
    
    // Check if team exists
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    // Check if user has permission to invite (only admin/manager)
    const currentMember = team.members.find(m => m.user.toString() === req.user._id.toString());
    if (!currentMember || (currentMember.role !== 'admin' && currentMember.role !== 'manager')) {
      return res.status(403).json({ message: 'Not authorized to invite members' });
    }

    // Check if user is already a member
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const isAlreadyMember = team.members.find(m => m.user.toString() === existingUser._id.toString());
      if (isAlreadyMember) {
        return res.status(400).json({ message: 'User is already a member of this team' });
      }
    }

    const crypto = require('crypto');
    const token = crypto.randomBytes(20).toString('hex');
    
    // Create invitation
    const Invitation = require('../models/Invitation');
    const invitation = await Invitation.create({
      team: teamId,
      sender: req.user._id,
      email,
      role: role || 'member',
      token,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Send email
    const sendEmail = require('../utils/sendEmail');
    const inviteUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/invite/${token}`;
    
    try {
      await sendEmail({
        email,
        subject: `You have been invited to join ${team.name}`,
        html: `
          <h1>Invitation to join ${team.name}</h1>
          <p>${req.user.name} has invited you to join their team.</p>
          <a href="${inviteUrl}">Click here to accept the invitation</a>
          <p>Or use this link: ${inviteUrl}</p>
        `
      });
      res.status(200).json({ message: 'Invitation sent successfully', invitation });
    } catch (error) {
      await Invitation.findByIdAndDelete(invitation._id);
      console.error(error);
      res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    
    const Invitation = require('../models/Invitation');
    const invitation = await Invitation.findOne({ 
      token, 
      status: 'pending',
      expiresAt: { $gt: Date.now() }
    });

    if (!invitation) {
      return res.status(400).json({ message: 'Invalid or expired invitation' });
    }

    // Make sure user matches email
    if (req.user.email !== invitation.email) {
      return res.status(403).json({ message: 'This invitation was sent to a different email address' });
    }

    const team = await Team.findById(invitation.team);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Add user to team
    team.members.push({
      user: req.user._id,
      role: invitation.role
    });
    
    await team.save();
    
    // Update invitation
    invitation.status = 'accepted';
    await invitation.save();

    res.status(200).json({ message: 'Joined team successfully', team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    const currentMember = team.members.find(m => m.user.toString() === req.user._id.toString());
    if (!currentMember || (currentMember.role !== 'admin' && req.user._id.toString() !== userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (team.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot remove team owner' });
    }

    team.members = team.members.filter(m => m.user.toString() !== userId);
    await team.save();
    
    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;
    
    const team = await Team.findById(id);
    if (!team) return res.status(404).json({ message: 'Team not found' });
    
    const currentMember = team.members.find(m => m.user.toString() === req.user._id.toString());
    if (!currentMember || currentMember.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can change roles' });
    }

    if (team.owner.toString() === userId) {
      return res.status(400).json({ message: 'Cannot change owner role' });
    }

    const memberToUpdate = team.members.find(m => m.user.toString() === userId);
    if (!memberToUpdate) {
      return res.status(404).json({ message: 'Member not found in team' });
    }

    memberToUpdate.role = role;
    await team.save();
    
    res.json({ message: 'Role updated successfully', team });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  inviteMember,
  acceptInvitation,
  removeMember,
  updateMemberRole
};
