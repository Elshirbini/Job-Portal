import express from "express";
import { MeetingController } from "./meeting.controller";
import { container } from "tsyringe";

const router = express.Router();
const meetingController = container.resolve(MeetingController);

router.get("/", (req, res) => {
  return res.status(200).json({ msg: "Api is working!" });
});

router.post("/", meetingController.createZoomMeeting);
router.post("/daily", meetingController.createDailyRoom);

export const meetingRoutes = router;
