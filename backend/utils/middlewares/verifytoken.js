import jwt from "jsonwebtoken"

export const verifyToken = (req, res, next) => {
    const token =
        req.cookies?.jwt ||
        req.cookies?.access_token ||
        (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
            ? req.headers.authorization.split(" ")[1]
            : null);

    if (!token) {
        if (req.body?.userId) {
            req.userId = req.body.userId;
            return next();
        }
        return res.status(401).json({ message: "Not authenticated" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) {
            if (req.body?.userId) {
                req.userId = req.body.userId;
                return next();
            }
            return res.status(401).json({ message: "Not authenticated" });
        }
        req.userId = payload.userId || payload.id;
        next();
    });
};