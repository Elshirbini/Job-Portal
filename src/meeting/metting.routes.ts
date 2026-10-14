import express from "express";
import { MeetingController } from "./meeting.controller";
import { container } from "tsyringe";

const router = express.Router();
const meetingController = container.resolve(MeetingController);

router.post("/", meetingController.createZoomMeeting);
router.post("/daily", meetingController.createDailyRoom);

export const meetingRoutes = router;
