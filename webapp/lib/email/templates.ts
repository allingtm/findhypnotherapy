const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

interface BaseEmailProps {
  recipientName: string;
}

function getEmailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Find Hypnotherapy</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Find Hypnotherapy</h1>
              </div>
              ${content}
              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;">
              <p style="color: #666666; font-size: 12px; text-align: center; margin: 0;">
                This email was sent by Find Hypnotherapy.<br>
                If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Email verification email sent to visitor after they submit a contact form
interface VerificationEmailProps extends BaseEmailProps {
  verificationToken: string;
  therapistName: string;
  messagePreview: string;
}

export function getVerificationEmail(props: VerificationEmailProps): { subject: string; html: string } {
  const verifyUrl = `${BASE_URL}/api/verify-email?token=${props.verificationToken}`;

  const content = `
    <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 20px;">Verify your email address</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Hi ${props.recipientName},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Please verify your email address to send your message to <strong>${props.therapistName}</strong>.
    </p>
    <div style="background-color: #f8f8f8; border-radius: 6px; padding: 16px; margin: 0 0 24px;">
      <p style="color: #666666; font-size: 14px; margin: 0 0 8px;"><strong>Your message:</strong></p>
      <p style="color: #333333; font-size: 14px; line-height: 1.5; margin: 0; font-style: italic;">
        "${props.messagePreview}${props.messagePreview.length >= 100 ? "..." : ""}"
      </p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px;">
        Verify Email &amp; Send Message
      </a>
    </div>
    <p style="color: #666666; font-size: 14px; text-align: center; margin: 0;">
      This link will expire in 24 hours.
    </p>
  `;

  return {
    subject: `Verify your email to contact ${props.therapistName}`,
    html: getEmailWrapper(content),
  };
}

// Notification email sent to member when they receive a new verified message
interface NewMessageEmailProps extends BaseEmailProps {
  visitorName: string;
  visitorEmail: string;
  messagePreview: string;
  conversationId: string;
}

export function getNewMessageEmail(props: NewMessageEmailProps): { subject: string; html: string } {
  const dashboardUrl = `${BASE_URL}/dashboard/messages/${props.conversationId}`;

  const content = `
    <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 20px;">You have a new message</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Hi ${props.recipientName},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      <strong>${props.visitorName}</strong> (${props.visitorEmail}) has sent you a message:
    </p>
    <div style="background-color: #f8f8f8; border-radius: 6px; padding: 16px; margin: 0 0 24px;">
      <p style="color: #333333; font-size: 14px; line-height: 1.5; margin: 0;">
        "${props.messagePreview}${props.messagePreview.length >= 100 ? "..." : ""}"
      </p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px;">
        View &amp; Reply
      </a>
    </div>
  `;

  return {
    subject: `New message from ${props.visitorName}`,
    html: getEmailWrapper(content),
  };
}

// Email sent to visitor when member replies
interface ReplyEmailProps extends BaseEmailProps {
  memberName: string;
  replyContent: string;
  conversationToken: string;
}

export function getReplyEmail(props: ReplyEmailProps): { subject: string; html: string } {
  const conversationUrl = `${BASE_URL}/conversation/${props.conversationToken}`;

  const content = `
    <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 20px;">${props.memberName} replied to your message</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Hi ${props.recipientName},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      <strong>${props.memberName}</strong> has replied to your message:
    </p>
    <div style="background-color: #f8f8f8; border-radius: 6px; padding: 16px; margin: 0 0 24px;">
      <p style="color: #333333; font-size: 14px; line-height: 1.5; margin: 0; white-space: pre-wrap;">${props.replyContent}</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${conversationUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px;">
        View Conversation &amp; Reply
      </a>
    </div>
  `;

  return {
    subject: `Reply from ${props.memberName}`,
    html: getEmailWrapper(content),
  };
}

// Email sent to member when visitor replies to the conversation
interface VisitorReplyEmailProps extends BaseEmailProps {
  visitorName: string;
  replyContent: string;
  conversationId: string;
}

export function getVisitorReplyEmail(props: VisitorReplyEmailProps): { subject: string; html: string } {
  const dashboardUrl = `${BASE_URL}/dashboard/messages/${props.conversationId}`;

  const content = `
    <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 20px;">New reply from ${props.visitorName}</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Hi ${props.recipientName},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      <strong>${props.visitorName}</strong> has replied to your conversation:
    </p>
    <div style="background-color: #f8f8f8; border-radius: 6px; padding: 16px; margin: 0 0 24px;">
      <p style="color: #333333; font-size: 14px; line-height: 1.5; margin: 0; white-space: pre-wrap;">${props.replyContent}</p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px;">
        View &amp; Reply
      </a>
    </div>
  `;

  return {
    subject: `Reply from ${props.visitorName}`,
    html: getEmailWrapper(content),
  };
}

// ========================================
// BOOKING EMAIL TEMPLATES
// ========================================

function formatBookingDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatBookingTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
}

// Email verification email sent to visitor after they book an appointment
interface BookingVerificationEmailProps extends BaseEmailProps {
  verificationToken: string;
  therapistName: string;
  bookingDate: string;
  startTime: string;
}

export function getBookingVerificationEmail(props: BookingVerificationEmailProps): { subject: string; html: string } {
  const verifyUrl = `${BASE_URL}/api/verify-booking?token=${props.verificationToken}`;

  const content = `
    <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 20px;">Confirm your booking</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Hi ${props.recipientName},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Please verify your email address to confirm your booking with <strong>${props.therapistName}</strong>.
    </p>
    <div style="background-color: #f8f8f8; border-radius: 6px; padding: 16px; margin: 0 0 24px;">
      <p style="color: #666666; font-size: 14px; margin: 0 0 8px;"><strong>Booking details:</strong></p>
      <p style="color: #333333; font-size: 14px; line-height: 1.5; margin: 0;">
        <strong>Date:</strong> ${formatBookingDate(props.bookingDate)}<br>
        <strong>Time:</strong> ${formatBookingTime(props.startTime)}
      </p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px;">
        Confirm Booking
      </a>
    </div>
    <p style="color: #666666; font-size: 14px; text-align: center; margin: 0;">
      This link will expire in 24 hours.
    </p>
  `;

  return {
    subject: `Confirm your booking with ${props.therapistName}`,
    html: getEmailWrapper(content),
  };
}

// Notification email sent to member when they receive a new verified booking
interface NewBookingNotificationEmailProps extends BaseEmailProps {
  visitorName: string;
  visitorEmail: string;
  bookingDate: string;
  startTime: string;
  bookingId: string;
}

export function getNewBookingNotificationEmail(props: NewBookingNotificationEmailProps): { subject: string; html: string } {
  const dashboardUrl = `${BASE_URL}/dashboard/bookings`;

  const content = `
    <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 20px;">New booking request</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Hi ${props.recipientName},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      <strong>${props.visitorName}</strong> (${props.visitorEmail}) has requested a booking:
    </p>
    <div style="background-color: #f8f8f8; border-radius: 6px; padding: 16px; margin: 0 0 24px;">
      <p style="color: #333333; font-size: 14px; line-height: 1.5; margin: 0;">
        <strong>Date:</strong> ${formatBookingDate(props.bookingDate)}<br>
        <strong>Time:</strong> ${formatBookingTime(props.startTime)}
      </p>
    </div>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${dashboardUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px;">
        View &amp; Confirm
      </a>
    </div>
    <p style="color: #666666; font-size: 14px; text-align: center; margin: 0;">
      Please confirm or decline this booking from your dashboard.
    </p>
  `;

  return {
    subject: `New booking from ${props.visitorName}`,
    html: getEmailWrapper(content),
  };
}

// Email sent to visitor when member confirms their booking
interface BookingConfirmedEmailProps extends BaseEmailProps {
  therapistName: string;
  bookingDate: string;
  startTime: string;
}

export function getBookingConfirmedEmail(props: BookingConfirmedEmailProps): { subject: string; html: string } {
  const content = `
    <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 20px;">Your booking is confirmed!</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Hi ${props.recipientName},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Great news! <strong>${props.therapistName}</strong> has confirmed your booking.
    </p>
    <div style="background-color: #dcfce7; border: 1px solid #86efac; border-radius: 6px; padding: 16px; margin: 0 0 24px;">
      <p style="color: #166534; font-size: 14px; margin: 0 0 8px; font-weight: 600;">Confirmed Appointment</p>
      <p style="color: #166534; font-size: 14px; line-height: 1.5; margin: 0;">
        <strong>Date:</strong> ${formatBookingDate(props.bookingDate)}<br>
        <strong>Time:</strong> ${formatBookingTime(props.startTime)}
      </p>
    </div>
    <p style="color: #666666; font-size: 14px; margin: 0;">
      We recommend adding this to your calendar. If you need to reschedule or cancel, please contact ${props.therapistName} directly.
    </p>
  `;

  return {
    subject: `Booking confirmed with ${props.therapistName}`,
    html: getEmailWrapper(content),
  };
}

// Email sent to visitor when therapist cancels their booking
interface BookingCancelledEmailProps extends BaseEmailProps {
  therapistName: string;
  bookingDate: string;
  startTime: string;
  reason?: string;
}

export function getBookingCancelledEmail(props: BookingCancelledEmailProps): { subject: string; html: string } {
  const content = `
    <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 20px;">Your booking has been cancelled</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Hi ${props.recipientName},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      We're sorry to inform you that <strong>${props.therapistName}</strong> has cancelled your booking.
    </p>
    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin: 0 0 24px;">
      <p style="color: #991b1b; font-size: 14px; margin: 0 0 8px; font-weight: 600;">Cancelled Appointment</p>
      <p style="color: #991b1b; font-size: 14px; line-height: 1.5; margin: 0;">
        <strong>Date:</strong> ${formatBookingDate(props.bookingDate)}<br>
        <strong>Time:</strong> ${formatBookingTime(props.startTime)}
      </p>
      ${props.reason ? `<p style="color: #991b1b; font-size: 14px; line-height: 1.5; margin: 12px 0 0 0;"><strong>Reason:</strong> ${props.reason}</p>` : ""}
    </div>
    <p style="color: #666666; font-size: 14px; margin: 0;">
      We apologise for any inconvenience. You can visit the therapist's profile to book a new appointment at a different time.
    </p>
  `;

  return {
    subject: `Booking cancelled - ${formatBookingDate(props.bookingDate)}`,
    html: getEmailWrapper(content),
  };
}

// Booking reminder email sent to visitor
interface BookingReminderEmailProps extends BaseEmailProps {
  therapistName: string;
  bookingDate: string;
  startTime: string;
  reminderType: "24h" | "1h";
}

export function getBookingReminderEmail(props: BookingReminderEmailProps): { subject: string; html: string } {
  const timeUntil = props.reminderType === "24h" ? "tomorrow" : "in 1 hour";
  const urgency = props.reminderType === "1h" ? "starting soon" : "coming up";

  const content = `
    <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 20px;">Appointment Reminder</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Hi ${props.recipientName},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      This is a friendly reminder that your appointment with <strong>${props.therapistName}</strong> is ${urgency}.
    </p>
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin: 0 0 24px;">
      <p style="color: #1e40af; font-size: 14px; margin: 0 0 8px; font-weight: 600;">Your Appointment</p>
      <p style="color: #1e40af; font-size: 14px; line-height: 1.5; margin: 0;">
        <strong>Date:</strong> ${formatBookingDate(props.bookingDate)}<br>
        <strong>Time:</strong> ${formatBookingTime(props.startTime)}
      </p>
    </div>
    <p style="color: #666666; font-size: 14px; margin: 0;">
      If you need to reschedule or cancel, please contact ${props.therapistName} as soon as possible.
    </p>
  `;

  const subjectPrefix = props.reminderType === "1h" ? "Starting soon" : "Reminder";

  return {
    subject: `${subjectPrefix}: Appointment ${timeUntil} with ${props.therapistName}`,
    html: getEmailWrapper(content),
  };
}

// Booking reminder email sent to therapist
interface TherapistBookingReminderEmailProps extends BaseEmailProps {
  visitorName: string;
  visitorEmail: string;
  bookingDate: string;
  startTime: string;
  reminderType: "24h" | "1h";
}

export function getTherapistBookingReminderEmail(props: TherapistBookingReminderEmailProps): { subject: string; html: string } {
  const timeUntil = props.reminderType === "24h" ? "tomorrow" : "in 1 hour";
  const urgency = props.reminderType === "1h" ? "starting soon" : "coming up";

  const content = `
    <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 20px;">Appointment Reminder</h2>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      Hi ${props.recipientName},
    </p>
    <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
      This is a reminder that you have an appointment ${urgency} with <strong>${props.visitorName}</strong>.
    </p>
    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 16px; margin: 0 0 24px;">
      <p style="color: #1e40af; font-size: 14px; margin: 0 0 8px; font-weight: 600;">Appointment Details</p>
      <p style="color: #1e40af; font-size: 14px; line-height: 1.5; margin: 0;">
        <strong>Client:</strong> ${props.visitorName}<br>
        <strong>Email:</strong> ${props.visitorEmail}<br>
        <strong>Date:</strong> ${formatBookingDate(props.bookingDate)}<br>
        <strong>Time:</strong> ${formatBookingTime(props.startTime)}
      </p>
    </div>
  `;

  const subjectPrefix = props.reminderType === "1h" ? "Starting soon" : "Reminder";

  return {
    subject: `${subjectPrefix}: Client appointment ${timeUntil}`,
    html: getEmailWrapper(content),
  };
}
