const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversationSchema");
const ChatMessage = require("../models/messageSchema");
const authenicate = require("../middleware/authenticate");

// Get or create a conversation
router.post("/", authenicate, async (req, res) => {
  try {
    const { recipientId, productId } = req.body;
    const senderId = req.userID;

    if (!recipientId) {
      return res.status(400).json({ error: "Recipient ID is required" });
    }

    // Check if conversation already exists between these users
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
      ...(productId && { productId })
    }).populate("participants", "fname email");

    if (!conversation) {
      // Create new conversation
      conversation = new Conversation({
        participants: [senderId, recipientId],
        productId: productId || null,
        unreadCount: new Map([
          [senderId.toString(), 0],
          [recipientId.toString(), 0]
        ])
      });
      await conversation.save();
      
      // Populate participants after saving
      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "fname email");
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.log("Create conversation error:", error.message);
    res.status(500).json({ error: "Failed to create or find conversation" });
  }
});

// Get user's conversations
router.get("/", authenicate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      Conversation.find({ participants: req.userID })
        .populate("participants", "fname email")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),
      Conversation.countDocuments({ participants: req.userID })
    ]);

    res.status(200).json({
      data: conversations,
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.log("Fetch conversations error:", error.message);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// Get messages for a conversation
router.get("/:id/messages", authenicate, async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.userID)) {
      return res.status(403).json({ error: "Access denied" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      ChatMessage.find({ conversationId: req.params.id })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate("senderId", "fname email"),
      ChatMessage.countDocuments({ conversationId: req.params.id })
    ]);

    // Mark messages as read for this user
    await Conversation.findByIdAndUpdate(req.params.id, {
      $set: { [`unreadCount.${req.userID}`]: 0 }
    });

    res.status(200).json({
      data: messages,
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.log("Fetch messages error:", error.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message
router.post("/:id/messages", authenicate, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ error: "Message text is required" });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.userID)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Create message
    const message = new ChatMessage({
      conversationId: req.params.id,
      senderId: req.userID,
      text: text.trim()
    });

    await message.save();

    // Update conversation's last message and unread counts
    const otherParticipants = conversation.participants.filter(
      p => p.toString() !== req.userID.toString()
    );

    const unreadUpdates = {};
    otherParticipants.forEach(participantId => {
      const currentCount = conversation.unreadCount?.get(participantId.toString()) || 0;
      unreadUpdates[participantId.toString()] = currentCount + 1;
    });

    const updated = await Conversation.findByIdAndUpdate(
      req.params.id,
      {
        lastMessage: {
          text: text.trim(),
          senderId: req.userID,
          createdAt: new Date()
        },
        $set: { unreadCount: unreadUpdates }
      },
      { new: true }
    ).populate("participants", "fname email");

    // Populate sender info for the message
    const populatedMessage = await ChatMessage.findById(message._id)
      .populate("senderId", "fname email");

    res.status(201).json({
      message: populatedMessage,
      conversation: updated
    });
  } catch (error) {
    console.log("Send message error:", error.message);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Get unread message count
router.get("/unread/count", authenicate, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userID,
    });

    let totalUnread = 0;
    conversations.forEach((c) => {
      totalUnread += c.unreadCount?.get(req.userID.toString()) || 0;
    });

    res.status(200).json({ unreadCount: totalUnread });
  } catch (error) {
    console.log("Unread count error:", error.message);
    res.status(500).json({ error: "Failed to get unread count" });
  }
});

module.exports = router;
