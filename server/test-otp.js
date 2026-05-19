import './config/env.js';

import { sendEmailOtp } from './utils/email.js';

const testOtp = async () => {
  const email = 'murtazarangwala0@gmail.com';
  const firstName = 'Murtaza';
  const otp = '123456';

  console.log(`Attempting to send OTP email to ${email}...`);
  console.log(`Using SMTP Host: ${process.env.EMAIL_HOST}`);

  try {
    await sendEmailOtp(email, firstName, otp);
    console.log('✅ OTP email sent successfully! Please check your inbox (and spam folder).');
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
  }
};

testOtp();
