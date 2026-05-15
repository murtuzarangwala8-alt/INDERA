import dotenv from 'dotenv';
dotenv.config();

import { sendSmsOtp } from './utils/sms.js';

const testSms = async () => {
  const phone = '393509629833'; // Stripped the + as usually preferred by APIs, but you can add it back if it fails
  const otp = '1234'; // The API requires 4 digits if template asks for code

  console.log(`Attempting to send SMS OTP to ${phone}...`);

  try {
    const result = await sendSmsOtp(phone, otp);
    if (result.success) {
      console.log('✅ SMS OTP sent successfully! Please check your phone.');
    } else {
      console.log('❌ Failed to send SMS OTP:', result.error);
    }
  } catch (error) {
    console.error('❌ Exception occurred while sending SMS:', error);
  }
};

testSms();
