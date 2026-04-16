import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export type TelegramParseMode = 'HTML' | 'MarkdownV2' | 'Markdown';

export interface SendTelegramMessageOptions {
  text: string;
  parseMode?: TelegramParseMode;
  disableWebPagePreview?: boolean;
  chatId?: string;
}

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly defaultChatId: string;

  constructor(private readonly configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') ?? '';
    this.defaultChatId =
      this.configService.get<string>('TELEGRAM_CHAT_ID') ?? '';
  }

  /**
   * Send a message to a Telegram chat/group.
   * Errors are caught & logged — we never want a notification failure to break
   * the main business flow (e.g. order creation).
   */
  async sendMessage(options: SendTelegramMessageOptions): Promise<boolean> {
    const chatId = options.chatId ?? this.defaultChatId;

    if (!this.botToken || !chatId) {
      this.logger.warn('Telegram bot token or chat id is not configured');
      return false;
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;

    try {
      const { data } = await axios.post(
        url,
        {
          chat_id: chatId,
          text: options.text,
          parse_mode: options.parseMode ?? 'HTML',
          disable_web_page_preview: options.disableWebPagePreview ?? true,
        },
        { timeout: 10_000 },
      );
      return Boolean(data?.ok);
    } catch (err) {
      const error = err as { message?: string; response?: { data?: unknown } };
      this.logger.error(
        `Failed to send Telegram message: ${error.message ?? 'unknown error'}`,
        JSON.stringify(error.response?.data ?? {}),
      );
      return false;
    }
  }

  /**
   * Экранирует HTML-спецсимволы, чтобы безопасно вставлять пользовательский
   * ввод в сообщения с parse_mode = HTML.
   */
  escapeHtml(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}
