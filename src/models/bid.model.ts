import mongoose, { Schema } from "mongoose";
import { IBid } from "../types/bidTypes";

const bidSchema = new Schema<IBid>(
	{
		amount: {
			type: Number,
			required: [true, "Bid amount is required!"],
			min: [0, "Bid amount must be a positive number!"],
		},
		bidder: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Bidder is required!"],
		},
		ticket: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Ticket",
			required: [true, "Ticket is required!"],
		},
		status: {
			type: String,
			enum: ["pending", "accepted", "rejected"],
			default: "pending",
		},
	},
	{
		timestamps: true,
	}
);

export const Bid = mongoose.model<IBid>("Bid", bidSchema);
