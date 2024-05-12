import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { Notification } from "../models/notification.model";

const getNotifications = asyncHandler(async (req: Request, res: Response) => {
	const { _id: userId } = req.user;

	const notifications = await Notification.find({ userId });

	if (!notifications) {
		throw new ApiError(404, "No Notifications available!");
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, notifications, "Notification successfully fetched!")
		);
});

const viewNotifications = asyncHandler(async (req: Request, res: Response) => {
	const { _id: userId } = req.user;

	const notifications = await Notification.deleteMany({ userId });

	if (!notifications) {
		throw new ApiError(404, "No Notifications available!");
	}

	return res
		.status(200)
		.json(
			new ApiResponse(200, notifications, "Notification successfully cleared!")
		);
});

export { getNotifications, viewNotifications };
