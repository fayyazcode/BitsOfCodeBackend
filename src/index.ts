import "dotenv/config";
import connectDB from "./db/index";
import { app } from "./app";
import cloudinary from "cloudinary";

const PORT = process.env.PORT || 8000;

connectDB()
	.then(() => {
		cloudinary.v2.config({
			cloud_name: process.env.CLOUDINARY_CLIENT_NAME as string,
			api_key: process.env.CLOUDINARY_API_KEY as string,
			api_secret: process.env.CLOUDINARY_API_SECRET as string,
		});

		const server = app.listen(PORT, () => {
			console.log(`Server is running at port: ${PORT}`);
		});

		const io = require("socket.io")(server, {
			pingTimeOut: 60000,
			cors: {
				origin: "*",
			},
		});

		io.on("connection", (socket) => {
			console.log("connected to socket.io");

			socket.on("setup", (userData) => {
				socket.join(userData._id);
				// console.log(userData._id);
				socket.emit("connected");
			});

			socket.on("join chat", (room) => {
				socket.join(room);
				console.log("User joined room: ", room);
			});
		});
	})
	.catch((err) => {
		console.log("MONGO db connection failed !!!", err);
		throw err;
	});
