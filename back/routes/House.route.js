import express from "express";
import { login, logOut, signup ,verifyEmail,forgotPassword,resetPassword,checkAuth, addFriend,removeFriend,googleAuth,getFriendsDetails} from "../controllers/House.controller.js";
import { auth } from "../middleware/auth.js";
import { verifyToken } from "../middleware/verifyToken.js";

const route = express.Router();


route.get("/check-auth",verifyToken,checkAuth)

// Public routes
route.post("/signUp", signup);
route.post("/login", login);
route.post("/auth/google", googleAuth);
route.post("/verify-email", verifyEmail);
route.post("/forgot-password", forgotPassword);
route.post("/reset-password/:token", resetPassword);
route.get("/friends/details", auth, getFriendsDetails);





// Protected routes
route.get("/check-auth", auth, checkAuth);
route.post("/logout", auth, logOut);
route.post('/friends/add', auth, addFriend);
route.delete('/friends/delete', auth, removeFriend);




export default route;