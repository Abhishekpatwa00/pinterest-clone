import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

import jwt from "jsonwebtoken"
import Follow from "../models/follow.model.js"


export const test = (req,res)=>{
    return res.json("Hello from the outer world")
}

export const viewUser = async (req, res) => {
    const { userName } = req.params;

    try {
        const user = await User.findOne({ userName: userName });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const { hashedPassword, ...hasNotPassword } = user.toObject();

        const followerCount = await Follow.countDocuments({
            following: user._id,
        });
        const followingCount = await Follow.countDocuments({
            follower: user._id,
        });

        const token =
            req.cookies.jwt ||
            req.cookies.access_token ||
            (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : null);

        if (!token) {
            return res.status(200).json({
                ...hasNotPassword,
                followerCount,
                followingCount,
                isFollowing: false,
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
            if (err) {
                return res.status(200).json({
                    ...hasNotPassword,
                    followerCount,
                    followingCount,
                    isFollowing: false,
                });
            }

            const currentUserId = payload.userId || payload.id;
            const isFollowing = await Follow.exists({
                follower: currentUserId,
                following: user._id,
            });

            return res.status(200).json({
                ...hasNotPassword,
                followerCount,
                followingCount,
                isFollowing: Boolean(isFollowing),
            });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const registerUser = async (req, res) => {
    const { userName, email, password, displayName } = req.body;
    if (!userName || !email || !password || !displayName) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
        userName,
        displayName,
        email,
        hashedPassword: hash,
    });

    const token = jwt.sign({ id: user._id, userId: user._id }, process.env.JWT_SECRET);

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    };

    res.cookie("access_token", token, cookieOptions);
    res.cookie("jwt", token, cookieOptions);

    const { hashedPassword, ...hasNotPassword } = user.toObject();
    return res.status(201).json(hasNotPassword);
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const correctPassword = await bcrypt.compare(password, user.hashedPassword);
    if (!correctPassword) {
        return res.status(401).json({ message: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id, userId: user._id }, process.env.JWT_SECRET);

    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
    };

    res.cookie("access_token", token, cookieOptions);
    res.cookie("jwt", token, cookieOptions);

    const { hashedPassword, ...hasNotPassword } = user.toObject();
    return res.status(200).json(hasNotPassword);
};

export const logoutUser = (req, res) => {
    try {
        res.clearCookie("access_token");
        res.clearCookie("jwt");
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const followUser = async (req, res) => {
    const { userName } = req.params;
    try {
        const user = await User.findOne({ userName: userName });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.userId && req.userId.toString() === user._id.toString()) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const isFollowing = await Follow.findOne({
            follower: req.userId,
            following: user._id,
        });

        if (isFollowing) {
            await Follow.deleteOne({
                follower: req.userId,
                following: user._id,
            });
            const followerCount = await Follow.countDocuments({ following: user._id });
            const followingCount = await Follow.countDocuments({ follower: user._id });
            return res.status(200).json({
                message: "User unfollowed successfully",
                isFollowing: false,
                followerCount,
                followingCount,
            });
        }

        await Follow.create({
            follower: req.userId,
            following: user._id,
        });

        const followerCount = await Follow.countDocuments({ following: user._id });
        const followingCount = await Follow.countDocuments({ follower: user._id });

        return res.status(200).json({
            message: "User followed successfully",
            isFollowing: true,
            followerCount,
            followingCount,
        });
    } catch (err) {
        console.error("Error in followUser:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getFollowers = async (req, res) => {
    const { userName } = req.params;
    try {
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const follows = await Follow.find({ following: user._id })
            .populate("follower", "userName displayName img image email")
            .sort({ createdAt: -1 });

        const followers = follows
            .map((f) => f.follower)
            .filter(Boolean);

        return res.status(200).json(followers);
    } catch (err) {
        console.error("Error in getFollowers:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getFollowing = async (req, res) => {
    const { userName } = req.params;
    try {
        const user = await User.findOne({ userName });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const follows = await Follow.find({ follower: user._id })
            .populate("following", "userName displayName img image email")
            .sort({ createdAt: -1 });

        const following = follows
            .map((f) => f.following)
            .filter(Boolean);

        return res.status(200).json(following);
    } catch (err) {
        console.error("Error in getFollowing:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};