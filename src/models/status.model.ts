import { IStatus } from "./../types/statusTypes/index";
import mongoose, { Schema } from "mongoose";

const statusSchema = new Schema<IStatus>(
	{
		status: {
			type: String,
			enum: ["completed", "priority", "assigned", "failed"],
			required: [true, "Ticket Title is required!!"],
			trim: true,
		},
		tickets: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Tickets",
			},
		],
	},
	{
		timestamps: true,
	}
);

export const Ticket = mongoose.model<IStatus>("Ticket", statusSchema);
