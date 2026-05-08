import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.logger.log('MailService initialized with Resend');
  }

  async sendMail(to: string, subject: string, text: string) {
    this.logger.log(`Sending email to: ${to}`);
    try {
      const { data, error } = await this.resend.emails.send({
        from: 'MirEdu <onboarding@resend.dev>',
        to: [to],
        subject,
        text,
      });

      if (error) {
        this.logger.error(`❌ Resend error: ${JSON.stringify(error)}`);
        throw new Error(error.message);
      }

      this.logger.log(`✅ Email sent to ${to}, id: ${data?.id}`);
      return 'Success!';
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }
}

export default MailService;
