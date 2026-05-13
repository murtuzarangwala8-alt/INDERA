import ContactMessage from '../models/ContactMessage.js';
import { sendContactNotification } from '../utils/email.js';

// ── POST /api/contact ──────────────────────────────────────────
export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    if (message.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Message must be at least 10 characters.' });
    }

    // Save to DB
    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ipAddress: req.ip,
    });

    // Send emails (admin alert + auto-reply) — non-blocking failure
    try {
      await sendContactNotification({ name: name.trim(), email, subject: subject.trim(), message: message.trim() });
    } catch (emailError) {
      console.warn('Contact email notification failed:', emailError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Your message has been received. We will respond within 24 hours.',
      id: contactMessage._id,
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

// ── GET /api/contact (admin only) ─────────────────────────────
export const getContactMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const query = status ? { status } : {};

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await ContactMessage.countDocuments(query);

    res.json({
      success: true,
      messages,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── PATCH /api/contact/:id (admin mark as read/replied) ───────
export const updateContactStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['new', 'read', 'replied'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });

    res.json({ success: true, message: msg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
