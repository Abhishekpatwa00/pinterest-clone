import express from "express";
import { getPin, getPins, createPin } from "../controller/pin.controller.js";
import { verifyToken } from "../utils/middlewares/verifytoken.js";

const router = express.Router();

router.get("/", getPins);
router.get("/:id", getPin);
router.post("/", verifyToken, createPin);

export default router;