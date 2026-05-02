import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

@Injectable()
class MailService {
  private transporter: Mail;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
      connectionTimeout: 10000, // 10s to connect
      greetingTimeout: 10000, // 10s for greeting
      socketTimeout: 15000, // 15s for socket idle
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({
        to,
        subject,
        text,
      });
      return 'Success!';
    } catch (error) {
      console.warn('[MailService] sendMail failed:', error?.message);
      throw error; // re-throw so caller's catch can handle it
    }
  }
}

export default MailService;
