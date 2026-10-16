// ─── Resend SDK ────────────────────────────────────────────────────────────────
// Render Free blocks outbound SMTP. All email delivery goes through the Resend
// HTTPS API instead. Set RESEND_API_KEY in your environment variables.
// Note: SMTP_HOST / SMTP_USER / SMTP_PASS are no longer used.
const { Resend } = require('resend');

// ─── Sender address ───────────────────────────────────────────────────────────
// Set EMAIL_FROM in your environment to a verified sender address or domain.
//
// IMPORTANT — Resend sandbox restriction:
// If EMAIL_FROM is not set, this falls back to Resend's built-in onboarding
// sender (onboarding@resend.dev). That address can ONLY deliver to the single
// email address that owns the Resend account. It cannot send to arbitrary
// recipients. To send to any address, verify a domain at resend.com/domains
// and set EMAIL_FROM to an address on that domain, e.g.:
//   EMAIL_FROM="EventSphere <noreply@yourdomain.com>"
const defaultFrom = process.env.EMAIL_FROM || 'EventSphere <onboarding@resend.dev>';

// ─── Resend client ────────────────────────────────────────────────────────────
// The client is instantiated inside sendViaResend() — NOT at module scope.
// Reason: new Resend(undefined) throws synchronously, which would crash every
// test suite at require() time (tests run without a real API key).
// Instantiating lazily inside the function keeps the module safely loadable
// in test environments while still working correctly in production.

/**
 * Internal helper — sends one email via the Resend HTTPS API.
 * Throws a descriptive Error if RESEND_API_KEY is absent or if Resend
 * returns an error in its response object.
 *
 * @param {string} to        - Recipient email address
 * @param {string} subject   - Email subject line
 * @param {string} html      - Full HTML body
 */
const sendViaResend = async (to, subject, html) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      '[Email Service] RESEND_API_KEY is not set. Add it to your environment variables.'
    );
  }

  // Instantiate here (after the key check) so the module can be safely
  // require()'d in test environments that have no API key configured.
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: defaultFrom,
    to: [to],
    subject,
    html,
  });

  if (error) {
    throw new Error(
      `[Email Service] Resend API returned an error: ${error.message || JSON.stringify(error)}`
    );
  }

  console.log(`[Email Service] Email accepted by Resend. id=${data?.id} to=${to} subject="${subject}"`);
};

/**
 * Send RSVP confirmation email to student
 * @param {Object} user - User object containing name and email
 * @param {Object} event - Event object containing title, date, time, location
 * @param {Object} rsvp - RSVP object containing status and ticketCode
 */
const sendRSVPConfirmationEmail = async (user, event, rsvp) => {
  try {
    if (!user || !user.email) return;

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

    await sendViaResend(
      user.email,
      `[EventSphere] RSVP Confirmed: ${event.title}`,
      htmlContent
    );
  } catch (error) {
    // Non-blocking: log the real Resend error but do not let email failure
    // roll back or reject the RSVP that already succeeded in the database.
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

    await sendViaResend(
      user.email,
      `[EventSphere] Waitlist Confirmation: ${event.title}`,
      htmlContent
    );
  } catch (error) {
    // Non-blocking: log the real Resend error but do not let email failure
    // roll back or reject the waitlist entry that already succeeded.
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

    await sendViaResend(
      user.email,
      `[EventSphere] Event Cancelled: ${event.title}`,
      htmlContent
    );
  } catch (error) {
    // Non-blocking: log the real Resend error but do not let email failure
    // roll back or reject the cancellation that already succeeded.
    console.error(`[Email Service] Failed to send event cancellation email to ${user?.email}:`, error.message);
  }
};

module.exports = {
  sendRSVPConfirmationEmail,
  sendWaitlistEmail,
  sendEventCancellationEmail,
};
