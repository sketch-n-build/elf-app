// import { EmailTemplate, EmailVariant } from "../types/email";

import { EmailTemplate, EmailVariant } from "../types/Email";

/* ─── Brand tokens (inline — email clients strip <style> blocks) ──────── */
const C = {
  deep:    "#064E38",
  emerald: "#0D6E4F",
  mid:     "#10B981",
  glow:    "#34D399",
  pale:    "#A8E6D8",
  gold:    "#C9A84C",
  goldLt:  "#E8C97A",
  ink:     "#0C1810",
  cream:   "#FAF6EF",
  warm:    "#F0F7F3",
  warm2:   "#E4F0EB",
  grey:    "#4A6458",
  mgrey:   "#8AA899",
  border:  "#C4DDD5",
};

/* ─── Variant config ──────────────────────────────────────── */
interface VariantConfig {
  badge:      string;
  accentLine: string; // gradient for the bottom accent bar of header
  ctaBg:      string;
  ctaColor:   string;
}

function getVariantConfig(variant: EmailVariant = "default"): VariantConfig {
  const configs: Record<EmailVariant, VariantConfig> = {
    default: {
      badge:      "Notification",
      accentLine: `linear-gradient(90deg, ${C.emerald}, ${C.glow})`,
      ctaBg:      C.deep,
      ctaColor:   C.cream,
    },
    welcome: {
      badge:      "Welcome",
      accentLine: `linear-gradient(90deg, ${C.mid}, ${C.glow})`,
      ctaBg:      C.gold,
      ctaColor:   C.ink,
    },
    verification: {
      badge:      "Verify Email",
      accentLine: `linear-gradient(90deg, ${C.emerald}, ${C.glow})`,
      ctaBg:      C.emerald,
      ctaColor:   "#ffffff",
    },
    reset: {
      badge:      "Password Reset",
      accentLine: `linear-gradient(90deg, ${C.deep}, ${C.emerald})`,
      ctaBg:      C.deep,
      ctaColor:   C.cream,
    },
    donation: {
      badge:      "Donation Received",
      accentLine: `linear-gradient(90deg, ${C.gold}, ${C.goldLt})`,
      ctaBg:      C.gold,
      ctaColor:   C.ink,
    },
    project: {
      badge:      "Project Update",
      accentLine: `linear-gradient(90deg, ${C.deep}, ${C.mid})`,
      ctaBg:      C.deep,
      ctaColor:   C.cream,
    },
    alert: {
      badge:      "Alert",
      accentLine: `linear-gradient(90deg, #7C3A1A, #C9A84C)`,
      ctaBg:      "#7C3A1A",
      ctaColor:   "#ffffff",
    },
  };
  return configs[variant] ?? configs.default;
}

/* ─── SVG logo (inline, no external request needed) ──────── */
const LOGO_SVG = `
<svg width="40" height="46" viewBox="0 0 60 68" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="38" cy="10" r="9" fill="${C.glow}"/>
  <path d="M29 18C38 22 47 32 48 44C50 59 42 72 31 74C22 76 14 71 11 63C18 67 28 66 33 59C40 50 40 36 34 24C29 14 20 10 14 9C20 6 25 12 29 18Z" fill="${C.pale}"/>
  <circle cx="16" cy="24" r="7.5" fill="${C.mid}"/>
  <path d="M9 31C3 38 1 49 4 59C7 67 14 73 22 73C25 64 26 52 27 42C26 32 19 27 9 31Z" fill="${C.glow}"/>
</svg>
`.trim();

/* ─── Main template function ──────────────────────────────── */
export function createEmailTemplate({
  subject,
  variant = "default",
  message,
  linkUrl,
  linkLabel = "Get Started",
  firstName,
  lastName,
  email,
  senderFirstName,
  senderLastName,
  senderEmail,
  metaLine,
}: EmailTemplate): string {

  const vc          = getVariantConfig(variant);
  const displayName = firstName || "there";
  const hasSender   = senderEmail || senderFirstName || senderLastName;
  const senderName  = [senderFirstName, senderLastName].filter(Boolean).join(" ");
  const year        = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="
  margin:0;
  padding:0;
  background-color:${C.warm};
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
  -webkit-font-smoothing:antialiased;
">

<!-- Outer wrapper -->
<table width="100%" cellpadding="0" cellspacing="0" border="0"
  style="background-color:${C.warm};padding:40px 16px;">
  <tr>
    <td align="center">

      <!-- Email card -->
      <table width="100%" cellpadding="0" cellspacing="0" border="0"
        style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${C.border};box-shadow:0 12px 40px rgba(6,78,56,0.10);">

        <!-- ── HEADER ─────────────────────────────────────── -->
        <tr>
          <td style="
            background:linear-gradient(155deg,${C.ink} 0%,${C.deep} 100%);
            padding:44px 44px 36px;
            text-align:center;
            position:relative;
          ">

            <!-- Logo mark -->
            <div style="margin-bottom:18px;display:inline-block;">
              ${LOGO_SVG}
            </div>

            <!-- Brand wordmark -->
            <div style="margin-bottom:20px;">
              <div style="
                font-family:Georgia,'Times New Roman',Times,serif;
                font-size:22px;
                font-weight:700;
                color:${C.pale};
                letter-spacing:0.12em;
                line-height:1;
              ">ELEJE</div>
              <div style="
                font-size:9px;
                letter-spacing:0.55em;
                text-transform:uppercase;
                color:${C.glow};
                margin-top:3px;
              ">Legacy</div>
            </div>

            <!-- Eyebrow badge -->
            <div style="
              display:inline-block;
              padding:5px 14px;
              border:1px solid rgba(52,211,153,0.3);
              border-radius:2px;
              font-size:10px;
              letter-spacing:0.32em;
              text-transform:uppercase;
              color:${C.glow};
              margin-bottom:16px;
            ">${vc.badge}</div>

            <!-- Subject / heading -->
            <h1 style="
              margin:0;
              font-family:Georgia,'Times New Roman',Times,serif;
              font-size:28px;
              font-weight:700;
              color:${C.cream};
              line-height:1.15;
              letter-spacing:-0.01em;
            ">${subject}</h1>

            <!-- Accent line -->
            <div style="
              height:2px;
              width:48px;
              margin:18px auto 0;
              background:${vc.accentLine};
              border-radius:2px;
            "></div>
          </td>
        </tr>

        <!-- ── SENDER INFO (conditional) ──────────────────── -->
        ${hasSender ? `
        <tr>
          <td style="
            padding:16px 44px;
            background-color:${C.warm2};
            border-bottom:1px solid ${C.border};
          ">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <!-- Avatar initials -->
                <td width="36" valign="middle">
                  <div style="
                    width:36px;
                    height:36px;
                    border-radius:50%;
                    background:linear-gradient(135deg,${C.deep},${C.emerald});
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-family:Georgia,serif;
                    font-size:13px;
                    font-weight:700;
                    color:#fff;
                    text-align:center;
                    line-height:36px;
                  ">${senderFirstName ? senderFirstName[0] : ""}${senderLastName ? senderLastName[0] : ""}</div>
                </td>
                <td style="padding-left:10px;" valign="middle">
                  <div style="font-size:12px;font-weight:600;color:${C.deep};">
                    ${senderName || "Eleje Legacy Team"}
                  </div>
                  ${senderEmail ? `<div style="font-size:11px;color:${C.mgrey};margin-top:1px;">${senderEmail}</div>` : ""}
                </td>
                <td align="right" valign="middle">
                  <div style="
                    font-size:9px;
                    letter-spacing:0.22em;
                    text-transform:uppercase;
                    color:${C.mgrey};
                    border:1px solid ${C.border};
                    padding:3px 8px;
                    border-radius:2px;
                  ">Message</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ""}

        <!-- ── GREETING ────────────────────────────────────── -->
        <tr>
          <td style="padding:36px 44px 0;">
            <!-- Eyebrow dash -->
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
              <tr>
                <td style="width:24px;height:1px;background-color:${C.mid};font-size:0;line-height:0;">&nbsp;</td>
                <td style="padding-left:10px;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:${C.mid};">
                  Personal Message
                </td>
              </tr>
            </table>

            <p style="
              margin:0;
              font-family:Georgia,'Times New Roman',Times,serif;
              font-size:22px;
              font-weight:700;
              color:${C.deep};
              line-height:1.3;
            ">Dear ${displayName},</p>
          </td>
        </tr>

        <!-- ── MAIN MESSAGE ────────────────────────────────── -->
        ${message ? `
        <tr>
          <td style="padding:20px 44px 32px;">
            <div style="
              font-size:15px;
              line-height:1.9;
              color:${C.grey};
              font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
            ">
              ${message}
            </div>
          </td>
        </tr>
        ` : ""}

        <!-- ── META LINE (optional detail) ─────────────────── -->
        ${metaLine ? `
        <tr>
          <td style="padding:0 44px 28px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td style="
                  padding:14px 18px;
                  background-color:${C.warm};
                  border-left:3px solid ${C.gold};
                  border-radius:0 8px 8px 0;
                  font-size:13px;
                  color:${C.deep};
                  font-weight:500;
                ">${metaLine}</td>
              </tr>
            </table>
          </td>
        </tr>
        ` : ""}

        <!-- ── CTA BUTTON ──────────────────────────────────── -->
        ${linkUrl ? `
        <tr>
          <td style="
            padding:8px 44px 36px;
            text-align:center;
            background-color:${C.warm};
            border-top:1px solid ${C.border};
            border-bottom:1px solid ${C.border};
          ">
            <p style="
              margin:0 0 20px;
              font-size:12px;
              letter-spacing:0.15em;
              text-transform:uppercase;
              color:${C.mgrey};
            ">Take action</p>
            <a href="${linkUrl}"
              style="
                display:inline-block;
                padding:14px 36px;
                background-color:${vc.ctaBg};
                color:${vc.ctaColor};
                text-decoration:none;
                font-size:11px;
                font-weight:600;
                letter-spacing:0.22em;
                text-transform:uppercase;
                border-radius:4px;
                border:none;
              "
            >${linkLabel}</a>
            <p style="
              margin:16px 0 0;
              font-size:11px;
              color:${C.mgrey};
            ">Or copy this link: <span style="color:${C.emerald};">${linkUrl}</span></p>
          </td>
        </tr>
        ` : ""}

        <!-- ── SIGNATURE ───────────────────────────────────── -->
        <tr>
          <td style="padding:32px 44px;">
            <p style="
              margin:0 0 4px;
              font-size:14px;
              color:${C.grey};
              line-height:1.8;
            ">With care,</p>
            <p style="
              margin:0;
              font-family:Georgia,'Times New Roman',Times,serif;
              font-size:17px;
              font-weight:700;
              color:${C.deep};
            ">The Eleje Legacy Team</p>
            <p style="
              margin:4px 0 0;
              font-size:11px;
              letter-spacing:0.22em;
              text-transform:uppercase;
              color:${C.mgrey};
            ">Onitsha, Anambra · Nigeria</p>
          </td>
        </tr>

        <!-- ── FOOTER ──────────────────────────────────────── -->
        <tr>
          <td style="
            background-color:${C.ink};
            padding:28px 44px;
            border-top:1px solid rgba(52,211,153,0.09);
          ">
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                <td>
                  <!-- Accent rule -->
                  <div style="
                    width:36px;
                    height:2px;
                    background:linear-gradient(90deg,${C.emerald},${C.glow});
                    border-radius:2px;
                    margin-bottom:16px;
                  "></div>

                  <!-- Footer links row -->
                  <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
                    <tr>
                      ${["About", "Programmes", "Donate", "Contact"].map((label, i) => `
                      <td style="padding-right:${i < 3 ? "18px" : "0"};">
                        <a href="#" style="
                          font-size:10px;
                          letter-spacing:0.22em;
                          text-transform:uppercase;
                          color:rgba(168,230,216,0.4);
                          text-decoration:none;
                        ">${label}</a>
                      </td>`).join("")}
                    </tr>
                  </table>

                  <!-- Copyright -->
                  <p style="
                    margin:0;
                    font-size:11px;
                    color:rgba(250,246,239,0.22);
                    line-height:1.7;
                  ">© ${year} Eleje Legacy. All rights reserved.<br>
                  Registered NGO · Anambra State, Nigeria</p>

                  <!-- Unsubscribe -->
                  <p style="
                    margin:12px 0 0;
                    font-size:10px;
                    color:rgba(250,246,239,0.15);
                  ">This email was sent to <span style="color:rgba(168,230,216,0.3);">${email}</span>.
                  If you did not expect this email, you can safely ignore it.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
      <!-- /Email card -->

    </td>
  </tr>
</table>
<!-- /Outer wrapper -->

</body>
</html>`;
}