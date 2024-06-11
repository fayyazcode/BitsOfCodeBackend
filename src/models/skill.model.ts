import { ISkill } from "./../types/skillTypes/index";

import mongoose, { Schema } from "mongoose";

const skillSchema = new Schema<ISkill>(
	{
		skillType: {
			type: String,
			required: [true, "Ticket Title is required!!"],
			trim: true,
		},
		skills: [
			{
				type: String,
				required: [true, "Atleast one skill is required"],
				trim: true,
			},
		],
	},
	{
		timestamps: true,
	}
);

export const Skill = mongoose.model<ISkill>("Skill", skillSchema);
