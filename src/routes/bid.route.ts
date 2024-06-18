import { Router } from "express";
import {
	addTicketBid,
	getTicketBids,
	removeTicketBid,
	updateTicketBid,
} from "../controllers/bid.controller";
import { authMiddleware, roleCheck } from "../middlewares/auth.middleware";

const router = Router();

router
	.route("/")
	.get(authMiddleware, getTicketBids)
	.post(authMiddleware, addTicketBid);

router
	.route("/:id")
	.get(authMiddleware, getTicketBids)
	.delete(authMiddleware, removeTicketBid)
	.patch(authMiddleware, updateTicketBid);

export default router;
