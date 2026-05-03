import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';

@Injectable()
class MailService {
  private transporter: Mail;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;

    this.logger.log(`Mail config: user=${user}, pass=${pass ? '***SET***' : '***MISSING***'}`);

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user, pass },
      family: 4, // Force IPv4 (Railway doesn't support IPv6)
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    // Verify connection on startup (non-blocking)
    this.transporter.verify().then(() => {
      this.logger.log('✅ SMTP connection verified successfully');
    }).catch((err) => {
      this.logger.error('❌ SMTP connection verification failed:', err.message);
    });
  }

  async sendMail(to: string, subject: string, text: string) {
    const from = `"MirEdu" <${process.env.MAIL_USER}>`;
    this.logger.log(`Sending email to: ${to}, subject: ${subject}`);
    try {
      await this.transporter.sendMail({ from, to, subject, text });
      this.logger.log(`✅ Email sent successfully to ${to}`);
      return 'Success!';
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }
}

export default MailService;
