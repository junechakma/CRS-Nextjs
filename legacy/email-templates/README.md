# Email Templates Configuration Guide

This folder contains custom email templates for the CRS (Course Response System) designed with your brand colors.

## Templates Available

1. **email-confirmation.html** - Email confirmation/verification template
2. **password-reset.html** - Password reset request template

## Theme Colors Used

- Primary: `#1183f6` (Blue)
- Primary Hover: `#0f73d6` (Darker Blue)
- Primary Light: `#e6f2ff` (Light Blue)
- Background: `#f9fafb` (Light Gray)

## How to Configure in Supabase

### Step 1: Access Email Templates

1. Go to your Supabase Dashboard: https://app.supabase.com/project/fkcrxrddbczwksmqlekf
2. Navigate to **Authentication** → **Email Templates**

### Step 2: Configure Password Reset Email

1. Find the **"Reset Password"** template
2. Click on it to edit
3. Replace the default template with the contents of `password-reset.html`
4. Make sure the `{{ .ConfirmationURL }}` variable is preserved in the template
5. Click **Save**

### Step 3: Configure Email Confirmation

1. Find the **"Confirm Email"** or **"Confirm Signup"** template
2. Click on it to edit
3. Replace the default template with the contents of `email-confirmation.html`
4. Make sure the `{{ .ConfirmationURL }}` variable is preserved in the template
5. Click **Save**

## Template Variables

Supabase provides these variables that you can use in your templates:

- `{{ .ConfirmationURL }}` - The confirmation/reset link
- `{{ .Token }}` - The verification token (if needed separately)
- `{{ .Email }}` - The user's email address
- `{{ .SiteURL }}` - Your site URL (configured in Supabase)

## Testing

After configuring:

1. **Test Password Reset:**
   - Go to `/forgot-password` page
   - Enter a valid email address
   - Check the email inbox for the new styled template

2. **Test Email Confirmation:**
   - Create a new user account
   - Check the email inbox for the confirmation email
   - Verify the link redirects to the correct page

## Important Notes

1. **Redirect URLs:**
   - Make sure `https://classresponse.com/**` is added to the allowed redirect URLs in Supabase
   - Path: Authentication → URL Configuration → Redirect URLs

2. **Email Settings:**
   - Verify your email provider is properly configured
   - Check spam/junk folders if emails aren't arriving

3. **Mobile Responsive:**
   - Both templates are fully responsive and look great on mobile devices

4. **Email Client Compatibility:**
   - Templates use inline styles for maximum compatibility
   - Tested with Gmail, Outlook, Apple Mail, and other major email clients

## Customization

To customize the templates further:

1. **Change Colors:** Update the hex color codes in the `<style>` section
2. **Add Logo:** Add an `<img>` tag in the email header with your logo URL
3. **Modify Text:** Update the copy to match your brand voice
4. **Add Footer Links:** Add social media or help desk links in the footer

## Support

If you encounter any issues:
- Verify the template syntax is correct
- Check Supabase logs for email delivery errors
- Ensure redirect URLs are properly configured
