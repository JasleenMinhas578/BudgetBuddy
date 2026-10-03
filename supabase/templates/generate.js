// Generates the branded Supabase Auth email templates in this folder
// (confirm-signup.html, reset-password.html). They only take effect once
// pasted into Supabase → Authentication → Emails → Templates (or applied via
// the Management API) — Supabase allows editing them because the project
// uses custom SMTP. Run: node supabase/templates/generate.js
// Template variables ({{ .ConfirmationURL }}, {{ .Email }}, {{ .Data.name }})
// are filled in by Supabase when it sends the email.
const fs = require('fs');
// Email-safe HTML: tables + inline styles, no SVG/web fonts (Gmail strips them).
// The logo is a PNG render of src/components/UI/BudgetBuddyLogo.jsx, served
// from the live site (public/email-logo.png) because email clients block SVG.
const layout = ({ preheader, heading, body, button, footnote }) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>BudgetBuddy</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
      <tr><td style="background:#0f172a;padding:28px 32px;" align="left">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:middle;"><img src="https://budget-buddy-mun.vercel.app/email-logo.png" width="44" height="44" alt="BudgetBuddy" style="display:block;border:0;border-radius:12px;"></td>
          <td style="padding-left:12px;font-size:22px;font-weight:700;color:#f8fafc;letter-spacing:-0.3px;">Budget<span style="color:#4fd1c5;">Buddy</span></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:36px 32px 8px;">
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0f172a;">${heading}</h1>
        ${body}
      </td></tr>
      <tr><td style="padding:16px 32px 8px;">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="background:#4fd1c5;border-radius:10px;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#0f172a;text-decoration:none;">${button}</a>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:16px 32px 32px;">
        <p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:#64748b;">Button not working? Copy and paste this link into your browser:</p>
        <p style="margin:0;font-size:13px;line-height:1.5;word-break:break-all;"><a href="{{ .ConfirmationURL }}" style="color:#0d9488;">{{ .ConfirmationURL }}</a></p>
      </td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid #e2e8f0;">
        <p style="margin:0;font-size:12px;line-height:1.5;color:#94a3b8;">${footnote}</p>
      </td></tr>
    </table>
    <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;font-family:Inter,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">BudgetBuddy · <a href="https://budget-buddy-mun.vercel.app" style="color:#94a3b8;">budget-buddy-mun.vercel.app</a></p>
  </td></tr>
</table>
</body>
</html>
`;
const p = (t) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#334155;">${t}</p>`;
const greeting = '{{ if .Data.name }}Hi {{ .Data.name }},{{ else }}Hi there,{{ end }}';

const confirm = layout({
  preheader: 'Confirm your email to finish creating your BudgetBuddy account.',
  heading: 'Confirm your email',
  body: p(greeting) + p('Thanks for signing up for BudgetBuddy! Confirm that <strong>{{ .Email }}</strong> is your email address to finish creating your account and start tracking your spending.'),
  button: 'Confirm my email',
  footnote: 'This link expires in 1 hour. If you didn’t sign up for BudgetBuddy, you can safely ignore this email — no account will be created.',
});
const reset = layout({
  preheader: 'Use this link to choose a new BudgetBuddy password.',
  heading: 'Reset your password',
  body: p(greeting) + p('We received a request to reset the password for your BudgetBuddy account (<strong>{{ .Email }}</strong>). Click the button below to choose a new one.'),
  button: 'Choose a new password',
  footnote: 'This link expires in 1 hour and can only be used once. If you didn’t request a password reset, you can ignore this email — your password won’t change.',
});
fs.writeFileSync(__dirname + '/confirm-signup.html', confirm);
fs.writeFileSync(__dirname + '/reset-password.html', reset);
if (process.argv[2]) fs.writeFileSync(process.argv[2], JSON.stringify({
  mailer_subjects_confirmation: 'Confirm your BudgetBuddy account',
  mailer_templates_confirmation_content: confirm,
  mailer_subjects_recovery: 'Reset your BudgetBuddy password',
  mailer_templates_recovery_content: reset,
}));
console.log('written', confirm.length, reset.length);
