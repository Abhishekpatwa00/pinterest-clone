import Board from "../models/board.model.js";
import Pin from "../models/pin.model.js";

export const getUserBoards = async (req, res) => {
    const { userId } = req.params;
    try {
        const boards = await Board.find({ user: userId }).sort({ updatedAt: -1 });

        const boardsWithDetails = await Promise.all(
            boards.map(async (board) => {
                const pins = await Pin.find({ board: board._id })
                    .limit(3)
                    .select("media");
                const pinCount = await Pin.countDocuments({ board: board._id });

                return {
                    ...board.toObject(),
                    pinCount,
                    previewImages: pins.map((p) => p.media),
                };
            })
        );

        return res.status(200).json(boardsWithDetails);
    } catch (err) {
        console.error("Error fetching user boards:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const createBoard = async (req, res) => {
    const { title, userId, isPrivate } = req.body;
    if (!title || !userId) {
        return res.status(400).json({ message: "Title and userId are required" });
    }
    try {
        const board = new Board({
            title: title.trim(),
            user: userId,
        });
        const savedBoard = await board.save();
        return res.status(201).json({
            ...savedBoard.toObject(),
            isPrivate: Boolean(isPrivate),
            pinCount: 0,
            previewImages: [],
        });
    } catch (err) {
        console.error("Error creating board:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getBoard = async (req, res) => {
    const { id } = req.params;
    try {
        const board = await Board.findById(id).populate("user", "userName displayName img");
        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }
        const pins = await Pin.find({ board: board._id });
        return res.status(200).json({
            ...board.toObject(),
            pins,
            pinCount: pins.length,
        });
    } catch (err) {
        console.error("Error fetching board:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteBoard = async (req, res) => {
    const { id } = req.params;
    try {
        await Board.findByIdAndDelete(id);
        return res.status(200).json({ message: "Board deleted successfully" });
    } catch (err) {
        console.error("Error deleting board:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

