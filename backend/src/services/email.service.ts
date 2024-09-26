// utils/sendEmail.js
import nodemailer from 'nodemailer';
import environment from '../config/environment';
import templateManager from '../utils/email-templates.util';
import logger from '../utils/logger.util';

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter;

  private constructor() {
    this.transporter = nodemailer.createTransport({
      host: environment.email.host,
      port: environment.email.port,
      auth: {
        user: environment.email.user,
        pass: environment.email.password,
      }
    });
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail({ to, subject, text, html }: EmailOptions): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: environment.email.from,
      to,
      subject,
      text,
      html
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', { messageId: info.messageId, to });
    } catch (error) {
      logger.error('Error sending email', { error, to });
      throw error;
    }
  }

  async sendTemplatedEmail(to: string, templateName: string, variables: Record<string, any>): Promise<void> {
    const renderedTemplate = templateManager.renderTemplate(templateName, variables);
    await this.sendEmail({
      to,
      ...renderedTemplate
    });
  }
}

// Export a single instance
export const emailService = EmailService.getInstance();

/* THE DEVELOPMENT mail trying
 * This setup will create a new test account for each email sent, which is fine for development. 
 * The console will log a preview URL where you can see the email that would have been sent.

import nodemailer from 'nodemailer';

const sendEmail = async ({ to, subject, text, html }) => {
  // Create a test account
  const testAccount = await nodemailer.createTestAccount();

  // Create a transporter using the test account
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const mailOptions = {
    from: '"Your App" <noreply@yourapp.com>',
    to,
    subject,
    text,
    html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    console.log('Preview URL: ', nodemailer.getTestMessageUrl(info));
    return info;
  } catch (error) {
    console.error('Error sending email: ', error);
    throw error;
  }
};

export default sendEmail;
*/