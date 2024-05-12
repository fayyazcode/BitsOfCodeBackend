import mongoose, { Schema } from "mongoose";
import { IComment } from "../types/commentTypes";
import { IPost } from "../types/postTypes";

const commentSchema = new Schema<IComment>(
	{
		authorId: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		content: {
			type: String,
			required: [true, "Comment content is required!!"],
			trim: true,
		},
		likes: [{ type: Schema.Types.ObjectId, ref: "User" }], // Users who liked the comment
		replies: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
	},
	{
		timestamps: true,
	}
);

const postSchema = new Schema<IPost>(
	{
		title: {
			type: String,
			required: [true, "Post Name is required!!"],
			trim: true,
		},
		description: {
			type: String,
			required: [true, "Post description is required!!"],
			trim: true,
		},
		image: {
			public_id: {
				type: String,
				required: true,
			},
			url: {
				type: String,
				required: true,
			},
		},
		authorId: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
		comments: [commentSchema],
	},
	{
		timestamps: true,
	}
);

export const Post = mongoose.model<IPost>("Post", postSchema);
