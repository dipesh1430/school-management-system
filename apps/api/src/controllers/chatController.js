const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, message, attachments } = req.body;
    
    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver and message content are required.' });
    }

    const chatMsg = new ChatMessage({
      schoolId: req.schoolId,
      senderId: req.user._id,
      receiverId,
      message,
      attachments: attachments || []
    });

    await chatMsg.save();
    res.status(201).json(chatMsg);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { contactId } = req.params;
    
    // Get messages where current user is either sender or receiver with the specific contact
    const messages = await ChatMessage.find({
      schoolId: req.schoolId,
      $or: [
        { senderId: req.user._id, receiverId: contactId },
        { senderId: contactId, receiverId: req.user._id }
      ]
    }).sort({ createdAt: 1 }); // Oldest to newest for chat UI
    
    // Mark as read (if current user is receiver)
    await ChatMessage.updateMany(
      { schoolId: req.schoolId, senderId: contactId, receiverId: req.user._id, readAt: null },
      { $set: { readAt: new Date() } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    // For this basic MVP, we will return a list of all users in the school
    // In a real app, a teacher would only see parents of their students, and parents only their teachers
    // To make it usable right now, let's just return all users EXCEPT the current user
    // We will populate name and role.
    
    const users = await User.find({ 
      schoolId: req.schoolId, 
      _id: { $ne: req.user._id },
      isActive: true
    }).select('name role profilePic');
    
    // Get last message for each contact to show in the list
    // This is a naive approach for MVP; a real app uses aggregations
    const contactsWithLastMessage = await Promise.all(users.map(async (u) => {
      const lastMsg = await ChatMessage.findOne({
        schoolId: req.schoolId,
        $or: [
          { senderId: req.user._id, receiverId: u._id },
          { senderId: u._id, receiverId: req.user._id }
        ]
      }).sort({ createdAt: -1 });

      const unreadCount = await ChatMessage.countDocuments({
        schoolId: req.schoolId,
        senderId: u._id,
        receiverId: req.user._id,
        readAt: null
      });

      return {
        _id: u._id,
        name: u.name,
        role: u.role,
        profilePic: u.profilePic,
        lastMessage: lastMsg ? lastMsg.message : null,
        lastMessageTime: lastMsg ? lastMsg.createdAt : null,
        unreadCount
      };
    }));

    // Sort by recent activity
    contactsWithLastMessage.sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });

    res.json(contactsWithLastMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
