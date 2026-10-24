import { loginUser, registerUser , logoutUser } from "../controller/user.controller.js";
import express from "express"

const router = express.Router();

router.post("/register",registerUser)

router.post("/login" , loginUser)
router.post("/logout" , logoutUser)

export default router;
