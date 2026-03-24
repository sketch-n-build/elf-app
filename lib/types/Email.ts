// import { EmailVariant } from "./email";
/* ─────────────────────────────────────────────────────────────
   Email template types — aligned with Prisma User model
───────────────────────────────────────────────────────────── */

export type EmailVariant =
  | "default"        // generic notification
  | "welcome"        // new account created
  | "verification"   // email verify link
  | "reset"          // password reset link
  | "donation"       // donation receipt
  | "project"        // project update notification
  | "alert";         // admin / system alert

export interface EmailTemplate {
  /** Email subject line — also shown as the hero heading */
  subject: string;

  /** Variant controls the accent colour and badge label */
  variant?: EmailVariant;

  /** Main body text. Supports basic HTML (<p>, <strong>, <br>) */
  message?: string;

  /** CTA button URL */
  linkUrl?: string;

  /** CTA button label. Defaults to "Get Started" */
  linkLabel?: string;

  // ── Recipient (from User model) ──────────────────────────
  firstName: string;
  lastName:  string;
  email:     string;

  // ── Optional sender context ──────────────────────────────
  /** Used when the email is triggered by another user action (e.g. contact form) */
  senderFirstName?: string;
  senderLastName?:  string;
  senderEmail?:     string;

  /** Extra detail line shown under the CTA (e.g. donation amount, project name) */
  metaLine?: string;
}


/* ─────────────────────────────────────────────────────────────
   EmailCredentials — the shape accepted by sendEmail().

   When calling via a composer (welcomeEmail, donationReceiptEmail
   etc.), you only need: email, subject, html, and optionally from.

   When calling sendEmail() directly (old pattern), pass the
   individual fields and the template is built for you.
─────────────────────────────────────────────────────────────── */
export interface EmailCredentials {
  // ── Required ────────────────────────────────────────────────
  email:   string;
  subject: string;

  // ── Pre-built HTML (from a composer) ────────────────────────
  /** Pass this to skip template building entirely. */
  html?: string;

  // ── Template fields (used when html is NOT provided) ────────
  variant?:    EmailVariant;
  message?:    string;
  linkUrl?:    string;
  linkLabel?:  string;
  firstName?:  string;
  lastName?:   string;
  senderEmail?: string;
  metaLine?:   string;

  // ── Mailer ──────────────────────────────────────────────────
  /** Defaults to "Eleje Legacy <no-reply@eleje.ng>" */
  from?: string;
}