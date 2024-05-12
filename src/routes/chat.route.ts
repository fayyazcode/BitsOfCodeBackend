import { Router } from "express";
import {
	accessChat,
	fetchChat,
	createGroupChat,
	renameGroup,
	removeFromGroup,
	addToGroup,
} from "../controllers/chat.controller";
import { authMiddleware, roleCheck } from "../middlewares/auth.middleware";

const router = Router();

router
	.route("/")
	.post(authMiddleware, accessChat)
	.get(authMiddleware, fetchChat);

router.route("/group").post(authMiddleware, createGroupChat);
router.route("/renameGroup").patch(authMiddleware, renameGroup);
router.route("/groupremove").patch(authMiddleware, removeFromGroup);
router.route("/groupadd").patch(authMiddleware, addToGroup);

export default router;
