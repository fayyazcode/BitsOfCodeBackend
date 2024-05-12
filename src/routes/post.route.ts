import { Router } from "express";
import {
	createSinglePost,
	getAllPosts,
	removePost,
	updatePost,
	getSinglePost,
	likePost,
	commentPost,
} from "../controllers/post.controller";
import { authMiddleware, roleCheck } from "../middlewares/auth.middleware";
import singleUpload from "../middlewares/multer";

const router = Router();

router
	.route("/")
	.get(authMiddleware, getAllPosts)
	.post(authMiddleware, roleCheck("author"), singleUpload, createSinglePost);

router
	.route("/:id")
	.get(authMiddleware, getSinglePost)
	.patch(authMiddleware, roleCheck("author"), singleUpload, updatePost)
	.delete(authMiddleware, roleCheck("author"), removePost);

// like a post
router
	.route("/:postId/like")
	.patch(authMiddleware, roleCheck("author"), likePost);

// comment on post
router
	.route("/:postId/comment")
	.patch(authMiddleware, roleCheck("author"), commentPost);

export default router;
