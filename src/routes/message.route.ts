import { Router } from "express";
import { sendMessage, allMessages } from "../controllers/message.controller";
import { authMiddleware, roleCheck } from "../middlewares/auth.middleware";

const router = Router();

router.route("/").post(authMiddleware, sendMessage);

router.route("/:chatId").get(authMiddleware, allMessages);

export default router;
