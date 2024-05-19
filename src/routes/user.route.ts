import { Router } from "express";
import {
	allUsers,
	loginUser,
	logoutUser,
	refreshAccessToken,
	registerUser,
	resetPassword,
	roleAssign,
	sendResetPasswordToken,
	userProfile,
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
router.post("/reset-password", sendResetPasswordToken); // get reset password token
router.post("/reset-password/:userId/:token", resetPassword); // reset password

// secured routes
router.get("/logout", logoutUser);
router.route("/refreshToken").post(verifyRefreshToken, refreshAccessToken);

// profile
router.get("/profile", authMiddleware, userProfile);

router.patch(
	"/role-assign",
	authMiddleware,
	roleCheck("super admin"),
	roleAssign
);
// router.put("/editprofile", authenticate, AuthController.userProfileEdit);

router.route("/").get(authMiddleware, allUsers);

export default router;
