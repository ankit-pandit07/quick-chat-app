import { Request, Response } from "express";

export class UploadController {
    static async uploadFile(req: Request, res: Response) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No file provided" });
            }
            
            const fileUrl = `/uploads/${req.file.filename}`;
            return res.json({
                message: "File uploaded successfully",
                url: fileUrl
            });
        } catch (error) {
            console.error("Upload error", error);
            return res.status(500).json({
                message: "Something went wrong during upload"
            });
        }
    }
}
