import express from "express"
import { test, viewUser, registerUser, followUser, getFollowers, getFollowing } from "../controller/user.controller.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs";
import { verifyToken } from "../utils/middlewares/verifytoken.js";

const router = express.Router();

router.get("/test", test);

router.post("/create", async (req, res) => {
    try {
        const userInfo = req.body;
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        
        const newUser = await User.create({
            displayName: req.body.displayName,
            userName: req.body.userName,
            email: req.body.email,
            hashedPassword: hashedPassword
        });

        console.log("User created successfully", userInfo);

        // Send a response back to the client
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            userId: newUser._id
        });
    } catch (error) {
        console.error("Error creating user:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

router.get("/:userName/followers", getFollowers);
router.get("/:userName/following", getFollowing);
router.get("/:userName", viewUser);
router.post("/auth/register", registerUser);
router.post("/follow/:userName", verifyToken, followUser);

export default router;