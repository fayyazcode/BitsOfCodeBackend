// import { TCorsOptions } from "./types";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { TCorsOptions } from "./types";

const corsOptions: TCorsOptions = {
	origin: process.env.CORS_ORIGIN as string,
	credentials: true,
};

const app = express();

app.use(cors(corsOptions));

app.use(
	express.json({
		limit: "16kb",
	})
);

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

// routes import
import userRouter from "./routes/user.route";
import postRouter from "./routes/post.route";
import notificationRouter from "./routes/notification.route";
import chatRouter from "./routes/chat.route";
import messageRouter from "./routes/message.route";

// routes declaration
app.get("/", (req, res) => {
	return res
		.status(200)
		.send(
			"<h1>Testing Welcome to intial route for Backend Bits of Code...</h1>"
		);
});

// auth routes
app.use("/api/v1/users", userRouter);

// posts routes
app.use("/api/v1/posts", postRouter);

// notifications routes
app.use("/api/v1/notifications", notificationRouter);

// chats routes
app.use("/api/v1/chats", chatRouter);

// chats routes
app.use("/api/v1/message", messageRouter);

// http://localhost:8000/api/v1/users/register

export { app };
