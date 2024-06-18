import { ITicket } from "./../types/ticketTypes/index";
import mongoose, { Schema } from "mongoose";

const ticketSchema = new Schema<ITicket>(
	{
		title: {
			type: String,
			required: [true, "Ticket Title is required!!"],
			trim: true,
		},
		tags: [
			{
				type: String,
				required: [true, "Ticket Tags are required!!"],
				trim: true,
			},
		],
		priority: {
			type: String,
			enum: ["urgent", "medium", "1 week"],
			required: [true, "Ticket Priority is required!!"],
			trim: true,
		},
		duration: {
			type: String,
			required: [true, "Ticket Duration is required!!"],
			trim: true,
		},
		description: {
			type: String,
			required: [true, "Project Description is required!"],
		},
		developer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		project: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Project",
		},
		minimumBid: {
			type: Number,
			required: [true, "Minimum Bid is required!!"],
			trim: true,
		},
		maximumBid: {
			type: Number,
			required: [true, "Minimum Bid is required!!"],
			trim: true,
		},
		applied: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		bids: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Bid",
			},
		],
	},
	{
		timestamps: true,
	}
);

export const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);
