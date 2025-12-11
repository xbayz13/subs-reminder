import { google } from "googleapis";
import { env } from "@/config/env";

/**
 * Google Calendar Service
 * 
 * Handles Google Calendar API integration for subscription reminders
 */
export class GoogleCalendarService {
  private oauth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Set access token for OAuth client
   */
  setAccessToken(accessToken: string, refreshToken?: string | null): void {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  /**
   * Create calendar event for subscription payment
   */
  async createPaymentEvent(data: {
    accessToken: string;
    refreshToken?: string | null;
    title: string;
    description: string;
    startDate: Date;
    reminderMinutes: number;
    calendarId?: string;
  }): Promise<{ eventId: string; htmlLink: string }> {
    this.setAccessToken(data.accessToken, data.refreshToken);

    const calendar = google.calendar({ version: "v3", auth: this.oauth2Client });

    const event = {
      summary: data.title,
      description: data.description,
      start: {
        dateTime: data.startDate.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(data.startDate.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          {
            method: "email",
            minutes: data.reminderMinutes,
          },
          {
            method: "popup",
            minutes: data.reminderMinutes,
          },
        ],
      },
    };

    const calendarId = data.calendarId || env.GOOGLE_CALENDAR_ID;

    try {
      const response = await calendar.events.insert({
        calendarId,
        requestBody: event,
      });

      return {
        eventId: response.data.id || "",
        htmlLink: response.data.htmlLink || "",
      };
    } catch (error) {
      console.error("Error creating calendar event:", error);
      throw new Error("Failed to create calendar event");
    }
  }

  /**
   * Update calendar event
   */
  async updatePaymentEvent(data: {
    accessToken: string;
    refreshToken?: string | null;
    eventId: string;
    title?: string;
    description?: string;
    startDate?: Date;
    calendarId?: string;
  }): Promise<void> {
    this.setAccessToken(data.accessToken, data.refreshToken);

    const calendar = google.calendar({ version: "v3", auth: this.oauth2Client });
    const calendarId = data.calendarId || env.GOOGLE_CALENDAR_ID;

    try {
      // Get existing event
      const existingEvent = await calendar.events.get({
        calendarId,
        eventId: data.eventId,
      });

      // Update event
      const updatedEvent = {
        ...existingEvent.data,
        summary: data.title || existingEvent.data.summary,
        description: data.description || existingEvent.data.description,
      };

      if (data.startDate) {
        updatedEvent.start = {
          dateTime: data.startDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        updatedEvent.end = {
          dateTime: new Date(data.startDate.getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }

      await calendar.events.update({
        calendarId,
        eventId: data.eventId,
        requestBody: updatedEvent,
      });
    } catch (error) {
      console.error("Error updating calendar event:", error);
      throw new Error("Failed to update calendar event");
    }
  }

  /**
   * Delete calendar event
   */
  async deletePaymentEvent(data: {
    accessToken: string;
    refreshToken?: string | null;
    eventId: string;
    calendarId?: string;
  }): Promise<void> {
    this.setAccessToken(data.accessToken, data.refreshToken);

    const calendar = google.calendar({ version: "v3", auth: this.oauth2Client });
    const calendarId = data.calendarId || env.GOOGLE_CALENDAR_ID;

    try {
      await calendar.events.delete({
        calendarId,
        eventId: data.eventId,
      });
    } catch (error) {
      console.error("Error deleting calendar event:", error);
      throw new Error("Failed to delete calendar event");
    }
  }
}

