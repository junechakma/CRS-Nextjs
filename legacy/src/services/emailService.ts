import emailjs from '@emailjs/browser';

export interface SendEmailResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

export class EmailService {
  private static SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
  private static TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
  private static UNIVERSITY_APPROVAL_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_UNIVERSITY_APPROVAL_TEMPLATE_ID || '';
  private static PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

  /**
   * Initialize EmailJS (call this once in your app)
   */
  static init() {
    if (this.PUBLIC_KEY) {
      emailjs.init(this.PUBLIC_KEY);
    }
  }

  /**
   * Send new password email using EmailJS
   */
  static async sendNewPasswordEmail(
    userEmail: string,
    userName: string,
    newPassword: string
  ): Promise<SendEmailResponse> {
    try {
      if (!this.SERVICE_ID || !this.TEMPLATE_ID || !this.PUBLIC_KEY) {
        return {
          success: false,
          message: 'EmailJS is not configured. Please check your environment variables.'
        };
      }
      
      console.log('Sending email to:', userEmail);
      console.log('Template params:', {
        to_email: userEmail,
        to_name: userName || 'User'
      });
      
      const templateParams = {
        to_email: userEmail,
        to_name: userName || 'User',
        email: userEmail, // Most common parameter name
        subject: 'New Password - CRS System',
        link: `Your new password is: ${newPassword}`,
        message: `Hello ${userName || 'User'},\n\nYour password has been reset for your CRS System account.\n\nYour new password is: ${newPassword}\n\nPlease log in with this password and change it immediately for security reasons.\n\nLogin at: ${window.location.origin}/login\n\nIf you did not request this password reset, please contact support immediately.\n\nBest regards,\nCRS System Team`,
        new_password: newPassword,
        login_url: `${window.location.origin}/login`
      };

      const result = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams
      );

      return {
        success: true,
        message: 'New password email sent successfully',
        messageId: result.text
      };

    } catch (error: any) {
      console.error('EmailJS error:', error);
      return {
        success: false,
        message: 'Failed to send email. Please try again later.',
      };
    }
  }

  /**
   * Send password change notification (optional)
   */
  static async sendPasswordChangeNotification(
    userEmail: string,
    userName: string
  ): Promise<SendEmailResponse> {
    try {
      if (!this.SERVICE_ID || !this.TEMPLATE_ID || !this.PUBLIC_KEY) {
        return {
          success: false,
          message: 'EmailJS is not configured.'
        };
      }

      const templateParams = {
        to_email: userEmail,
        to_name: userName || 'User',
        subject: 'Password Changed Successfully - CRS System',
        message: `Hello ${userName || 'User'},\n\nYour password has been successfully changed for your CRS System account.\n\nIf you did not make this change, please contact your system administrator immediately.\n\nBest regards,\nCRS System Team`
      };

      const result = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams
      );

      return {
        success: true,
        message: 'Password change notification sent successfully',
        messageId: result.text
      };

    } catch (error: any) {
      console.error('EmailJS notification error:', error);
      return {
        success: false,
        message: 'Failed to send notification email.',
      };
    }
  }

  /**
   * Send university approval request notification to super admin
   */
  static async sendUniversityApprovalNotification(
    superAdminEmail: string,
    universityName: string,
    adminName: string,
    adminEmail: string,
    universityCode?: string
  ): Promise<SendEmailResponse> {
    try {
      if (!this.SERVICE_ID || !this.UNIVERSITY_APPROVAL_TEMPLATE_ID || !this.PUBLIC_KEY) {
        return {
          success: false,
          message: 'EmailJS is not configured. Please check your environment variables.'
        };
      }

      const templateParams = {
        to_email: superAdminEmail,
        to_name: 'Super Admin',
        email: superAdminEmail,
        subject: 'New University Approval Request - CRS System',
        message: `Hello Super Admin,\n\nA new university approval request has been submitted:\n\nUniversity Details:\n- Name: ${universityName}\n- Code: ${universityCode || 'N/A'}\n- Admin Name: ${adminName}\n- Admin Email: ${adminEmail}\n\nPlease review and approve/reject this request in the Super Admin Dashboard.\n\nLogin to review: ${window.location.origin}/super-admin\n\nBest regards,\nCRS System`,
        university_name: universityName,
        university_code: universityCode || 'N/A',
        admin_name: adminName,
        admin_email: adminEmail,
        dashboard_url: `${window.location.origin}/super-admin`
      };

      const result = await emailjs.send(
        this.SERVICE_ID,
        this.UNIVERSITY_APPROVAL_TEMPLATE_ID,
        templateParams
      );

      return {
        success: true,
        message: 'University approval notification sent successfully',
        messageId: result.text
      };

    } catch (error: any) {
      console.error('EmailJS university notification error:', error);
      return {
        success: false,
        message: 'Failed to send notification email.',
      };
    }
  }

  /**
   * Send university approval request notifications to multiple super admins
   */
  static async sendUniversityApprovalNotificationToAll(
    superAdminEmails: string[],
    universityName: string,
    adminName: string,
    adminEmail: string,
    universityCode?: string
  ): Promise<{
    successCount: number;
    failureCount: number;
    results: SendEmailResponse[];
  }> {
    if (superAdminEmails.length === 0) {
      return {
        successCount: 0,
        failureCount: 0,
        results: [{
          success: false,
          message: 'No super admin emails provided'
        }]
      };
    }

    const results: SendEmailResponse[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Send emails to all super admins
    for (const email of superAdminEmails) {
      try {
        const result = await this.sendUniversityApprovalNotification(
          email,
          universityName,
          adminName,
          adminEmail,
          universityCode
        );

        results.push(result);

        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }

        // Add small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error: any) {
        failureCount++;
        results.push({
          success: false,
          message: `Failed to send to ${email}: ${error.message}`
        });
      }
    }

    return {
      successCount,
      failureCount,
      results
    };
  }

  /**
   * Check if EmailJS is properly configured
   */
  static isConfigured(): boolean {
    return !!(this.SERVICE_ID && this.TEMPLATE_ID && this.PUBLIC_KEY);
  }
}