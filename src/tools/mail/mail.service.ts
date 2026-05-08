import { Injectable, Logger } from '@nestjs/common';

@Injectable()
class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendMail(to: string, subject: string, text: string) {
    this.logger.log(`Sending email to: ${to}`);
    
    // Fallback if env vars are missing
    const senderEmail = process.env.MAIL_USER || 'noreply@miredu.uz';
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      this.logger.error('❌ BREVO_API_KEY is not set in environment variables');
      throw new Error('Email API key missing');
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'MirEdu', email: senderEmail },
          to: [{ email: to }],
          subject: subject,
          textContent: text,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.error(`❌ Brevo error: ${JSON.stringify(data)}`);
        throw new Error(data.message || 'Failed to send email');
      }

      this.logger.log(`✅ Email sent successfully to ${to}, messageId: ${data.messageId}`);
      return 'Success!';
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
      throw error;
    }
  }
}

export default MailService;

