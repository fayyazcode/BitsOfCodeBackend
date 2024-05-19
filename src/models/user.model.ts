import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError";
import jwt from "jsonwebtoken";
import { IUser } from "../types/userTypes";

const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: [true, "Name is required!!"],
			trim: true,
		},
		username: {
			type: String,
			required: [true, "Username is required!!"],
			unique: true,
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Email is required!!"],
			unique: true,
			trim: true,
		},
		// hashed and salted password
		password: {
			type: String,
			required: [true, "Password is required!!"],
		},
		roles: {
			type: String,
			enum: ["freelancer", "client", "super admin"],
			default: "freelancer",
		},
		assignedRole: {
			type: String,
			enum: ["Developer", "Team Lead", "Project Manager"],
			default: "Developer",
		},
		phone: {
			type: String,
			default: "",
		},
		gender: {
			type: String,
			default: "male",
		},
		bio: {
			type: String,
			default: "",
		},
		isProfileComplete: {
			type: Boolean,
			default: false,
		},
		refreshTokens: [{ token: String }],
		fcmToken: [{ type: String }],
	},
	{
		timestamps: true,
	}
);

userSchema.pre<IUser>("save", async function (next) {
	try {
		const saltRounds = Number(process.env.SALT_ROUNDS) || 10;

		if (!this.isModified("password")) return next();

		this.password = await bcrypt.hash(this.password, saltRounds);

		next();
	} catch (error) {
		console.log("Error in user pre save", error);
		throw new ApiError(500, `User creation failed! ${error}`);
	}
});

userSchema.methods.isPasswordCorrect = async function (
	this: IUser,
	password: string
) {
	return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
	return jwt.sign(
		{
			_id: this._id,
			email: this.email,
			username: this.username,
			name: this.name,
		},
		process.env.ACCESS_TOKEN_SECRET as string,
		{ expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
	);
};

userSchema.methods.generateRefreshToken = function () {
	return jwt.sign(
		{
			_id: this._id,
		},
		process.env.REFRESH_TOKEN_SECRET as string,
		{ expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
	);
};

export const User = mongoose.model<IUser>("User", userSchema);
