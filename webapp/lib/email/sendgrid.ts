import sgMail from "@sendgrid/mail";

if (!process.env.SENDGRID_API_KEY) {
  console.warn("SENDGRID_API_KEY is not set - emails will not be sent");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || "noreply@findhypnotherapy.com";
const FROM_NAME = "Find Hypnotherapy";

export interface EmailAttachment {
  content: string; // Base64 encoded content
  filename: string;
  type: string; // MIME type
  disposition?: "attachment" | "inline";
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachment[];
  messageId?: string; // Internal message ID for tracking via webhooks
}

export interface EmailResult {
  success: boolean;
  sgMessageId?: string; // SendGrid's message ID for tracking
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error("Cannot send email: SENDGRID_API_KEY is not set");
    return { success: false };
  }

  try {
    const mailData: sgMail.MailDataRequired = {
      to: options.to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
      // Include message ID as custom arg for webhook tracking
      ...(options.messageId && {
        customArgs: {
          message_id: options.messageId,
        },
      }),
    };

    // Add attachments if provided
    if (options.attachments && options.attachments.length > 0) {
      mailData.attachments = options.attachments.map((att) => ({
        content: att.content,
        filename: att.filename,
        type: att.type,
        disposition: att.disposition || "attachment",
      }));
    }

    const [response] = await sgMail.send(mailData);
    const sgMessageId = response?.headers?.["x-message-id"];

    return {
      success: true,
      sgMessageId: sgMessageId || undefined,
    };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false };
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
