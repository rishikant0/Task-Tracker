const express = require('express');
const router = express.Router();
const {
  createTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  inviteMember,
  acceptInvitation,
  removeMember,
  updateMemberRole
} = require('../controllers/teamController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .post(protect, createTeam)
  .get(protect, getTeams);

router.route('/:id')
  .get(protect, getTeamById)
  .put(protect, updateTeam)
  .delete(protect, deleteTeam);

router.route('/:id/invite')
  .post(protect, inviteMember);

router.route('/invite/accept/:token')
  .post(protect, acceptInvitation);

router.route('/:id/members/:userId')
  .delete(protect, removeMember)
  .put(protect, updateMemberRole);

module.exports = router;
