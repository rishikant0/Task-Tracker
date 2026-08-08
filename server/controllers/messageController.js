const Message = require('../models/Message');
const { getIO } = require('../socket');

const sendMessage = async (req, res) => {
  try {
    const { content, chatType, team, project, receiver, attachments } = req.body;
    
    let newMessage = await Message.create({
      content,
      sender: req.user._id,
      chatType,
      team,
      project,
      receiver,
      attachments
    });

    newMessage = await newMessage.populate('sender', 'name avatar');
    
    // Socket emit logic happens in the client or we can emit here directly
    const io = getIO();
    const chatRoom = chatType === 'team' ? team : (chatType === 'project' ? project : receiver);
    io.to(chatRoom).emit('message_received', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { team, project, receiver } = req.query;
    let query = {};
    
    if (team) query.team = team;
    if (project) query.project = project;
    if (receiver) query.receiver = receiver; // For direct messages it would involve checking sender and receiver both ways

    const messages = await Message.find(query)
      .populate('sender', 'name avatar')
      .populate('attachments')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages
};
