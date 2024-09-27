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
    try {
      const renderedTemplate = await templateManager.renderTemplate(templateName, variables);
      await this.sendEmail({
        to,
        ...renderedTemplate
      });
    } catch (error) {
      logger.error('Error sending templated email', { error, templateName, to });
      throw error;
    }
  }

  // New method to verify connection
  async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
    } catch (error) {
      logger.error('Email service connection failed', { error });
      throw error;
    }
  }
}

// Export a single instance
export const emailService = EmailService.getInstance();
