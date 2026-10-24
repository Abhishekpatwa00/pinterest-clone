import express from "express";
import {
    getComments,
    createComment,
    deleteComment,
    toggleLikeComment,
} from "../controller/comment.controller.js";
import { verifyToken } from "../utils/middlewares/verifytoken.js";

const router = express.Router();

router.get("/:pin", getComments);
router.post("/",verifyToken, createComment);
router.delete("/:id",verifyToken, deleteComment);
router.post("/:id/like",verifyToken, toggleLikeComment);

export default router;

