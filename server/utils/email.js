import nodemailer from 'nodemailer';
import he from 'he';

// Escape user-supplied strings before embedding in HTML emails
// Prevents XSS via email clients that render HTML
const esc = (str) => he.encode(String(str || ''));

const getTransporter = () => {
  const port = Number(process.env.EMAIL_PORT || 587);

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    throw new Error('Email is not configured. Set EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD, and EMAIL_FROM.');
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

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
          <p style="color:#0D0D0D;font-size:15px">Hello ${esc(firstName)},</p>
          <p style="color:rgba(13,13,13,0.6);font-size:14px;line-height:1.6">Please verify your email address to complete your INDÉRA account setup.</p>
          <div style="text-align:center;margin:32px 0">
            <div style="display:inline-block;background:#0D0D0D;padding:20px 40px;letter-spacing:0.4em">
              <span style="font-family:Georgia,serif;font-size:32px;color:#C9A84C;font-weight:300">${esc(otp)}</span>
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
    await getTransporter().sendMail(mailOptions);
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
          <p style="color:#0D0D0D;font-size:15px">Welcome, ${esc(firstName)}.</p>
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
    await getTransporter().sendMail(mailOptions);
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
          <p style="color:#0D0D0D;font-size:15px">Hello ${esc(firstName)},</p>
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
    await getTransporter().sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Password reset email failed:', error.message);
    throw error;
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
            <p>Hi ${esc(order.customer.firstName)},</p>
            <p>Your order has been confirmed and will be shipped soon.</p>
            
            <div class="order-details">
              <h3>Order Details</h3>
              <p><strong>Order Number:</strong> ${esc(order.orderNumber)}</p>
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
    await getTransporter().sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${order.customer.email}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
  }
};

// ── Contact form notification ─────────────────────────────────

export const sendContactNotification = async ({ name, email, subject, message }) => {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_FROM;

  // 1. Alert admin
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    subject: `[CONTACT] ${subject}`,
    html: `
      <!DOCTYPE html><html><body style="font-family:'DM Sans',Arial,sans-serif;background:#FAF7F2;margin:0;padding:0">
      <div style="max-width:520px;margin:40px auto;background:#fff;border:1px solid rgba(201,168,76,0.2)">
        <div style="background:#0D0D0D;padding:28px;text-align:center">
          <h1 style="margin:0;font-family:Georgia,serif;color:#C9A84C;font-weight:300;letter-spacing:0.2em">INDÉRA</h1>
          <p style="margin:8px 0 0;color:rgba(250,247,242,0.5);font-size:11px;letter-spacing:0.3em;text-transform:uppercase">New Contact Message</p>
        </div>
        <div style="padding:36px">
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr><td style="padding:8px 0;font-size:12px;color:rgba(13,13,13,0.45);text-transform:uppercase;letter-spacing:0.1em;width:90px">From</td><td style="padding:8px 0;font-size:14px;color:#0D0D0D">${esc(name)}</td></tr>
            <tr><td style="padding:8px 0;font-size:12px;color:rgba(13,13,13,0.45);text-transform:uppercase;letter-spacing:0.1em">Email</td><td style="padding:8px 0;font-size:14px;color:#0D0D0D"><a href="mailto:${esc(email)}" style="color:#C9A84C">${esc(email)}</a></td></tr>
            <tr><td style="padding:8px 0;font-size:12px;color:rgba(13,13,13,0.45);text-transform:uppercase;letter-spacing:0.1em">Subject</td><td style="padding:8px 0;font-size:14px;color:#0D0D0D">${esc(subject)}</td></tr>
          </table>
          <div style="background:#FAF7F2;border-left:3px solid #C9A84C;padding:16px 20px">
            <p style="margin:0;font-size:14px;color:#0D0D0D;line-height:1.7">${esc(message).replace(/\n/g, '<br>')}</p>
          </div>
        </div>
        <div style="border-top:1px solid rgba(201,168,76,0.1);padding:16px;text-align:center">
          <p style="color:rgba(13,13,13,0.3);font-size:11px;margin:0">&copy; 2024 INDÉRA. Admin Notification.</p>
        </div>
      </div>
      </body></html>
    `,
  });

  // 2. Auto-reply to sender
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'We received your message — INDÉRA',
    html: `
      <!DOCTYPE html><html><body style="font-family:'DM Sans',Arial,sans-serif;background:#FAF7F2;margin:0;padding:0">
      <div style="max-width:520px;margin:40px auto;background:#fff;border:1px solid rgba(201,168,76,0.2)">
        <div style="background:#0D0D0D;padding:28px;text-align:center">
          <h1 style="margin:0;font-family:Georgia,serif;color:#C9A84C;font-weight:300;letter-spacing:0.2em">INDÉRA</h1>
        </div>
        <div style="padding:36px">
          <p style="color:#0D0D0D;font-size:15px">Hello ${esc(name)},</p>
          <p style="color:rgba(13,13,13,0.6);font-size:14px;line-height:1.7">Thank you for reaching out. We have received your message regarding <strong>"${esc(subject)}"</strong> and will respond within 24 hours.</p>
          <p style="color:rgba(13,13,13,0.6);font-size:14px;line-height:1.7">If your enquiry is urgent, please email us directly at <a href="mailto:hello@indera.it" style="color:#C9A84C">hello@indera.it</a>.</p>
          <p style="color:rgba(13,13,13,0.4);font-size:13px;margin-top:24px">Warm regards,<br><strong style="color:#0D0D0D">The INDÉRA Team</strong></p>
        </div>
        <div style="border-top:1px solid rgba(201,168,76,0.1);padding:16px;text-align:center">
          <p style="color:rgba(13,13,13,0.3);font-size:11px;margin:0">&copy; 2024 INDÉRA. All rights reserved.</p>
        </div>
      </div>
      </body></html>
    `,
  });
};

// ── Return request emails ──────────────────────────────────────

export const sendReturnRequestEmail = async ({ firstName, email, orderNumber, reason, resolution, returnId }) => {
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_FROM;
  const reasonLabels = {
    damaged: 'Damaged on arrival',
    wrong_item: 'Wrong item received',
    not_as_described: 'Not as described',
    changed_mind: 'Changed my mind',
    other: 'Other',
  };

  // 1. Alert admin
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: adminEmail,
    subject: `[RETURN REQUEST] Order ${orderNumber} — ${reasonLabels[reason] || reason}`,
    html: `
      <!DOCTYPE html><html><body style="font-family:'DM Sans',Arial,sans-serif;background:#FAF7F2;margin:0;padding:0">
      <div style="max-width:520px;margin:40px auto;background:#fff;border:1px solid rgba(201,168,76,0.2)">
        <div style="background:#0D0D0D;padding:28px;text-align:center">
          <h1 style="margin:0;font-family:Georgia,serif;color:#C9A84C;font-weight:300;letter-spacing:0.2em">INDÉRA</h1>
          <p style="margin:8px 0 0;color:rgba(250,247,242,0.5);font-size:11px;letter-spacing:0.3em;text-transform:uppercase">New Return Request</p>
        </div>
        <div style="padding:36px">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;font-size:12px;color:rgba(13,13,13,0.45);text-transform:uppercase;letter-spacing:0.1em;width:120px">Return ID</td><td style="padding:8px 0;font-size:13px;color:#C9A84C;font-family:monospace">${esc(returnId)}</td></tr>
            <tr><td style="padding:8px 0;font-size:12px;color:rgba(13,13,13,0.45);text-transform:uppercase;letter-spacing:0.1em">Customer</td><td style="padding:8px 0;font-size:14px;color:#0D0D0D">${esc(firstName)} — <a href="mailto:${esc(email)}" style="color:#C9A84C">${esc(email)}</a></td></tr>
            <tr><td style="padding:8px 0;font-size:12px;color:rgba(13,13,13,0.45);text-transform:uppercase;letter-spacing:0.1em">Order</td><td style="padding:8px 0;font-size:14px;color:#0D0D0D">${esc(orderNumber)}</td></tr>
            <tr><td style="padding:8px 0;font-size:12px;color:rgba(13,13,13,0.45);text-transform:uppercase;letter-spacing:0.1em">Reason</td><td style="padding:8px 0;font-size:14px;color:#0D0D0D">${esc(reasonLabels[reason] || reason)}</td></tr>
            <tr><td style="padding:8px 0;font-size:12px;color:rgba(13,13,13,0.45);text-transform:uppercase;letter-spacing:0.1em">Wants</td><td style="padding:8px 0;font-size:14px;color:#0D0D0D">${resolution === 'refund' ? '💰 Full Refund' : '🔄 Replacement'}</td></tr>
          </table>
        </div>
      </div>
      </body></html>
    `,
  });

  // 2. Confirmation to customer
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Return Request Received — Order ${orderNumber}`,
    html: `
      <!DOCTYPE html><html><body style="font-family:'DM Sans',Arial,sans-serif;background:#FAF7F2;margin:0;padding:0">
      <div style="max-width:520px;margin:40px auto;background:#fff;border:1px solid rgba(201,168,76,0.2)">
        <div style="background:#0D0D0D;padding:28px;text-align:center">
          <h1 style="margin:0;font-family:Georgia,serif;color:#C9A84C;font-weight:300;letter-spacing:0.2em">INDÉRA</h1>
        </div>
        <div style="padding:36px">
          <p style="color:#0D0D0D;font-size:15px">Hello ${esc(firstName)},</p>
          <p style="color:rgba(13,13,13,0.6);font-size:14px;line-height:1.7">We have received your return request for order <strong>${esc(orderNumber)}</strong>. Our team will review it within 2–3 business days.</p>
          <div style="background:#FAF7F2;border:1px solid rgba(201,168,76,0.2);padding:20px;margin:24px 0">
            <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:rgba(13,13,13,0.4)">Return Reference</p>
            <p style="margin:0;font-family:monospace;font-size:16px;color:#C9A84C">${esc(returnId)}</p>
          </div>
          <p style="color:rgba(13,13,13,0.6);font-size:14px;line-height:1.7">Requested resolution: <strong>${resolution === 'refund' ? 'Full Refund' : 'Replacement'}</strong></p>
          <p style="color:rgba(13,13,13,0.4);font-size:13px;margin-top:24px">The INDÉRA Team</p>
        </div>
        <div style="border-top:1px solid rgba(201,168,76,0.1);padding:16px;text-align:center">
          <p style="color:rgba(13,13,13,0.3);font-size:11px;margin:0">&copy; 2024 INDÉRA. All rights reserved.</p>
        </div>
      </div>
      </body></html>
    `,
  });
};

export default getTransporter;


