// src/utils/email-templates.util.ts

import fs from 'fs/promises';
import path from 'path';
import Handlebars from 'handlebars';

interface EmailTemplate {
  name: string;
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[];
}

class EmailTemplateManager {
  private templates: Record<string, EmailTemplate> = {};
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async loadTemplates(): Promise<void> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      this.templates = JSON.parse(data);
    } catch (error) {
      console.error('Error loading email templates:', error);
      throw error;
    }
  }

  async saveTemplates(): Promise<void> {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(this.templates, null, 2));
    } catch (error) {
      console.error('Error saving email templates:', error);
      throw error;
    }
  }

  getTemplate(name: string): EmailTemplate | undefined {
    return this.templates[name];
  }

  setTemplate(name: string, template: EmailTemplate): void {
    this.templates[name] = template;
  }

  async updateTemplate(name: string, updates: Partial<EmailTemplate>): Promise<void> {
    if (this.templates[name]) {
      this.templates[name] = { ...this.templates[name], ...updates };
      await this.saveTemplates();
    } else {
      throw new Error(`Template "${name}" not found`);
    }
  }

  async deleteTemplate(name: string): Promise<void> {
    if (this.templates[name]) {
      delete this.templates[name];
      await this.saveTemplates();
    } else {
      throw new Error(`Template "${name}" not found`);
    }
  }

  getAllTemplateNames(): string[] {
    return Object.keys(this.templates);
  }

  renderTemplate(name: string, variables: Record<string, any>): { subject: string; html: string; text: string } {
    const template = this.getTemplate(name);
    if (!template) {
      throw new Error(`Template "${name}" not found`);
    }

    const subjectTemplate = Handlebars.compile(template.subject);
    const htmlTemplate = Handlebars.compile(template.htmlBody);
    const textTemplate = Handlebars.compile(template.textBody);

    return {
      subject: subjectTemplate(variables),
      html: htmlTemplate(variables),
      text: textTemplate(variables),
    };
  }
}

const templateManager = new EmailTemplateManager(path.join(__dirname, '../resources/email-templates.json'));

export default templateManager;