import mongoose, { Schema } from "mongoose";
import { IProjectSkill } from "../types/projectTypes";

const projectSkillSchema = new Schema<IProjectSkill>(
	{
		skillsTitle: [
			{
				type: String,
				required: [true, "Job Skill Title is required!"],
				trim: true,
			},
		],
		skillsCategory: {
			type: String,
			enum: [
				"Front-End Development",
				"Back-End Development",
				"Full Stack Development",
			],
			required: [true, "Job Skill Category is required!"],
		},
	},
	{
		timestamps: true,
	}
);

export const ProjectSkill = mongoose.model<IProjectSkill>(
	"ProjectSkill",
	projectSkillSchema
);
