import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response } from "express";
import { Project } from "../models/project.model";
import { Skill } from "../models/skill.model";

const getAllSkills = asyncHandler(async (req: Request, res: Response) => {
	const skills = await Skill.find();

	if (!skills) {
		throw new ApiError(404, "No skills available!");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, skills, "Projects successfully fetched!"));
});

const getSkill = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const skill = await Skill.findById(id);

	if (!skill) {
		throw new ApiError(404, "No such skill available!");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, skill, "Skill successfully fetched!"));
});

const createSkill = asyncHandler(async (req: Request, res: Response) => {
	const { skillType, skills } = req.body;

	if (!skillType || !skills) {
		throw new ApiError(400, "Please enter all fields!");
	}

	const creatingSkill = await Skill.create({
		skillType,
		skills,
	});

	const createdSkill = await Skill.findById(creatingSkill._id);

	if (!createdSkill) {
		throw new ApiError(500, "Something went wrong while creating skill!");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, createdSkill, "Skill created successfully!"));
});

const updateSkill = asyncHandler(async (req: Request, res: Response) => {
	const { skillType, skills } = req.body;
	const { id } = req.params;

	const skill = await Skill.findById(id);

	if (!skill) {
		throw new ApiError(404, "Skill doesn't exist!");
	}

	const updatedSkill = await Skill.findByIdAndUpdate(
		id,
		{ skillType, skills },
		{ new: true, runValidators: true }
	);

	if (!updatedSkill) {
		throw new ApiError(500, "Something went wrong while updating skill!");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, updatedSkill, "Skill updated successfully!"));
});

const removeSkill = asyncHandler(async (req: Request, res: Response) => {
	const { id } = req.params;

	const skill = await Skill.findById(id);

	if (!skill) {
		throw new ApiError(404, "Skill doesn't exist!");
	}

	const deletedSkill = await Skill.findByIdAndDelete(id, {
		runValidators: true,
	});

	if (!deletedSkill) {
		throw new ApiError(500, "Something went wrong while deleting Skill!");
	}

	return res
		.status(201)
		.json(new ApiResponse(200, deletedSkill, "Skill deleted successfully!"));
});

export { getAllSkills, createSkill, updateSkill, removeSkill, getSkill };
