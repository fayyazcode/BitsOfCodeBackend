import { Router } from "express";
import {
	allDevelopers,
	allUsers,
	fetchProjectManagersOrTeamLead,
	loginUser,
	logoutUser,
	refreshAccessToken,
	registerUser,
	resetPassword,
	roleAssign,
	sendResetPasswordToken,
	userProfile,
	verifyResetPasswordOTP,
} from "../controllers/user.controller";
import {
	authMiddleware,
	roleCheck,
	verifyRefreshToken,
} from "../middlewares/auth.middleware";

const router = Router();

// auth
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// reset password
router.post("/getResetPassword", sendResetPasswordToken); // get reset password token
router.post("/verifyResetPasswordOtp", verifyResetPasswordOTP); // get reset password token
router.post("/reset-password", resetPassword); // reset password

// secured routes
router.get("/logout", authMiddleware, logoutUser);
router.route("/refreshToken").post(verifyRefreshToken, refreshAccessToken);

// profile
router.get("/profile", authMiddleware, userProfile);

router.get(
	"/projectManagersOrTeamLead",
	authMiddleware,
	fetchProjectManagersOrTeamLead
);

router.patch(
	"/role-assign",
	authMiddleware,
	roleCheck("super admin"),
	roleAssign
);
// router.put("/editprofile", authenticate, AuthController.userProfileEdit);

router.route("/").get(authMiddleware, allUsers);

router.route("/developers").get(authMiddleware, allDevelopers);

export default router;
