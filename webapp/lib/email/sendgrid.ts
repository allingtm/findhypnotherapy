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
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.error("Cannot send email: SENDGRID_API_KEY is not set");
    return false;
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

    await sgMail.send(mailData);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
