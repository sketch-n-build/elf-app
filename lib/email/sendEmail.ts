import { createTransport, TransportOptions } from "nodemailer";
import { createEmailTemplate } from "./emailTemplate";
import { EmailCredentials } from "../types/Email";

export const sendEmail = async ({
  email,
  subject,
  message,
  html,          // ← NEW: accept pre-built HTML from composers
  linkUrl    = "",
  linkLabel  = "Get Started",
  variant    = "default",
  firstName  = "",
  lastName   = "",
  senderEmail = "",
  metaLine,
  from       = "Eleje Legacy <no-reply@eleje.ng>",
}: EmailCredentials) => {

  /*
    Priority:
    1. If html is passed directly (from a composer like welcomeEmail),
       use it as-is — no need to rebuild.
    2. Otherwise fall back to building from individual fields,
       same as before.
  */
  const emailHtml = html ?? createEmailTemplate({
    subject,
    variant,
    message,
    linkUrl,
    linkLabel,
    firstName,
    lastName,
    email,
    senderEmail,
    metaLine,
  });

  try {
    const transporter = createTransport({
      service: process.env.SERVICE,
      host:    process.env.MAIL_HOST,
      port:    Number(process.env.MAIL_PORT),
      secure:  process.env.SECURE === "true",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    } as TransportOptions);

    const info = await transporter.sendMail({
      from,
      to:      email,
      subject,
      text:    message ?? subject,   // plain-text fallback for non-HTML clients
      html:    emailHtml,
    });

    return info;

  } catch (error) {
    throw error;
  }
};