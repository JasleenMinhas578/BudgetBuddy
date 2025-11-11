# Firebase Password Reset Email Setup Guide

## Common Issue: Not Receiving Password Reset Emails

If you're not receiving password reset emails, follow these steps:

## 1. Configure Authorized Domains in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your domain:
   - For **local development**: Add `localhost` (should already be there)
   - For **production**: Add your actual domain (e.g., `yourdomain.com`, `your-app.vercel.app`)

## 2. Check Email Templates

1. In Firebase Console, go to **Authentication** → **Templates**
2. Click on **Password reset** template
3. Make sure the template is enabled
4. You can customize the email subject and body here
5. The action URL should point to your reset password page

## 3. For Custom Action URLs

If you're using a custom reset password page (like `/reset-password`):

1. In the **Password reset** email template, you can set a custom action URL
2. Or use the default Firebase hosted page (which will redirect to your app)
3. Make sure the URL format is: `https://yourdomain.com/reset-password`

## 4. Check Spam Folder

- Password reset emails sometimes go to spam
- Check your spam/junk folder
- Add Firebase emails to your contacts if needed

## 5. Verify Email Sending is Enabled

1. In Firebase Console, go to **Authentication** → **Settings**
2. Make sure **Email/Password** provider is enabled
3. Check that email sending is not blocked

## 6. Testing in Development

For local development (`localhost:3000`):
- Make sure `localhost` is in authorized domains
- The reset URL will be: `http://localhost:3000/reset-password`
- Firebase should automatically allow localhost

## 7. Check Browser Console

When you click "Send Reset Link", check the browser console for:
- Any error messages
- The email address being sent to
- The reset URL being used

## 8. Alternative: Use Firebase Default Email

If custom URLs don't work, you can temporarily remove the `actionCodeSettings` parameter to use Firebase's default email template, which will include a link to Firebase's hosted page that redirects to your app.

## Troubleshooting Steps

1. **Check console errors**: Open browser DevTools → Console tab
2. **Verify email exists**: Make sure the email address is registered in Firebase
3. **Check Firebase logs**: Go to Firebase Console → Functions → Logs (if using Cloud Functions)
4. **Test with a different email**: Try with a Gmail or other email provider
5. **Wait a few minutes**: Sometimes emails are delayed

## Quick Fix: Test Without Custom URL

To test if basic email sending works, you can temporarily modify the code to send without `actionCodeSettings`:

```javascript
// Temporary test - remove actionCodeSettings
await resetPassword(email);
```

If this works, the issue is with the custom URL configuration.

