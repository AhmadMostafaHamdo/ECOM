const Contact = require("../models/contactSchema");
const { asyncHandler } = require("../middleware/errorMiddleware");
const validator = require("validator");
const { clearCache } = require("../middleware/cacheMiddleware");

/**
 * @desc    Submit a contact message
 * @route   POST /api/contact
 */
exports.submitContact = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    // Basic presence check
    if (!name || !email || !subject || !message) {
        return res.status(422).json({
            error: "All fields are required",
            details: {
                name: !name ? "Name is required" : null,
                email: !email ? "Email is required" : null,
                subject: !subject ? "Subject is required" : null,
                message: !message ? "Message is required" : null,
            },
        });
    }

    // Email validation
    if (!validator.isEmail(email)) {
        return res.status(422).json({ error: "Please enter a valid email address" });
    }

    // Name validation
    if (name.trim().length < 2 || name.trim().length > 100) {
        return res.status(422).json({ error: "Name must be between 2 and 100 characters" });
    }

    // Subject validation
    if (subject.trim().length < 3 || subject.trim().length > 200) {
        return res.status(422).json({ error: "Subject must be between 3 and 200 characters" });
    }

    // Message validation
    if (message.trim().length < 10 || message.trim().length > 1000) {
        return res.status(422).json({ error: "Message must be between 10 and 1000 characters" });
    }

    const contactMessage = new Contact({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
    });

    const savedMessage = await contactMessage.save();

    res.status(201).json({
        success: true,
        message: "Your message has been sent successfully! We'll get back to you soon.",
        data: {
            id: savedMessage._id,
            name: savedMessage.name,
            email: savedMessage.email,
            subject: savedMessage.subject,
            createdAt: savedMessage.createdAt,
        },
    });
});
