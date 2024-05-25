import mongoose from "mongoose";
import { IUser } from "../userTypes";

export interface IProject extends Document {
	title: string;
	projectTimeline: string;
	projectCategory: string;
	projectSkills: [string];
	projectManager: mongoose.Schema.Types.ObjectId;
	clientName: mongoose.Schema.Types.ObjectId;
	budgetType: string;
	budgetAmount?: number;
	description?: string;
}
// description?: object;

export interface IProjectSkill extends Document {
	skillsTitle: string[];
	skillsCategory: string;
}
