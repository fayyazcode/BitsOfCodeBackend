import mongoose from "mongoose";

export interface IBid extends Document {
	amount: number;
	bidder: mongoose.Schema.Types.ObjectId;
	ticket: mongoose.Schema.Types.ObjectId;
	status: string;
}
