import { Router } from "express";
import {
	createSkill,
	getAllSkills,
	getSkill,
	removeSkill,
	updateSkill,
} from "../controllers/skill.controller";
import { authMiddleware, roleCheck } from "../middlewares/auth.middleware";
import singleUpload from "../middlewares/multer";

const router = Router();

router
	.route("/")
	.get(authMiddleware, getAllSkills)
	.post(authMiddleware, createSkill);

router
	.route("/:id")
	.get(authMiddleware, getSkill)
	.delete(authMiddleware, removeSkill)
	.patch(authMiddleware, updateSkill);

export default router;
