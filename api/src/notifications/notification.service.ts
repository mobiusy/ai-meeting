import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class NotificationService {
  constructor(private readonly config: ConfigService) {}

  async send(to: string[], subject: string, body: string) {
    const secure = this.config.get<string>('SMTP_SECURE')
    const host = this.config.get<string>('SMTP_HOST')
    const user = this.config.get<string>('SMTP_USER')
    const from = this.config.get<string>('NOTIFY_FROM_EMAIL') || 'noreply@example.com'
    const isMock = !host || !user || secure === undefined
    if (isMock) {
      return { mock: true, to, subject, body, from }
    }
    return { mock: true, to, subject, body, from }
  }
}
