import mongoose, { Schema } from "mongoose";
import { INotification } from "../types/notificationTypes";

const notificationSchema = new Schema<INotification>(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		notifications: [
			{
				body: {
					type: String,
				},
				title: {
					type: String,
				},
			},
		],
		isViewed: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	}
);

export const Notification = mongoose.model<INotification>(
	"Notification",
	notificationSchema
);
