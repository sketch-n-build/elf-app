// import { createEmailTemplate } from "./email-template";

import { createEmailTemplate } from "./emailTemplate";

/* ─────────────────────────────────────────────────────────────
   Ready-to-send email composers.
   Each function returns a { subject, html } object you can
   pass directly to your mailer (Resend, Nodemailer, etc.)

   Usage:
     const { subject, html } = welcomeEmail({ firstName: "Amara", ... });
     await resend.emails.send({ to: user.email, subject, html });
─────────────────────────────────────────────────────────────── */

interface BaseUser {
  firstName: string;
  lastName:  string;
  email:     string;
}

/* ── 1. Welcome email ────────────────────────────────────────── */
export function welcomeEmail(user: BaseUser) {
  const subject = "Welcome to Eleje Legacy";
  return {
    subject,
    html: createEmailTemplate({
      subject,
      variant:   "welcome",
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      message: `
        <p>We're so glad you're here.</p>
        <p>Your account has been created and you now have access to the Eleje Legacy platform. Whether you're here to support a project, follow our work, or contribute as a team member — you're now part of something that matters.</p>
        <p>Take a moment to explore our active projects and see where your support can make the greatest difference.</p>
      `,
      linkUrl:   `${process.env.NEXT_PUBLIC_APP_URL}/projects`,
      linkLabel: "Explore Projects",
      metaLine:  `Your account was created with the email address: <strong>${user.email}</strong>`,
    }),
  };
}

/* ── 2. Email verification ───────────────────────────────────── */
export function verifyEmailEmail(user: BaseUser, verifyUrl: string) {
  const subject = "Please verify your email";
  return {
    subject,
    html: createEmailTemplate({
      subject,
      variant:   "verification",
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      message: `
        <p>Before you get started, we need to verify that this email address belongs to you.</p>
        <p>Click the button below to confirm your email. This link will expire in <strong>24 hours</strong>.</p>
        <p>If you did not create an account with Eleje Legacy, please ignore this email.</p>
      `,
      linkUrl:   verifyUrl,
      linkLabel: "Verify My Email",
      metaLine:  "This verification link expires in 24 hours.",
    }),
  };
}

/* ── 3. Password reset ───────────────────────────────────────── */
export function passwordResetEmail(user: BaseUser, resetUrl: string) {
  const subject = "Reset your password";
  return {
    subject,
    html: createEmailTemplate({
      subject,
      variant:   "reset",
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      message: `
        <p>We received a request to reset the password on your Eleje Legacy account.</p>
        <p>Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.</p>
        <p>If you did not request a password reset, no action is needed — your account is still secure.</p>
      `,
      linkUrl:   resetUrl,
      linkLabel: "Reset Password",
      metaLine:  "For security, this reset link expires in 1 hour.",
    }),
  };
}

/* ── 4. Donation receipt ─────────────────────────────────────── */
interface DonationReceiptParams extends BaseUser {
  amount:      number;
  currency?:   string;
  reference:   string;
  projectTitle?: string;
}

export function donationReceiptEmail({
  firstName,
  lastName,
  email,
  amount,
  currency = "NGN",
  reference,
  projectTitle,
}: DonationReceiptParams) {
  const formatted = new Intl.NumberFormat("en-NG", {
    style:    "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);

  const subject = `Donation confirmed — ${formatted}`;
  return {
    subject,
    html: createEmailTemplate({
      subject,
      variant:   "donation",
      firstName,
      lastName,
      email,
      message: `
        <p>Your donation has been received and confirmed. Thank you — this is what generational change looks like.</p>
        <p>100% of your gift goes directly to programme delivery. No overhead, no waste.</p>
        ${projectTitle
          ? `<p>Your contribution will support: <strong>${projectTitle}</strong></p>`
          : `<p>Your contribution will be allocated to wherever the need is greatest.</p>`}
        <p>We'll send you a programme update so you can see the real-world impact of your gift.</p>
      `,
      linkUrl:   `${process.env.NEXT_PUBLIC_APP_URL}/donate`,
      linkLabel: "Give Again",
      metaLine: `
        <strong>Amount:</strong> ${formatted} &nbsp;·&nbsp;
        <strong>Reference:</strong> ${reference} &nbsp;·&nbsp;
        <strong>Status:</strong> Confirmed
      `,
    }),
  };
}

/* ── 5. Project update notification ─────────────────────────── */
interface ProjectUpdateParams extends BaseUser {
  projectTitle:  string;
  projectSlug:   string;
  updateTitle:   string;
  updateContent: string;
}

export function projectUpdateEmail({
  firstName,
  lastName,
  email,
  projectTitle,
  projectSlug,
  updateTitle,
  updateContent,
}: ProjectUpdateParams) {
  const subject = `Update: ${projectTitle}`;
  return {
    subject,
    html: createEmailTemplate({
      subject,
      variant:   "project",
      firstName,
      lastName,
      email,
      message: `
        <p>There's a new update on a project you're following.</p>
        <p style="font-weight:600;">${updateTitle}</p>
        <p>${updateContent}</p>
      `,
      linkUrl:   `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectSlug}`,
      linkLabel: "View Full Update",
      metaLine:  `Project: <strong>${projectTitle}</strong>`,
    }),
  };
}

/* ── 6. Contact form message forward ────────────────────────── */
interface ContactForwardParams {
  /** The staff/admin receiving the forwarded message */
  recipient:    BaseUser;
  /** The person who filled in the contact form */
  senderName:   string;
  senderEmail:  string;
  subject:      string;
  messageBody:  string;
}

export function contactForwardEmail({
  recipient,
  senderName,
  senderEmail,
  subject,
  messageBody,
}: ContactForwardParams) {
  const emailSubject = `Contact form: ${subject}`;
  return {
    subject: emailSubject,
    html: createEmailTemplate({
      subject:          emailSubject,
      variant:          "default",
      firstName:        recipient.firstName,
      lastName:         recipient.lastName,
      email:            recipient.email,
      senderFirstName:  senderName.split(" ")[0],
      senderLastName:   senderName.split(" ").slice(1).join(" "),
      senderEmail,
      message: `
        <p>A new message has been submitted through the Eleje Legacy contact form.</p>
        <p>${messageBody}</p>
      `,
      linkUrl:   `${process.env.NEXT_PUBLIC_APP_URL}/contact`,
      linkLabel: "View Dashboard",
      metaLine:  `Subject: <strong>${subject}</strong> · From: <strong>${senderName}</strong>`,
    }),
  };
}