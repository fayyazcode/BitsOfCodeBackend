import { Router } from "express";
import {
	createProject,
	getAllProjects,
	getSingleProject,
	removeProject,
	updateProject,
} from "../controllers/project.controller";
import { authMiddleware, roleCheck } from "../middlewares/auth.middleware";
import singleUpload from "../middlewares/multer";

const router = Router();

router
	.route("/")
	.get(authMiddleware, getAllProjects)
	.post(authMiddleware, roleCheck("super admin"), createProject);

router
	.route("/:id")
	.get(authMiddleware, getSingleProject)
	.delete(authMiddleware, removeProject)
	.patch(authMiddleware, roleCheck("super admin"), updateProject);

export default router;
