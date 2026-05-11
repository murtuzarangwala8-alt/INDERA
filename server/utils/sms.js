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
  const twilioClient = getClient();

  if (!twilioClient) {
    throw new Error('WhatsApp verification is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_FROM.');
  }

  const from = process.env.TWILIO_WHATSAPP_FROM || process.env.TWILIO_PHONE_NUMBER;
  if (!from) {
    throw new Error('TWILIO_WHATSAPP_FROM is missing.');
  }

  const fromAddress = from.startsWith('whatsapp:') ? from : `whatsapp:${from}`;
  const toAddress = phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone}`;

  try {
    await twilioClient.messages.create({
      body: `Your INDÉRA WhatsApp verification code is: ${otp}. Valid for 10 minutes.`,
      from: fromAddress,
      to: toAddress,
    });
    return { success: true };
  } catch (error) {
    console.error('WhatsApp OTP send error:', error.message);
    throw error;
  }
};
