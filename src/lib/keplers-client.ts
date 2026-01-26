import axios from "axios";

export default class KeplersMailClient {
  private client;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: "https://api.keplars.com",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 15_000,
    });
  }

  async sendEmail(emailData: {
    to: string[];
    subject: string;
    body: string;
    is_html?: boolean;
    meta?: Record<string, any>;
  }) {
    const res = await this.client.post("/api/v1/send-email/queue", emailData);
    return res.data;
  }

  async sendInstantEmail(emailData: {
    to: string[];
    subject: string;
    body: string;
    is_html?: boolean;
  }) {
    const res = await this.client.post("/api/v1/send-email/instant", emailData);
    return res.data;
  }
}
