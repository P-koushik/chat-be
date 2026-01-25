import { Router } from "express"
import { createUser } from "../controllers/user/create-user"
import { getUser, getAllUsers } from "../controllers/user/get-user"
import { sendUserRequest } from "../controllers/user/send-user-request"

const router = Router()

// Create a new user
router.post("/user/create", createUser)

// Get user by ID
router.get("/user/:userId", getUser)

// Get all users
router.get("/user", getAllUsers)

// Send user request (friend request)
router.post("/user/request/send", sendUserRequest)

export { router as User_routes }
