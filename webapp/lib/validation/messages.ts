import { z } from "zod";

export const contactFormSchema = z.object({
  memberProfileId: z.string().uuid("Invalid therapist profile"),
  visitorName: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must be 50 characters or less")
    .trim(),
  visitorEmail: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must be 255 characters or less")
    .toLowerCase()
    .trim(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be 2000 characters or less")
    .trim(),
  honeypot: z.string().max(0, "Bot detected").optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const memberReplySchema = z.object({
  conversationId: z.string().uuid("Invalid conversation"),
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be 2000 characters or less")
    .trim(),
});

export type MemberReplyData = z.infer<typeof memberReplySchema>;

export const visitorReplySchema = z.object({
  conversationToken: z.string().min(1, "Invalid conversation token"),
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be 2000 characters or less")
    .trim(),
});

export type VisitorReplyData = z.infer<typeof visitorReplySchema>;

export const blockVisitorSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation"),
});

export type BlockVisitorData = z.infer<typeof blockVisitorSchema>;

export const reportConversationSchema = z.object({
  conversationId: z.string().uuid("Invalid conversation"),
  reason: z.string().max(500, "Reason must be 500 characters or less").optional(),
});

export type ReportConversationData = z.infer<typeof reportConversationSchema>;
