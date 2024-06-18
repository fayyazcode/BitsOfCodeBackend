import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { Project } from "../models/project.model";
import { Skill } from "../models/skill.model";
import { Bid } from "../models/bid.model";
import { Ticket } from "../models/ticket.model";

const getTicketBids = asyncHandler(async (req: Request, res: Response) => {
	const { ticket } = req.query;

	const bids = await Bid.find({
		ticket,
	});

	if (!bids) {
		throw new ApiError(404, "No bids available!");
	}

	return res
		.status(200)
		.json(
			new ApiResponse(
				200,
				bids,
				`Bids for ticket id = ${ticket} successfully fetched!`
			)
		);
});

const getTicketBid = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const bid = await Bid.findById(id);

	if (!bid) {
		throw new ApiError(404, "No such bid available!");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, bid, "Bid successfully fetched!"));
});

const addTicketBid = asyncHandler(async (req: Request, res: Response) => {
	const { amount, bidder, ticket, status } = req.body;

	if (!amount || !bidder || !ticket) {
		throw new ApiError(400, "Please enter all fields!");
	}

	const findTicket = await Ticket.findById(ticket);

	if (!findTicket) {
		throw new ApiError(400, "Ticket not found!");
	}

	const creatingBid = await Bid.create({
		amount,
		bidder,
		ticket,
		status,
	});

	const createdBid = await Bid.findById(creatingBid._id);

	if (!createdBid) {
		throw new ApiError(500, "Something went wrong while creating Bid!");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, createdBid, "Bid created successfully!"));
});

const updateTicketBid = asyncHandler(async (req: Request, res: Response) => {
	const { amount, bidder } = req.body;
	const { id } = req.params;

	if (!amount || !bidder) {
		throw new ApiError(400, "Please enter all fields!");
	}

	const findBid = await Bid.findById(id);

	if (!findBid) {
		throw new ApiError(400, "Bid not found!");
	}

	const updatedBid = await Skill.findByIdAndUpdate(id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!updatedBid) {
		throw new ApiError(500, "Something went wrong while updating bid!");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, updatedBid, "Bid updated successfully!"));
});

const removeTicketBid = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const bid = await Bid.findById(id);

	if (!bid) {
		throw new ApiError(404, "Bid doesn't exist!");
	}

	const deletedBid = await Bid.findByIdAndDelete(id, {
		runValidators: true,
	});

	if (!deletedBid) {
		throw new ApiError(500, "Something went wrong while deleting Bid!");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, deletedBid, "Bid deleted successfully!"));
});

export {
	getTicketBids,
	addTicketBid,
	updateTicketBid,
	removeTicketBid,
	getTicketBid,
};
