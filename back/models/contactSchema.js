const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['pending', 'read', 'replied'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for better search performance
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

const Contact = new mongoose.model("Contact", contactSchema);

module.exports = Contact;
