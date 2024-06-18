import { Ticket } from "./../models/ticket.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { Project } from "../models/project.model";
import { ITicket } from "../types/ticketTypes";

const getAllTickets = asyncHandler(async (req: Request, res: Response) => {
	const { projectId } = req.query;

	const tickets = await Ticket.find({
		project: projectId,
	})
		.populate("project")
		.populate("developer")
		.populate({
			path: "bids",
			populate: {
				path: "bidder",
				model: "User",
				select: "-password -refreshTokens",
			},
		})
		.populate({
			path: "bids",
			populate: {
				path: "ticket",
				model: "Ticket",
			},
		});

	if (!tickets) {
		throw new ApiError(404, "No tickets available!");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, tickets, "Tickets successfully fetched!"));
});

const getSingleTicket = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const ticket = await Ticket.findById(id)
		.populate("developer", "project")
		.populate({
			path: "bids",
			populate: {
				path: "bidder",
				model: "User",
				select: "-password -refreshTokens",
			},
		})
		.populate({
			path: "bids",
			populate: {
				path: "ticket",
				model: "Ticket",
			},
		});

	if (!ticket) {
		throw new ApiError(404, "No such ticket available!");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, ticket, "Ticket successfully fetched!"));
});

const createTicket = asyncHandler(async (req: Request, res: Response) => {
	const {
		title,
		tags,
		priority,
		duration,
		description,
		developer,
		project,
		minimumBid,
		maximumBid,
	} = req.body;

	if (
		!title ||
		!tags ||
		!priority ||
		!duration ||
		!description ||
		!minimumBid ||
		!maximumBid ||
		!project
	) {
		throw new ApiError(400, "Please enter all fields!");
	}

	const projectExists = await Project.findById(project);

	if (!projectExists) {
		throw new ApiError(404, "Project doesnot exist!");
	}

	let ticket: ITicket;
	if (developer.length) {
		ticket = await Ticket.create({
			title,
			tags,
			priority,
			duration,
			description,
			developer,
			project,
			minimumBid,
			maximumBid,
		});
	} else {
		ticket = await Ticket.create({
			title,
			tags,
			priority,
			duration,
			description,
			project,
			minimumBid,
			maximumBid,
		});
	}

	const ticketProject = await Ticket.findById(ticket._id);

	if (!ticketProject) {
		throw new ApiError(500, "Something went wrong while creating ticket!");
	}

	if (projectExists.tickets) {
		projectExists.tickets.push(ticket._id);
		await projectExists.save();
	}

	return res
		.status(201)
		.json(new ApiResponse(200, ticketProject, "Ticket created successfully!"));
});

const updateTicket = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const ticket = await Ticket.findById(id);

	if (!ticket) {
		throw new ApiError(404, "Ticket doesn't exist!");
	}

	const updatedTicket = await Ticket.findByIdAndUpdate(id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!updatedTicket) {
		throw new ApiError(500, "Something went wrong while updating project!");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, updatedTicket, "Ticket updated successfully!"));
});

const removeTicket = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const ticket = await Ticket.findById(id);

	if (!ticket) {
		throw new ApiError(404, "Ticket doesn't exist!");
	}

	const deletedTicket = await Ticket.findByIdAndDelete(id, {
		runValidators: true,
	});

	if (!deletedTicket) {
		throw new ApiError(500, "Something went wrong while deleting Ticket!");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, deletedTicket, "Ticket deleted successfully!"));
});

export {
	getAllTickets,
	createTicket,
	updateTicket,
	removeTicket,
	getSingleTicket,
};
