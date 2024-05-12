import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { Chat } from "../models/chat.model";
import { User } from "../models/user.model";

const accessChat = asyncHandler(async (req: Request, res: Response) => {
	const { _id: authorId } = req.user;
	const { userId } = req.body;

	if (!userId) {
		throw new ApiError(400, "User id not found with request!");
	}

	let isChat = await Chat.find({
		isGroupChat: false,
		$and: [
			{ users: { $elemMatch: { $eq: authorId } } },
			{ users: { $elemMatch: { $eq: userId } } },
		],
	})
		.populate("users", "-password")
		.populate("latestMessage")
		.populate({
			path: "latestMessage.sender",
			select: "firstName lastName username email -password",
		});

	if (isChat.length <= 0) {
		const createdChat = await Chat.create({
			users: [authorId, userId],
			isGroupChat: false,
			chatName: "sender",
		});

		if (!createdChat) {
			throw new ApiError(500, "Something went wrong while creating the chat!");
		}

		const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
			"users",
			"-password"
		);

		return res
			.status(200)
			.json(new ApiResponse(200, fullChat, "Chat successfully created!"));
	}

	return res
		.status(200)
		.json(new ApiResponse(200, isChat, "Chat successfully fetched!"));
});

const fetchChat = asyncHandler(async (req: Request, res: Response) => {
	const { _id: userId } = req.user;

	const userChats = await Chat.find({ users: userId })
		.populate("users", "-password")
		.populate("groupAdmin", "-password")
		.populate("latestMessage")
		.sort({ updatedAt: -1 });

	const _userChats = await User.populate(userChats, {
		path: "latestMessage.sender",
		select: "-password",
	});

	if (!userChats) {
		throw new ApiError(404, "No user chats available!");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, _userChats, "User chats successfully fetched!"));
});

const createGroupChat = asyncHandler(async (req: Request, res: Response) => {
	const { _id: userId } = req.user;
	const { users, name } = req.body;

	if (!users || !name) {
		throw new ApiError(400, "Please fill all the fields!");
	}

	let _users = JSON.parse(users);

	if (_users.length < 2) {
		throw new ApiError(
			400,
			"More than 2 users are required to form a group chat!"
		);
	}

	// add yourself to the chat also as you've created it
	_users.push(req.user);

	const groupChat = await Chat.create({
		users: _users,
		chatName: name,
		isGroupChat: true,
		groupAdmin: userId,
	});

	if (!groupChat) {
		throw new ApiError(500, "Something went wrong while creating group chat!");
	}

	const _groupChat = await Chat.findById(groupChat._id)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");

	return res
		.status(200)
		.json(new ApiResponse(200, _groupChat, "Group chat successfully created!"));
});

const renameGroup = asyncHandler(async (req: Request, res: Response) => {
	const { _id: userId } = req.user;
	const { groupChatId, newGroupChatName } = req.body;

	if (!groupChatId || !newGroupChatName) {
		throw new ApiError(404, "Please fill all details!");
	}

	const updatedGroupChat = await Chat.findByIdAndUpdate(
		groupChatId,
		{
			chatName: newGroupChatName,
		},
		{
			new: true,
		}
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");

	if (!updatedGroupChat) {
		throw new ApiError(
			404,
			"Something went wrong while updating group chat name!"
		);
	}

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				updatedGroupChat,
				"Notification successfully fetched!"
			)
		);
});

const removeFromGroup = asyncHandler(async (req: Request, res: Response) => {
	const { chatId, userId } = req.body;

	const addedToGroup = await Chat.findByIdAndUpdate(
		chatId,
		{
			$pull: { users: userId },
		},
		{
			new: true,
		}
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");

	if (!addedToGroup) {
		throw new ApiError(404, "Unable to remove user to group!");
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, addedToGroup, "User successfully removed to group!")
		);
});

const addToGroup = asyncHandler(async (req: Request, res: Response) => {
	const { chatId, userId } = req.body;

	const addedToGroup = await Chat.findByIdAndUpdate(
		chatId,
		{
			$addToSet: { users: userId }, //using this only to add user if it's not present in the array
		},
		{
			new: true,
		}
	)
		.populate("users", "-password")
		.populate("groupAdmin", "-password");

	if (!addedToGroup) {
		throw new ApiError(404, "Unable to add user to group!");
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, addedToGroup, "User successfully added to group!")
		);
});

export {
	accessChat,
	fetchChat,
	createGroupChat,
	renameGroup,
	removeFromGroup,
	addToGroup,
};
