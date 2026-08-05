import axios from "axios";
import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { logger } from "../config/logger";
import { injectable } from "tsyringe";

const API_BASE_URL = "https://api.zoom.us/v2";

@injectable()
export class MeetingController {
  /**
   * Create a Zoom meeting.
   * Requires: topic (string), duration (number), start_time (Date)
   */
  public createZoomMeeting = async (req: Request, res: Response) => {
    const { topic, duration, start_time } = req.body;

    try {
      const authResponse = await axios.request({
        method: "post",
        maxBodyLength: Infinity,
        url: `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
        headers: { "Content-Type": "application/json" },
        auth: {
          username: process.env.ZOOM_CLIENT_ID!,
          password: process.env.ZOOM_CLIENT_SECRET!,
        },
      });

      const access_token = authResponse.data?.access_token;
      const headers = {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      };

      const data = JSON.stringify({
        topic,
        type: 2,
        start_time: new Date(start_time),
        duration,
        timezone: "Africa/Cairo",
        settings: {
          allow_multiple_devices: true,
          join_before_host: true,
          waiting_room: false,
        },
      });

      const meetingResponse = await axios.post(
        `${API_BASE_URL}/users/me/meetings`,
        data,
        { headers },
      );

      if (meetingResponse.status !== 201) {
        throw new ApiError("Unable to generate meeting link", 400);
      }

      const response_data = meetingResponse.data;
      const content = {
        meeting_url: response_data.join_url,
        meetingTime: response_data.start_time,
        purpose: response_data.topic,
        duration: response_data.duration,
        message: "Success",
        status: 1,
      };

      return res.status(200).json({ msg: "Meeting created successfully", meeting: content });
    } catch (error) {
      logger.error("Failed to create Zoom meeting", error);
      throw new ApiError((error as Error).message, 501);
    }
  };

  /**
   * Create a Daily.co video room.
   * Requires: name (string), duration (number in minutes)
   */
  public createDailyRoom = async (req: Request, res: Response) => {
    const { name, duration } = req.body;
    const expiresAt = Math.floor(Date.now() / 1000) + (duration ?? 10) * 60;

    try {
      const roomRes = await axios.post(
        "https://api.daily.co/v1/rooms",
        {
          name,
          privacy: "private",
          properties: {
            exp: expiresAt,
            enable_chat: true,
            start_video_off: true,
            max_participants: 2,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const tokenRes = await axios.post(
        "https://api.daily.co/v1/meeting-tokens",
        {
          properties: {
            room_name: name,
            user_name: "participant",
            is_owner: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
          },
        },
      );

      const token = tokenRes.data.token;

      return res.status(200).json({
        msg: "Meeting created successfully",
        meeting: { data: roomRes.data ?? null, token },
      });
    } catch (error) {
      logger.error("Failed to create Daily.co room", error);
      throw new ApiError((error as Error).message, 501);
    }
  };
}
