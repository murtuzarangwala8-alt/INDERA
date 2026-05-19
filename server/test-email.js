import './config/env.js';
import nodemailer from 'nodemailer';

const testEmail = async () => {
  console.log('Testing SMTP connection...');
  console.log(`Host: ${process.env.EMAIL_HOST}`);
  console.log(`Port: ${process.env.EMAIL_PORT}`);
  console.log(`User: ${process.env.EMAIL_USER}`);

  const port = Number(process.env.EMAIL_PORT || 465);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    // Verify the connection configuration
    await transporter.verify();
    console.log('✅ Server is ready to take our messages');

    // Send a test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // sending to yourself
      subject: 'Test Email from INDERA',
      text: 'Hello! If you receive this, your email configuration is working perfectly.',
      html: '<b>Hello!</b><br>If you receive this, your email configuration is working perfectly.',
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error occurred:', error);
  }
};

testEmail();
