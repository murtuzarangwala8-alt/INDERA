import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ── Auth emails ──────────────────────────────────────────────

export const sendEmailOtp = async (email, firstName, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your INDÉRA account',
    html: `
      <!DOCTYPE html><html><body style="font-family:'DM Sans',Arial,sans-serif;background:#FAF7F2;margin:0;padding:0">
      <div style="max-width:520px;margin:40px auto;background:#fff;border:1px solid rgba(201,168,76,0.2)">
        <div style="background:#0D0D0D;padding:32px;text-align:center">
          <h1 style="margin:0;font-family:Georgia,serif;color:#C9A84C;font-weight:300;letter-spacing:0.2em">INDÉRA</h1>
          <p style="margin:8px 0 0;color:rgba(250,247,242,0.5);font-size:11px;letter-spacing:0.3em;text-transform:uppercase">Indo-European Jewelry</p>
        </div>
        <div style="padding:40px">
          <p style="color:#0D0D0D;font-size:15px">Hello ${firstName},</p>
          <p style="color:rgba(13,13,13,0.6);font-size:14px;line-height:1.6">Please verify your email address to complete your INDÉRA account setup.</p>
          <div style="text-align:center;margin:32px 0">
            <div style="display:inline-block;background:#0D0D0D;padding:20px 40px;letter-spacing:0.4em">
              <span style="font-family:Georgia,serif;font-size:32px;color:#C9A84C;font-weight:300">${otp}</span>
            </div>
          </div>
          <p style="color:rgba(13,13,13,0.4);font-size:12px;text-align:center">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
        <div style="border-top:1px solid rgba(201,168,76,0.1);padding:20px;text-align:center">
          <p style="color:rgba(13,13,13,0.3);font-size:11px;margin:0">&copy; 2024 INDÉRA. All rights reserved.</p>
        </div>
      </div>
      </body></html>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email OTP sent to ${email}`);
  } catch (error) {
    console.error('❌ Email OTP failed:', error.message);
    throw error;
  }
};

export const sendWelcomeEmail = async (email, firstName) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to INDÉRA',
    html: `
      <!DOCTYPE html><html><body style="font-family:'DM Sans',Arial,sans-serif;background:#FAF7F2;margin:0;padding:0">
      <div style="max-width:520px;margin:40px auto;background:#fff;border:1px solid rgba(201,168,76,0.2)">
        <div style="background:#0D0D0D;padding:32px;text-align:center">
          <h1 style="margin:0;font-family:Georgia,serif;color:#C9A84C;font-weight:300;letter-spacing:0.2em">INDÉRA</h1>
        </div>
        <div style="padding:40px">
          <p style="color:#0D0D0D;font-size:15px">Welcome, ${firstName}.</p>
          <p style="color:rgba(13,13,13,0.6);font-size:14px;line-height:1.6">Your account is now verified. You now have access to the INDÉRA private collection, early drops, and exclusive member pricing.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${process.env.FRONTEND_URL}/products" style="display:inline-block;background:linear-gradient(135deg,#C9A84C,#E8C97A,#B8960C);color:#0D0D0D;padding:14px 36px;text-decoration:none;font-size:11px;letter-spacing:0.3em;text-transform:uppercase">Shop Collection</a>
          </div>
        </div>
        <div style="border-top:1px solid rgba(201,168,76,0.1);padding:20px;text-align:center">
          <p style="color:rgba(13,13,13,0.3);font-size:11px;margin:0">&copy; 2024 INDÉRA. All rights reserved.</p>
        </div>
      </div>
      </body></html>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Welcome email failed:', error.message);
  }
};

export const sendPasswordResetEmail = async (email, firstName, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset your INDÉRA password',
    html: `
      <!DOCTYPE html><html><body style="font-family:'DM Sans',Arial,sans-serif;background:#FAF7F2;margin:0;padding:0">
      <div style="max-width:520px;margin:40px auto;background:#fff;border:1px solid rgba(201,168,76,0.2)">
        <div style="background:#0D0D0D;padding:32px;text-align:center">
          <h1 style="margin:0;font-family:Georgia,serif;color:#C9A84C;font-weight:300;letter-spacing:0.2em">INDÉRA</h1>
        </div>
        <div style="padding:40px">
          <p style="color:#0D0D0D;font-size:15px">Hello ${firstName},</p>
          <p style="color:rgba(13,13,13,0.6);font-size:14px;line-height:1.6">We received a request to reset your password. Click the button below — this link expires in 1 hour.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${resetUrl}" style="display:inline-block;background:#0D0D0D;color:#C9A84C;padding:14px 36px;text-decoration:none;font-size:11px;letter-spacing:0.3em;text-transform:uppercase">Reset Password</a>
          </div>
          <p style="color:rgba(13,13,13,0.4);font-size:12px;text-align:center">If you did not request this, please ignore this email.</p>
        </div>
      </div>
      </body></html>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Password reset email failed:', error.message);
  }
};

// ── Order emails ──────────────────────────────────────────────

export const sendOrderConfirmation = async (order) => {
  const itemsList = order.items.map(item => 
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.name}</strong><br>
        <small>${item.brand}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toLocaleString()}</td>
    </tr>`
  ).join('');

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: order.customer.email,
    subject: `Order Confirmation - ${order.orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; }
          .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; }
          .total-row { font-weight: bold; font-size: 18px; color: #DAA520; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; color: #C9A84C;">INDÉRA</h1>
            <p style="margin: 10px 0 0 0;">Thank you for your order!</p>
          </div>
          
          <div class="content">
            <h2>Order Confirmation</h2>
            <p>Hi ${order.customer.firstName},</p>
            <p>Your order has been confirmed and will be shipped soon.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              
              <h4 style="margin-top: 20px;">Items Ordered:</h4>
              <table>
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 10px; text-align: left;">Product</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 10px; text-align: right;">Subtotal:</td>
                    <td style="padding: 10px; text-align: right;">$${order.pricing.subtotal.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 10px; text-align: right;">Shipping:</td>
                    <td style="padding: 10px; text-align: right;">$${order.pricing.shipping.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding: 10px; text-align: right;">Tax:</td>
                    <td style="padding: 10px; text-align: right;">$${order.pricing.tax.toFixed(2)}</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="2" style="padding: 10px; text-align: right; border-top: 2px solid #DAA520;">Total:</td>
                    <td style="padding: 10px; text-align: right; border-top: 2px solid #DAA520;">$${order.pricing.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
              
              <h4 style="margin-top: 20px;">Shipping Address:</h4>
              <p>
                ${order.customer.firstName} ${order.customer.lastName}<br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.zipCode}<br>
                ${order.shippingAddress.country}
              </p>
            </div>
            
            <p>We'll send you a shipping confirmation email with tracking information once your order ships.</p>
            <p>If you have any questions, please contact us at hello@indera.com</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2024 INDÉRA. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${order.customer.email}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
};

export default transporter;
