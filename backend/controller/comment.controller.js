import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken"

export const getComments = async (req, res) => {
    const { pin } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pin)) {
        return res.status(200).json([]);
    }
    try {
        const comments = await Comment.find({ pin: pin })
            .sort({ createdAt: 1 })
            .populate("user", "userName image displayName img");
        return res.status(200).json(comments);
    } catch (err) {
        console.error("Error fetching comments:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const createComment = async (req, res) => {
    const { description, pinId, pin } = req.body;
    const targetPin = pinId || pin;

   
         try {
        let user = req.userId;
       
        const newComment = new Comment({
            description: description.trim(),
            pin: targetPin,
            user,
        });

        await newComment.save();
        await newComment.populate("user", "userName image displayName img");
        return res.status(201).json(newComment);
    } catch (err) {
        console.error("Error creating comment:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
    

    if (!description || !targetPin) {
        return res.status(400).json({ message: "Description and pinId are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(targetPin)) {
        return res.status(400).json({ message: "Invalid pinId format" });
    }

   
};

export const deleteComment = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid comment id format" });
    }
    try {
        const deletedComment = await Comment.findByIdAndDelete(id);
        if (!deletedComment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
        console.error("Error deleting comment:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const toggleLikeComment = async (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid comment id format" });
    }
    try {
        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        let user = userId;
        if (!user || !mongoose.Types.ObjectId.isValid(user)) {
            const firstUser = await User.findOne();
            user = firstUser?._id;
        }

        if (!comment.likes) {
            comment.likes = [];
        }

        const userStr = user.toString();
        const existingIndex = comment.likes.findIndex((uid) => uid.toString() === userStr);

        if (existingIndex > -1) {
            comment.likes.splice(existingIndex, 1);
        } else {
            comment.likes.push(user);
        }

        await comment.save();
        await comment.populate("user", "userName image displayName img");
        return res.status(200).json(comment);
    } catch (err) {
        console.error("Error liking comment:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};
