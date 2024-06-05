import { Ticket } from "./../models/ticket.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Post } from "../models/post.model";
import { Request, Response } from "express";
import { IComment } from "../types/commentTypes";
import getDataUri, { File } from "../utils/dataUri";
import cloudinary from "cloudinary";
import DataURIParser from "datauri/parser";
import { Notification } from "../models/notification.model";
import { ObjectId } from "mongoose";
import { Project } from "../models/project.model";

const getAllTickets = asyncHandler(async (req: Request, res: Response) => {
	const { projectId } = req.query;

	const tickets = await Ticket.find({
		project: projectId,
	}).populate("developer", "project");

	if (!tickets) {
		throw new ApiError(404, "No tickets available!");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, tickets, "Tickets successfully fetched!"));
});

const getSingleTicket = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const ticket = await Ticket.findById(id).populate("developer", "project");

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
		projectTimeline,
		projectCategory,
		projectSkills,
		projectManager,
		clientName,
		budgetType,
		budgetAmount,
		description,
	} = req.body;

	if (
		!title ||
		!projectTimeline ||
		!projectCategory ||
		!projectSkills ||
		!projectManager ||
		!clientName ||
		!budgetType ||
		!budgetAmount ||
		!description
	) {
		throw new ApiError(400, "Please enter all fields!");
	}

	const project = await Project.create({
		title,
		projectTimeline,
		projectCategory,
		projectSkills,
		projectManager,
		clientName,
		budgetType,
		budgetAmount,
		description,
	});

	const createdProject = await Project.findById(project._id);

	if (!createdProject) {
		throw new ApiError(500, "Something went wrong while creating project!");
	}

	return res
		.status(201)
		.json(
			new ApiResponse(200, createdProject, "Project created successfully!")
		);
});

const updateProject = asyncHandler(async (req: Request, res: Response) => {
	const {
		title,
		projectTimeline,
		projectCategory,
		projectSkills,
		projectManager,
		clientName,
		budgetType,
		budgetAmount,
		description,
	} = req.body;
	const { id } = req.params;

	const project = await Project.findById(id);

	if (!project) {
		throw new ApiError(404, "Project doesn't exist!");
	}

	const updatedProject = await Project.findByIdAndUpdate(
		id,
		{
			title,
			projectTimeline,
			projectCategory,
			projectSkills,
			projectManager,
			clientName,
			budgetType,
			budgetAmount,
			description,
		},
		{ new: true, runValidators: true }
	);

	if (!updatedProject) {
		throw new ApiError(500, "Something went wrong while updating project!");
	}

	return res
		.status(201)
		.json(
			new ApiResponse(200, updatedProject, "Project updated successfully!")
		);
});

const removeProject = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const project = await Project.findById(id);
	console.log({ project });

	if (!project) {
		throw new ApiError(404, "Project doesn't exist!");
	}

	const deletedProject = await Project.findByIdAndDelete(id, {
		runValidators: true,
	});

	console.log({ deletedProject });

	if (!deletedProject) {
		throw new ApiError(500, "Something went wrong while deleting Project!");
	}

	return res
		.status(201)
		.json(
			new ApiResponse(200, deletedProject, "Project deleted successfully!")
		);
});

export {
	getAllTickets,
	createTicket,
	updateProject,
	removeProject,
	getSingleTicket,
};
