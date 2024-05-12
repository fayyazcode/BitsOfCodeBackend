import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { Chat } from "../models/chat.model";
import { Message } from "../models/message.model";
import { User } from "../models/user.model";

const sendMessage = asyncHandler(async (req: Request, res: Response) => {
	const { _id: senderId } = req.user;
	const { content, chatId } = req.body;

	if (!content || !chatId) {
		throw new ApiError(400, "Invalid passed with request!");
	}

	let newMessage = {
		sender: senderId,
		content,
		chat: chatId,
	};

	let message = await Message.create(newMessage);

	const createdMessage = await Message.findById(message._id)
		.populate("sender", "-password")
		.populate("chat");

	const _createdMessage = await User.populate(createdMessage, {
		path: "chat.users",
		select: "-password",
	});

	if (!_createdMessage) {
		throw new ApiError(500, "Something went wrong while creating new Message");
	}

	const _latestMessage = await Chat.findByIdAndUpdate(chatId, {
		latestMessage: message,
	});

	if (!_latestMessage) {
		throw new ApiError(
			500,
			"Somethign went wrong while creating Latest Message!"
		);
	}

	return res
		.status(200)
		.json(new ApiResponse(200, _createdMessage, "Chat successfully created!"));
});

const allMessages = asyncHandler(async (req: Request, res: Response) => {
	const { _id: authorId } = req.user;
	const { chatId } = req.params;

	if (!chatId) {
		throw new ApiError(400, "Chat id not found with request!");
	}

	const messages = await Message.find({ chat: chatId })
		.populate("sender", "-password")
		.populate("chat");

	const _messages = await User.populate(messages, {
		path: "chat.users",
		select: "-password",
	});

	if (!_messages) {
		throw new ApiError(
			500,
			"Something went wrong while fetching chat messages."
		);
	}

	return res
		.status(200)
		.json(new ApiResponse(200, _messages, "Chat successfully created!"));
});

export { sendMessage, allMessages };
