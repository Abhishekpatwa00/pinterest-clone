import Pin from "../models/pin.model.js";
import mongoose from "mongoose";

export const getPins = async (req, res) => {
    const pageNumber = Number(req.query.cursor) || 0;
    const search = req.query.search;
    const LIMIT = 21;
    const userId = req.query.userPins;
    const boardId = req.query.boardId;
    try {
        let query = {};
        if (search && search !== "undefined") {
            query = {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { tags: { $regex: search, $options: "i" } }
                ]
            };
        } else if (boardId) {
            query = { board: boardId };
        } else if (userId) {
            query = { user: userId };
        }

        const pins = await Pin.find(query)
            .sort({ createdAt: -1 })
            .skip(pageNumber * LIMIT)
            .limit(LIMIT);
        const hasNextPage = pins.length === LIMIT;
        return res.status(200).json({ pins, nextCursor: hasNextPage ? pageNumber + 1 : null });
    } catch (error) {
        console.error("Error in getPins:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getPin = async (req, res) => {
    const { id } = req.params;
    try {
        const pin = await Pin.findById(id).populate("user", "userName image displayName img");
        if (!pin) {
            return res.status(404).json({ message: "Pin not found" });
        }
        return res.status(200).json(pin);
    } catch (error) {
        console.error("Error in getPin:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const createPin = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        if (!userId) {
            return res.status(401).json({ message: "You must be logged in to create a pin" });
        }

        const { media, title, desc, description, link, board, tags, width, height } = req.body;

        if (!media) {
            return res.status(400).json({ message: "Image is required" });
        }

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Title is required" });
        }

        let formattedTags = [];
        if (Array.isArray(tags)) {
            formattedTags = tags.map((t) => String(t).trim()).filter(Boolean);
        } else if (typeof tags === "string" && tags.trim().length > 0) {
            formattedTags = tags.split(",").map((t) => t.trim()).filter(Boolean);
        }

        const pinData = {
            media,
            width: Number(width) || 800,
            height: Number(height) || 1000,
            title: title.trim(),
            desc: (desc || description || "").trim(),
            description: (description || desc || "").trim(),
            link: (link || "").trim(),
            tags: formattedTags,
            user: userId,
        };

        if (board && mongoose.Types.ObjectId.isValid(board)) {
            pinData.board = board;
        }

        const newPin = new Pin(pinData);
        const savedPin = await newPin.save();
        await savedPin.populate("user", "userName image displayName img");

        return res.status(201).json(savedPin);
    } catch (error) {
        console.error("Error creating pin:", error);
        return res.status(500).json({ message: error.message || "Internal server error" });
    }
};