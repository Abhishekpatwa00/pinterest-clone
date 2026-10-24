import express from "express";
import { getUserBoards, createBoard, getBoard, deleteBoard } from "../controller/board.controller.js";
import { verifyToken } from "../utils/middlewares/verifytoken.js";
const router = express.Router();

router.get("/user/:userId", getUserBoards);
router.post("/",verifyToken, createBoard);
router.get("/:id", getBoard);
router.delete("/:id",verifyToken, deleteBoard);

export default router;
