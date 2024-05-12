import mongoose, { Schema } from "mongoose";
import { IMessage } from "../types/messageTypes";

const messageSchema = new Schema<IMessage>(
	{
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		content: {
			type: String,
			trim: true,
		},
		chat: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Chat",
		},
	},
	{
		timestamps: true,
	}
);

export const Message = mongoose.model<IMessage>("Message", messageSchema);
