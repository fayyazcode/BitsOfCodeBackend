import { Router } from "express";
import {
	createTicket,
	getAllTickets,
	getSingleTicket,
	removeTicket,
	updateTicket,
} from "../controllers/ticket.controller";
import { authMiddleware, roleCheck } from "../middlewares/auth.middleware";
import singleUpload from "../middlewares/multer";

const router = Router();

router
	.route("/")
	.get(authMiddleware, getAllTickets)
	.post(authMiddleware, roleCheck("super admin"), createTicket);

router
	.route("/:id")
	.get(authMiddleware, getSingleTicket)
	.delete(authMiddleware, roleCheck("super admin"), removeTicket)
	.patch(authMiddleware, roleCheck("super admin"), updateTicket);

export default router;
