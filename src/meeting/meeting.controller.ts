import axios from "axios";
import { ApiError } from "../utils/apiError";
import { logger } from "../config/logger";
const api_base_url = "https://api.zoom.us/v2"; // base url for zoom api call
// config as a auth required for auth login;
let config = {
  method: "post",
  maxBodyLength: Infinity,
  url: `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
  headers: {
    "Content-Type": "application/json",
  },
  auth: {
    username: process.env.ZOOM_CLIENT_ID,
    password: process.env.ZOOM_CLIENT_SECRET,
  },
};
// function to create a zoom meeting, it's requires 3 parameters (topic as String, duratioin as Numbers, start_time as Date)
export const createZoomMeeting = async (
  topic: string,
  duration: number,
  start_time: Date,
) => {
  try {
    const authResponse = await axios
      .request({
        method: "post",
        maxBodyLength: Infinity,
        url: `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
        headers: {
          "Content-Type": "application/json",
        },
        auth: {
          username: process.env.ZOOM_CLIENT_ID!,
          password: process.env.ZOOM_CLIENT_SECRET!,
        },
      })
      .catch((error) => {
        console.log(error);
        throw error;
      });
    const access_token = authResponse.data?.access_token;
    const headers = {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };
    let data = JSON.stringify({
      topic: topic,
      type: 2,
      start_time: new Date(start_time),
      duration: duration,
      timezone: "Africa/Cairo",
      settings: {
        allow_multiple_devices: true,
        join_before_host: true,
        waiting_room: false,
      },
    });
    const meetingResponse = await axios.post(
      `${api_base_url}/users/me/meetings`,
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
    return content;
  } catch (e) {
    return e;
  }
};

const DAILY_API_KEY = process.env.DAILY_API_KEY;

export const createDailyRoom = async (
  name: string,
  durationMinutes: number,
) => {
  const expiresAt = Math.floor(Date.now() / 1000) + durationMinutes * 60;

  try {
    const res = await axios.post(
      "https://api.daily.co/v1/rooms",
      {
        name, // unique room name
        privacy: "private",
        properties: {
          exp: expiresAt, // ⛔ يقفل الغرفة بعد الوقت
          enable_chat: true,
          start_video_off: true,
          max_participants: 2,
          //   enable_recording: "cloud",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${DAILY_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    // let res = { data: {} };

    const tokenRes = await axios.post(
      "https://api.daily.co/v1/meeting-tokens",
      {
        properties: {
          room_name: "test", // نفس name بالظبط
          user_name: "hamdoon",
          is_owner: false, // المدرس
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
        },
      },
    );

    const token = tokenRes.data.token;

    return { data: res.data ? res.data : null };
  } catch (error) {
    console.log(error);
    throw new ApiError((error as Error).message, 501);
  }
};
