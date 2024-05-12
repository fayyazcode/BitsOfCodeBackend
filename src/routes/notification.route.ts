import { Router } from "express";
import {
	getNotifications,
	viewNotifications,
} from "../controllers/notification.controller";
import { authMiddleware, roleCheck } from "../middlewares/auth.middleware";

const router = Router();

router.route("/").get(authMiddleware, roleCheck("author"), getNotifications);

router
	.route("/view")
	.get(authMiddleware, roleCheck("author"), viewNotifications);

export default router;
