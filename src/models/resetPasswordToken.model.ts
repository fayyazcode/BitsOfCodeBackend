import mongoose, { Schema } from "mongoose";
import { IResetPasswordToken } from "../types";

const resetPasswordTokenSchema = new Schema<IResetPasswordToken>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User is required!"],
		},
		token: {
			type: String,
			required: [true, "Reset Password Token is required!"],
		},
		expiresAt: {
			type: Date,
		},
	},
	{
		timestamps: true,
		expireAfterSeconds: Date.now() + 15 * 60 * 1000,
	}
);

export const ResetPasswordToken = mongoose.model<IResetPasswordToken>(
	"ResetPasswordToken",
	resetPasswordTokenSchema
);
