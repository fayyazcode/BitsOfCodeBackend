import mongoose from "mongoose";
import { IUser } from "../userTypes";

export interface IStatus extends Document {
	status: string;
	tickets: mongoose.Schema.Types.ObjectId[];
}
export interface IStatusSkill extends Document {
	skillsTitle: string[];
	skillsCategory: string;
}
