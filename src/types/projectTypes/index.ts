import mongoose from "mongoose";
import { IUser } from "../userTypes";

export interface IProject extends Document {
	title: string;
	projectTimeline: string;
	projectCategory: string;
	projectSkills: [string];
	projectManager: mongoose.Schema.Types.ObjectId;
	clientName: string;
	budgetType: string;
	budgetAmount?: number;
}

export interface IProjectSkill extends Document {
	skillsTitle: string[];
	skillsCategory: string;
}
