import twilio from 'twilio';

let client = null;

const getClient = () => {
  if (!client && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return client;
};

export const sendSmsOtp = async (phone, otp) => {
  const twilioClient = getClient();

  // In development without Twilio credentials, just log the OTP
  if (!twilioClient) {
    console.log(`📱 [DEV] SMS OTP for ${phone}: ${otp}`);
    return { success: true, dev: true };
  }

  try {
    await twilioClient.messages.create({
      body: `Your INDÉRA verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    return { success: true };
  } catch (error) {
    console.error('SMS send error:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendWhatsappOtp = async (phone, otp) => {
  // Bypassed for now: Just log to console and simulate success
  console.log(`[BYPASS] WhatsApp OTP for ${phone}: ${otp}`);
  return { success: true };
};
