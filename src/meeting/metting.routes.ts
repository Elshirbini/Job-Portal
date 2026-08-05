import express from "express";
import { createDailyRoom, createZoomMeeting } from "./meeting.controller";
const router = express.Router();

router.get("/", (req, res) => {
  return res.status(200).json({ msg: "Api is working!" });
});
router.post("/", async (req, res) => {
  const { topic } = req.body || "";
  const { duration } = req.body || 30;
  const { start_time } = req.body || new Date();

  try {
    const createdMeeting = await createZoomMeeting(topic, duration, start_time);
    console.log(createdMeeting);
    return res
      .status(200)
      .json({ msg: "Meeting created successfully", meeting: createdMeeting });
  } catch (err) {
    return res.status(400).json({ msg: (err as Error).message });
  }
});
router.post("/daily", async (req, res) => {
  const { name } = req.body || "";
  const { duration } = req.body || 30;

  try {
    const createdMeeting = await createDailyRoom("test", 10);
    console.log(createdMeeting);
    return res
      .status(200)
      .json({ msg: "Meeting created successfully", meeting: createdMeeting });
  } catch (err) {
    return res.status(400).json({ msg: (err as Error).message });
  }
});
export const meetingRoutes = router;
