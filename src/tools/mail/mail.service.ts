import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  private readonly logger = new Logger(MailService.name);

  async sendMail(to: string, subject: string, text: string) {
    this.logger.log(`Sending email to: ${to}`);
    try {
      await this.transporter.sendMail({
        from: `"MirEdu" <${process.env.MAIL_USER}>`,
        to,
        subject,
        text,
      });
      this.logger.log(`✅ Email sent to ${to}`);
      return 'Success!';
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }
}

export default MailService;

