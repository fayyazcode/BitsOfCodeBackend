import mongoose from "mongoose";
import { IUser } from "../userTypes";

export interface ITicket extends Document {
	title: string;
	tags: string[];
	prority: string;
	price: string;
	duration: string;
	developer: mongoose.Schema.Types.ObjectId;
	project: mongoose.Schema.Types.ObjectId;
	description?: string;
}
// description?: object;

export interface ITicketSkill extends Document {
	skillsTitle: string[];
	skillsCategory: string;
}
