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
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    try {
      let a = await this.transporter.sendMail({
        to,
        subject,
        text,
      });
      return 'Success!';
    } catch (error) {
      return error;
    }
  }
}

export default MailService;
