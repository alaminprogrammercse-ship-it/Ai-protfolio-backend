const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Portfolio backend is running.");
});

app.get("/api/contact", (req, res) => {
  res.json({
    success: true,
    message: "API is working. Use POST request for form submission."
  });
});

app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};

    console.log("POST request received");
    console.log("Request body:", req.body);

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "সবগুলো field পূরণ করুন।"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "সঠিক email address দিন।"
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email configuration missing."
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.verify();
    console.log("SMTP ready");

    const mailOptions = {
      from: `"Portfolio Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER,
      replyTo: email,
      subject: `Portfolio Contact | ${name} | ${new Date().toLocaleString()}`,
      text: `
Name: ${name}
Email: ${email}
Message: ${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    console.log("Message ID:", info.messageId);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully."
    });
  } catch (error) {
    console.error("Backend error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Something went wrong. Please try again later."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
