const nodemailer = require('nodemailer');

// Helper to create transport instance dynamically based on environment variables
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  // Fallback for dev/testing when SMTP environment variables are not set
  return {
    sendMail: async (mailOptions) => {
      console.log(`[Email Service Dev Fallback] Email to ${mailOptions.to} standard dispatch skipped (No active SMTP credentials configured). Subject: "${mailOptions.subject}"`);
      return { messageId: `mock-${Date.now()}` };
    },
  };
};

const defaultFrom = process.env.EMAIL_FROM || '"EventSphere" <noreply@eventsphere.edu>';

/**
 * Send RSVP confirmation email to student
 * @param {Object} user - User object containing name and email
 * @param {Object} event - Event object containing title, date, time, location
 * @param {Object} rsvp - RSVP object containing status and ticketCode
 */
const sendRSVPConfirmationEmail = async (user, event, rsvp) => {
  try {
    if (!user || !user.email) return;

    const transporter = createTransporter();
    const eventDateStr = event.date ? new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) : 'TBA';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #09090B; color: #FAFAFA; margin: 0; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background-color: #18181B; border: 1px solid #27272A; border-radius: 16px; overflow: hidden; }
          .header { background-color: #09090B; padding: 24px; text-align: center; border-bottom: 1px solid #27272A; }
          .brand { color: #A3E635; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin: 0; }
          .content { padding: 28px; }
          .status-badge { display: inline-block; background-color: rgba(163, 230, 53, 0.12); color: #A3E635; border: 1px solid rgba(163, 230, 53, 0.3); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px; }
          .event-title { font-size: 20px; font-weight: 800; color: #FAFAFA; margin: 0 0 16px 0; }
          .detail-box { background-color: #09090B; border: 1px solid #27272A; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
          .detail-item { font-size: 13px; color: #A1A1AA; margin-bottom: 8px; }
          .detail-item strong { color: #FAFAFA; }
          .ticket-card { background-color: rgba(163, 230, 53, 0.05); border: 1px dashed #A3E635; border-radius: 12px; padding: 16px; text-align: center; margin-top: 20px; }
          .ticket-label { font-size: 11px; text-transform: uppercase; color: #A1A1AA; font-weight: bold; letter-spacing: 1px; margin-bottom: 4px; }
          .ticket-code { font-family: monospace; font-size: 18px; font-weight: bold; color: #A3E635; letter-spacing: 2px; }
          .footer { background-color: #09090B; padding: 16px; text-align: center; font-size: 11px; color: #71717A; border-top: 1px solid #27272A; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand">EventSphere</h1>
          </div>
          <div class="content">
            <div class="status-badge">RSVP Confirmed</div>
            <h2 class="event-title">${event.title}</h2>
            <p style="font-size: 14px; color: #A1A1AA; margin-bottom: 20px;">
              Hi ${user.name || 'Student'}, your registration for <strong>${event.title}</strong> has been confirmed!
            </p>

            <div class="detail-box">
              <div class="detail-item"><strong>Date:</strong> ${eventDateStr}</div>
              <div class="detail-item"><strong>Time:</strong> ${event.time || 'TBA'}</div>
              <div class="detail-item"><strong>Venue:</strong> ${event.location || 'Campus Main Hall'}</div>
              ${event.organizer ? `<div class="detail-item"><strong>Organizer:</strong> ${event.organizer}</div>` : ''}
            </div>

            ${rsvp && rsvp.ticketCode ? `
              <div class="ticket-card">
                <div class="ticket-label">Digital Ticket Pass Code</div>
                <div class="ticket-code">${rsvp.ticketCode}</div>
              </div>
            ` : ''}
          </div>
          <div class="footer">
            EventSphere Smart Campus Event Management System &bull; Present your Digital Pass at venue check-in
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: defaultFrom,
      to: user.email,
      subject: `[EventSphere] RSVP Confirmed: ${event.title}`,
      html: htmlContent,
    });
  } catch (error) {
    // Non-blocking log as required by rule #6
    console.error(`[Email Service] Failed to send RSVP confirmation email to ${user?.email}:`, error.message);
  }
};

/**
 * Send Waitlist notification email to student
 * @param {Object} user - User object containing name and email
 * @param {Object} event - Event object containing title, date, time, location
 */
const sendWaitlistEmail = async (user, event) => {
  try {
    if (!user || !user.email) return;

    const transporter = createTransporter();
    const eventDateStr = event.date ? new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) : 'TBA';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #09090B; color: #FAFAFA; margin: 0; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background-color: #18181B; border: 1px solid #27272A; border-radius: 16px; overflow: hidden; }
          .header { background-color: #09090B; padding: 24px; text-align: center; border-bottom: 1px solid #27272A; }
          .brand { color: #A3E635; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin: 0; }
          .content { padding: 28px; }
          .status-badge { display: inline-block; background-color: rgba(251, 191, 36, 0.12); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.3); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px; }
          .event-title { font-size: 20px; font-weight: 800; color: #FAFAFA; margin: 0 0 16px 0; }
          .detail-box { background-color: #09090B; border: 1px solid #27272A; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
          .detail-item { font-size: 13px; color: #A1A1AA; margin-bottom: 8px; }
          .detail-item strong { color: #FAFAFA; }
          .note-box { background-color: #09090B; border-left: 3px solid #FBBF24; padding: 12px 16px; font-size: 13px; color: #A1A1AA; border-radius: 0 8px 8px 0; }
          .footer { background-color: #09090B; padding: 16px; text-align: center; font-size: 11px; color: #71717A; border-top: 1px solid #27272A; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand">EventSphere</h1>
          </div>
          <div class="content">
            <div class="status-badge">Waitlist Joined</div>
            <h2 class="event-title">${event.title}</h2>
            <p style="font-size: 14px; color: #A1A1AA; margin-bottom: 20px;">
              Hi ${user.name || 'Student'}, <strong>${event.title}</strong> has currently reached maximum capacity. You have been added to the official waitlist.
            </p>

            <div class="detail-box">
              <div class="detail-item"><strong>Date:</strong> ${eventDateStr}</div>
              <div class="detail-item"><strong>Time:</strong> ${event.time || 'TBA'}</div>
              <div class="detail-item"><strong>Venue:</strong> ${event.location || 'Campus Main Hall'}</div>
            </div>

            <div class="note-box">
              If an attendee cancels their pass, you will automatically be promoted and notified with your Digital Pass!
            </div>
          </div>
          <div class="footer">
            EventSphere Smart Campus Event Management System &bull; Automatic Waitlist Queue
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: defaultFrom,
      to: user.email,
      subject: `[EventSphere] Waitlist Confirmation: ${event.title}`,
      html: htmlContent,
    });
  } catch (error) {
    // Non-blocking log as required by rule #6
    console.error(`[Email Service] Failed to send waitlist email to ${user?.email}:`, error.message);
  }
};

/**
 * Send Event Cancellation notification email to student
 * @param {Object} user - User object containing name and email
 * @param {Object} event - Event object containing title, date, time, location
 */
const sendEventCancellationEmail = async (user, event) => {
  try {
    if (!user || !user.email) return;

    const transporter = createTransporter();
    const eventDateStr = event.date ? new Date(event.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) : 'TBA';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #09090B; color: #FAFAFA; margin: 0; padding: 20px; }
          .container { max-width: 560px; margin: 0 auto; background-color: #18181B; border: 1px solid #27272A; border-radius: 16px; overflow: hidden; }
          .header { background-color: #09090B; padding: 24px; text-align: center; border-bottom: 1px solid #27272A; }
          .brand { color: #A3E635; font-size: 22px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin: 0; }
          .content { padding: 28px; }
          .status-badge { display: inline-block; background-color: rgba(239, 68, 68, 0.12); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px; }
          .event-title { font-size: 20px; font-weight: 800; color: #FAFAFA; margin: 0 0 16px 0; }
          .detail-box { background-color: #09090B; border: 1px solid #27272A; border-radius: 12px; padding: 16px; margin-bottom: 20px; }
          .detail-item { font-size: 13px; color: #A1A1AA; margin-bottom: 8px; }
          .detail-item strong { color: #FAFAFA; }
          .note-box { background-color: #09090B; border-left: 3px solid #F87171; padding: 12px 16px; font-size: 13px; color: #A1A1AA; border-radius: 0 8px 8px 0; }
          .footer { background-color: #09090B; padding: 16px; text-align: center; font-size: 11px; color: #71717A; border-top: 1px solid #27272A; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="brand">EventSphere</h1>
          </div>
          <div class="content">
            <div class="status-badge">Event Cancelled</div>
            <h2 class="event-title">${event.title}</h2>
            <p style="font-size: 14px; color: #A1A1AA; margin-bottom: 20px;">
              Hi ${user.name || 'Student'}, we regret to inform you that the event <strong>${event.title}</strong> has been cancelled by the organizer.
            </p>

            <div class="detail-box">
              <div class="detail-item"><strong>Date:</strong> ${eventDateStr}</div>
              <div class="detail-item"><strong>Time:</strong> ${event.time || 'TBA'}</div>
              <div class="detail-item"><strong>Venue:</strong> ${event.location || 'Campus Main Hall'}</div>
            </div>

            <div class="note-box">
              Your registration / waitlist entry for this event is no longer active. We apologize for any inconvenience.
            </div>
          </div>
          <div class="footer">
            EventSphere Smart Campus Event Management System
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: defaultFrom,
      to: user.email,
      subject: `[EventSphere] Event Cancelled: ${event.title}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error(`[Email Service] Failed to send event cancellation email to ${user?.email}:`, error.message);
  }
};

module.exports = {
  sendRSVPConfirmationEmail,
  sendWaitlistEmail,
  sendEventCancellationEmail,
};
