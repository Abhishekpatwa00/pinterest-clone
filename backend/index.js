import express from "express"
import userRouter from "./routes/user.route.js"
import pinRouter from "./routes/pin.route.js"
import boardRouter from "./routes/board.route.js"
import commentRouter from "./routes/comment.route.js"
import connectdb from "./utils/connectdb.js"
import cors from "cors";
import authRouter from "./routes/auth.router.js"
import cookieParser from "cookie-parser"

const app = express();
const PORT = 3000;



app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))
app.use(cookieParser())

app.use("/user", userRouter);
app.use("/pins", pinRouter);
app.use("/boards", boardRouter);
app.use("/comments", commentRouter);
app.use("/auth" , authRouter)


app.listen(PORT, () => {
    connectdb();
    console.log("Server is running on port", PORT);
})