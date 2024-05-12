import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Post } from "../models/post.model";
import { Request, Response } from "express";
import { IComment } from "../types/commentTypes";
import getDataUri, { File } from "../utils/dataUri";
import cloudinary from "cloudinary";
import DataURIParser from "datauri/parser";
import { messaging } from "../firebase";
import { Notification } from "../models/notification.model";
import { ObjectId } from "mongoose";

const getAllPosts = asyncHandler(async (req: Request, res: Response) => {
	const posts = await Post.find().populate("authorId");

	if (!posts) {
		throw new ApiError(404, "No posts available!");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, posts, "Posts successfully fetched!"));
});

const getSinglePost = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const post = await Post.findById(id)
		.populate({
			path: "authorId",
			select: "-password", // Exclude password field
		})
		.populate({
			path: "comments.authorId",
			select: "-password", // Exclude password field
		})
		.populate("likes");

	if (!post) {
		throw new ApiError(404, "No such post available!");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, post, "Posts successfully fetched!"));
});

const createSinglePost = asyncHandler(async (req: Request, res: Response) => {
	const { title, description } = req.body;

	const file = req.file;

	// extracting author id from authentication middleware
	const { _id: authorId } = req.user;

	if (!title || !description) {
		throw new ApiError(400, "Please enter all fields!");
	}

	// upload image to cloudinary
	if (!file) {
		throw new ApiError(400, "Please upload an image!");
	}

	let fileUri: DataURIParser = getDataUri(file);

	if (!fileUri) {
		throw new ApiError(500, "Error converting file to data URI");
	}

	const mycloud = await cloudinary.v2.uploader.upload(
		fileUri.content as string
	);

	const post = await Post.create({
		title,
		authorId,
		description,
		image: {
			public_id: mycloud.public_id,
			url: mycloud.secure_url,
		},
	});

	const createdPost = await Post.findById(post._id);

	if (!createdPost) {
		throw new ApiError(500, "Something went wrong while creating post!");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, createdPost, "Post created successfully!"));
});

const updatePost = asyncHandler(async (req: Request, res: Response) => {
	const { title, authorId, description } = req.body;
	const { id } = req.params;
	const file = req.file;

	const posts = await Post.findById(id);

	if (!posts) {
		throw new ApiError(404, "Post doesn't exist!");
	}

	// upload image to cloudinary
	if (!file) {
		throw new ApiError(400, "Please upload an image!");
	}

	let fileUri: DataURIParser = getDataUri(file);

	if (!fileUri) {
		throw new ApiError(500, "Error converting file to data URI");
	}

	const mycloud = await cloudinary.v2.uploader.upload(
		fileUri.content as string
	);

	const updatedPost = await Post.findByIdAndUpdate(
		id,
		{
			title,
			authorId,
			description,
			image: {
				public_id: mycloud.public_id,
				url: mycloud.secure_url,
			},
		},
		{ new: true, runValidators: true }
	);

	if (!updatedPost) {
		throw new ApiError(500, "Something went wrong while creating post!");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, updatedPost, "Post updated successfully!"));
});

const removePost = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const posts = await Post.findById(id);

	if (!posts) {
		throw new ApiError(404, "Post doesn't exist!");
	}

	const deletedPost = await Post.findByIdAndDelete(id, {
		runValidators: true,
	});

	if (!deletedPost) {
		throw new ApiError(500, "Something went wrong while creating post!");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, deletedPost, "Post deleted successfully!"));
});

const likePost = asyncHandler(async (req: Request, res: Response) => {
	const { postId } = req.params;

	const { _id: user, firstName, lastName } = req.user;

	const post = await Post.findById(postId).populate({
		path: "authorId",
		select: "-password", // Exclude password field
	});

	const gettingNotifications = await Notification.find({
		userId: post?.authorId._id,
	});

	let newNotification = new Notification();

	if (!post) {
		throw new ApiError(400, "Post not found!");
	}

	const likedIndex = post.likes.indexOf(user);

	if (likedIndex !== -1) {
		post.likes.splice(likedIndex, 1);
	} else {
		post.likes.push(user);

		if (gettingNotifications.length) {
			const notificationToUpdate = gettingNotifications[0];

			if (!notificationToUpdate.userId) {
				notificationToUpdate.userId = post.authorId._id as ObjectId;
			}

			notificationToUpdate.notifications.push({
				title: "Received new notification!",
				body: `${firstName} ${lastName} liked your post`,
			});

			await notificationToUpdate.save();
		} else {
			newNotification.userId = post.authorId._id as ObjectId;
			newNotification.notifications.push({
				title: "Received new notification!",
				body: `${firstName} ${lastName} liked your post`,
			});
			await newNotification.save();
		}

		post.authorId.fcmToken.forEach(async (token) => {
			await messaging
				.send({
					token,
					notification: {
						title: "Received new notification!",
						body: `${firstName} ${lastName} liked your post`,
					},
				})
				.then((response: unknown) => {
					console.log("Successfully sent message to", token, response);
				})
				.catch((error: unknown) => {
					console.error("Error sending message to", token, error);
				});
		});
	}

	await post.save();

	return res
		.status(201)
		.json(
			new ApiResponse(
				200,
				likedIndex !== -1
					? "Post unliked successfully"
					: "Post liked successfully"
			)
		);
});

const commentPost = asyncHandler(async (req: Request, res: Response) => {
	const { postId } = req.params;
	const { content } = req.body;
	const { _id: authorId, firstName, lastName } = req.user;

	const post = await Post.findById(postId).populate({
		path: "authorId",
		select: "-password", // Exclude password field
	});

	if (!post) {
		throw new ApiError(400, "Post not found!");
	}

	const newComment = {
		authorId,
		content,
	} as IComment;

	post.comments.push(newComment);

	post.authorId.fcmToken.forEach(async (token) => {
		messaging
			.send({
				token, // Use the current token from the loop
				notification: {
					title: "Received new notification!",
					body: `${firstName} ${lastName} commented on your post`,
				},
			})
			.then((response: unknown) => {
				console.log("Successfully sent message to", token, response);
			})
			.catch((error: unknown) => {
				console.error("Error sending message to", token, error);
			});
	});

	await post.save();

	return res
		.status(201)
		.json(
			new ApiResponse(
				200,
				{ comment: newComment },
				"Comment added successfully"
			)
		);
});

export {
	getAllPosts,
	createSinglePost,
	updatePost,
	removePost,
	getSinglePost,
	likePost,
	commentPost,
};
