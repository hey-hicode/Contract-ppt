import axios, { AxiosInstance } from "axios";

export default class KeplersMailClient {
  private client: AxiosInstance;

  private handleAxiosError(error: unknown, fallback: string): never {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message ?? fallback);
    }
    throw new Error(fallback);
  }

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: process.env.KEPLERS_BASE_URL ?? "https://api.keplars.com",
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
    meta?: Record<string, string>;
  }) {
    try {
      const res = await this.client.post("/api/v1/send-email/queue", emailData);
      return res.data;
    } catch (error: unknown) {
      this.handleAxiosError(error, "Failed to send email");
    }
  }

  async sendInstantEmail(emailData: {
    to: string[];
    subject: string;
    body: string;
    is_html?: boolean;
  }) {
    try {
      const res = await this.client.post(
        "/api/v1/send-email/instant",
        emailData,
      );
      return res.data;
    } catch (error: unknown) {
      this.handleAxiosError(error, "Failed to send email");
    }
  }
}
