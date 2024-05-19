import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";
import { ResetPasswordToken } from "../models/resetPasswordToken.model";
import sendEmail from "../utils/sendMail";
import crypto from "crypto";
import { IUser } from "../types/userTypes";
import { Request, Response } from "express";

const EXPIRE_TIME = 24 * 60 * 60 * 1000;

// Generate New Refresh Token and Access Token
const generateAccessAndRefreshTokens = async (userId: string) => {
	try {
		const user = await User.findById(userId);
		if (!user) {
			throw new ApiError(404, "User not found");
		}

		const accessToken = await user.generateAccessToken();
		const refreshToken = await user.generateRefreshToken();

		if (!accessToken || !refreshToken) {
			throw new ApiError(
				500,
				"Access token or refresh token generation failed"
			);
		}

		user.refreshToken = refreshToken;
		await user.save({ validateBeforeSave: false });

		return { accessToken, refreshToken };
	} catch (error) {
		throw new ApiError(
			500,
			"Something went wrong while generating refresh and access token!"
		);
	}
};

// Signup
const registerUser = asyncHandler(async (req: Request, res: Response) => {
	const { name, username, email, password, roles } = req.body;

	if (!name || !username || !email || !password) {
		throw new ApiError(400, "Please fill all details!");
	}

	const existedUser = await User.findOne({ $or: [{ username }, { email }] });

	if (existedUser) {
		throw new ApiError(409, `Username or Email has already been used.`);
	}

	const user = await User.create({
		name,
		username,
		email,
		password,
		roles,
	});

	const createdUser = await User.findById(user._id).select(
		"-password -refreshToken"
	);

	if (!createdUser) {
		throw new ApiError(500, "Something went wrong while registering the user!");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, createdUser, "User registered Successfully!"));
});

// Login
const loginUser = asyncHandler(async (req: Request, res: Response) => {
	const { emailOrUsername, password } = req.body;

	if (!emailOrUsername || !password) {
		throw new ApiError(400, "Please fill all details!");
	}

	const user = await User.findOne({
		$or: [{ username: emailOrUsername }, { email: emailOrUsername }],
	});

	if (!user) {
		throw new ApiError(404, "User not found");
	}

	// compare password with hashed password
	// const matched = await bcrypt.compare(password, user.password);
	const matched = await user.isPasswordCorrect(password);

	if (!user) {
		throw new ApiError(401, `User doesnot exist!`);
	}

	if (!matched) {
		throw new ApiError(401, `Invalid user credentials!`);
	}

	// const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);

	const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
		user._id.toString()
	);

	user.refreshTokens.push({ token: refreshToken });
	// user.fcmToken.push(fcmToken);

	// remove password from response
	delete user._doc.password;

	await user.save({ validateBeforeSave: false });

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.cookie("accessToken", accessToken, options)
		.cookie("refreshToken", refreshToken, options)
		.json(
			new ApiResponse(
				200,
				{
					user,
					accessToken,
					refreshToken,
					expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
				},
				"Login Successful!"
			)
		);
});

// Logout
const logoutUser = asyncHandler(async (req: Request, res: Response) => {
	const { _id } = req.user;

	await User.findByIdAndUpdate(
		_id,
		{
			$set: { refreshTokens: [] },
			// $pull: { fcmToken },
		},
		{
			new: true,
		}
	);

	const options = {
		httpOnly: true,
		secure: true,
	};

	return res
		.status(200)
		.clearCookie("accessToken", options)
		.cookie("refreshToken", options)
		.json(new ApiResponse(200, {}, "User logged out successfully!"));
});

// get all users
const allUsers = asyncHandler(async (req: Request, res: Response) => {
	const { _id: userId } = req.user;
	const keyword = req.query.search
		? {
				$or: [
					{ name: { $regex: req.query.search, $options: "i" } },
					{ email: { $regex: req.query.search, $options: "i" } },
				],
		  }
		: {};

	const options = {
		httpOnly: true,
		secure: true,
	};

	const users = await User.find(keyword).find({ _id: { $ne: userId } });

	return res
		.status(200)
		.clearCookie("accessToken", options)
		.cookie("refreshToken", options)
		.json(new ApiResponse(200, { users }, "User logged out successfully!"));
});

// User Profile
const userProfile = asyncHandler(async (req: Request, res: Response) => {
	const { username } = req.user;

	const user = await User.findOne({ username }).select("-password");

	if (!user) {
		throw new ApiError(404, `User not found!`);
	}

	return res
		.status(200)
		.json(new ApiResponse(200, user, "User profile fetched successfully!"));
});

// Refresh Access Token if access token expires
const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
	const incomingRefreshToken =
		req.cookies.refreshToken || req.body.refreshToken;

	if (!incomingRefreshToken) {
		throw new ApiError(401, "Unauthorized request!");
	}

	try {
		const user = await User.findById(req.user._id);

		if (!user) {
			throw new ApiError(401, `User doesnot exist!`);
		}

		const matchingRefreshToken = user.refreshTokens.find(
			(token) => token.token === incomingRefreshToken
		);

		if (!matchingRefreshToken) {
			throw new ApiError(401, "Invalid Refresh Token!");
		}

		user.refreshTokens = user.refreshTokens.filter(
			(token) => token.token !== incomingRefreshToken
		);

		const options = {
			httpOnly: true,
			secure: true,
		};

		const { accessToken, refreshToken: newRefreshToken } =
			await generateAccessAndRefreshTokens(user._id.toString());

		console.log("access token refresh token refreshed");

		// new refreshtoken
		user.refreshTokens.push({ token: newRefreshToken });

		await user.save({ validateBeforeSave: false });

		return res
			.status(200)
			.cookie("accessToken", accessToken, options)
			.cookie("refreshToken", newRefreshToken, options)
			.json(
				new ApiResponse(
					200,
					{
						accessToken,
						refreshToken: newRefreshToken,
						expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
					},
					"Access token refreshed successfully!"
				)
			);
	} catch (error: any) {
		throw new ApiError(401, error.message || "Invalid Refresh Token!");
	}
});

const sendResetPasswordToken = asyncHandler(
	async (req: Request, res: Response) => {
		const { email } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			throw new ApiError(400, "User with given email address doesnot exist!");
		}

		let token = await ResetPasswordToken.findOne({ userId: user._id });

		if (!token) {
			token = await new ResetPasswordToken({
				userId: user._id,
				token: crypto.randomBytes(32).toString("hex"),
			}).save();
		}

		const link = `${process.env.BASE_URL}/reset-password/${user._id}/${token.token}`;
		await sendEmail(user.email, "Password reset", link);

		return res
			.status(200)
			.json(
				new ApiResponse(200, "Reset password link sent to your email address!")
			);
	}
);

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
	const { userId, token: enteredToken } = req.params;
	const { password } = req.body;

	const user = await User.findById(userId);

	if (!user) {
		throw new ApiError(
			400,
			"Invalid Link or maybe your link has been expired!"
		);
	}

	let resetPasswordToken = await ResetPasswordToken.findOne({
		userId: user._id,
		token: enteredToken,
	});

	if (!resetPasswordToken) {
		throw new ApiError(
			400,
			"Invalid Link or maybe your link has been expired!"
		);
	}

	user.password = password;
	await user.save();
	await ResetPasswordToken.findOneAndDelete({
		token: enteredToken,
	});

	return res
		.status(200)
		.json(new ApiResponse(200, "Password Reset Successfully!"));
});

const roleAssign = asyncHandler(async (req: Request, res: Response) => {
	const { userId, role } = req.body;

	const user = await User.findById(userId);

	if (!user) {
		throw new ApiError(400, "User not found!");
	}

	let roleUpdated = await User.findByIdAndUpdate(userId, {
		assignedRole: role,
	});

	if (!roleUpdated) {
		throw new ApiError(500, "Something went wrong while creating role!");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, "Role updated Successfully!"));
});

export {
	registerUser,
	loginUser,
	logoutUser,
	userProfile,
	refreshAccessToken,
	sendResetPasswordToken,
	resetPassword,
	allUsers,
	roleAssign,
};
