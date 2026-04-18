import { Router } from "express";
import {Auth} from "../controllers/Auth.js"
import authMiddleware from "../middlewares/AuthMiddlewares.js";
import ChatGroup from "../controllers/ChatGroup.js";
import { MessageController } from "../controllers/MessageController.js";
import { UploadController } from "../controllers/UploadController.js";
import { upload } from "../config/multer.js";
import express from "express";

const router=express.Router();

//Auth Routes
router.post("/auth/login",Auth.login)

//Chat Group routes
router.post("/chat-group",authMiddleware,ChatGroup.store)
router.get("/chat-group",authMiddleware,ChatGroup.index)
router.get("/chat-group/:id",ChatGroup.show)
router.put("/chat-group/:id",authMiddleware,ChatGroup.update)
router.delete("/chat-group/:id",authMiddleware,ChatGroup.destroy)
router.post("/chat-group/:id/join", ChatGroup.joinRoom)

//Message routes
router.get("/chat-group/:groupId/messages", MessageController.index)
router.put("/messages/:id", authMiddleware, MessageController.update)
router.delete("/messages/:id", authMiddleware, MessageController.destroy)

//Upload route
router.post("/upload", authMiddleware, upload.single("file"), UploadController.uploadFile)

export default router