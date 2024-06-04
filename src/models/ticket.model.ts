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
		prority: {
			type: String,
			required: [true, "Ticket Priority is required!!"],
			trim: true,
		},
		price: {
			type: String,
			required: [true, "Ticket Price is required!!"],
			trim: true,
		},
		duration: {
			type: String,
			required: [true, "Ticket Duration is required!!"],
			trim: true,
		},
		// description: {
		// 	type: Object,
		// 	required: [true, "Project Description is required!"],
		// },
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
	},
	{
		timestamps: true,
	}
);

export const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);
