import { Router } from "express";
import {Auth} from "../controllers/Auth.js"
import authMiddleware from "../middlewares/AuthMiddlewares.js";
import ChatGroup from "../controllers/ChatGroup.js";

const router=Router();

//Auth Routes
router.post("/auth/login",Auth.login)

//Chat Group routes
router.post("/chat-group",authMiddleware,ChatGroup.store)
router.get("/chat-group",authMiddleware,ChatGroup.index)
router.get("/chat-group/:id",authMiddleware,ChatGroup.show)
router.put("/chat-group/:id",authMiddleware,ChatGroup.update)
router.delete("/chat-group/:id",authMiddleware,ChatGroup.destroy)

export default router