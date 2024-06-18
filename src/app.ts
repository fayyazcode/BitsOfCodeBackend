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
import projectRouter from "./routes/project.route";
import notificationRouter from "./routes/notification.route";
import chatRouter from "./routes/chat.route";
import messageRouter from "./routes/message.route";
import skillRouter from "./routes/skill.route";
import ticketRouter from "./routes/ticket.route";
import bidRouter from "./routes/bid.route";

// routes declaration
app.get("/", (req, res) => {
	return res
		.status(200)
		.send(
			"<h1>Testing cicd: Welcome to intial route for Backend Bits of Code...</h1>"
		);
});

// auth routes
app.use("/api/v1/users", userRouter);

// posts routes
app.use("/api/v1/projects", projectRouter);

// notifications routes
app.use("/api/v1/notifications", notificationRouter);

// chats routes
app.use("/api/v1/chats", chatRouter);

// message routes
app.use("/api/v1/message", messageRouter);

// skill routes
app.use("/api/v1/skills", skillRouter);

// ticket routes
app.use("/api/v1/tickets", ticketRouter);

// bid routes
app.use("/api/v1/bids", bidRouter);

// http://localhost:8000/api/v1/users/register

export { app };
