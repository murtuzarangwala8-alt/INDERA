export const sendSmsOtp = async (phone, otp) => {
  try {
    const response = await fetch('https://api.otp.dev/v1/verifications', {
      method: 'POST',
      headers: {
        'X-OTP-Key': 'd3c7435ec9857e3e82d660de487007cd',
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          channel: 'sms',
          sender: '2e5d1c24-ade9-48cf-8ad1-6560a243c8cb',
          phone: phone,
          template: 'dec02b32-0655-4118-815a-06418ff9cda4',
          code: String(otp)
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OTP.dev send error:', errorText);
      return { success: false, error: errorText };
    }

    console.log(`✅ [OTP.dev] SMS sent to ${phone}`);
    return { success: true };
  } catch (error) {
    console.error('SMS send error:', error.message);
    return { success: false, error: error.message };
  }
};

// Aliased since the auth controller calls sendWhatsappOtp
export const sendWhatsappOtp = sendSmsOtp;
