import mongoose, { Schema } from "mongoose";
import { IProject } from "../types/projectTypes";

const projectSchema = new Schema<IProject>(
	{
		title: {
			type: String,
			required: [true, "Ticket Title is required!!"],
			trim: true,
		},
		projectTimeline: {
			type: String,
			enum: ["Long term", "Short term"],
			required: [true, "project Timeline is required!!"],
		},
		projectCategory: {
			type: String,
			enum: [
				"Front-End Development",
				"Ecommerce Website Development",
				"Full Stack Development",
			],
			required: [true, "Project Category is required!!"],
		},
		projectSkills: [
			{
				type: String,
				required: [true, "Project Skills are required!"],
			},
		],
		projectManager: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Project Manager is required!"],
		},
		clientName: {
			type: String,
			ref: "User",
			required: [true, "Client Name is required!"],
		},
		budgetType: {
			type: String,
			enum: ["fixed", "hourly"],
			required: [true, "Project Budget Type is required!!"],
		},
		budgetAmount: {
			type: Number,
			required: [true, "Project Budget amount is required!"],
		},
		// description: {
		// 	type: Object,
		// 	required: [true, "Project Description is required!"],
		// },
		description: {
			type: String,
			required: [true, "Project Description is required!"],
		},
	},
	{
		timestamps: true,
	}
);

export const Project = mongoose.model<IProject>("Project", projectSchema);
