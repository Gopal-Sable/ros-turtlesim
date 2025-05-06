import express from "express";
import Path from "./models/paths.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { name, path } = req.body;

        if (!name || !Array.isArray(path) || path.length === 0) {
            return res
                .status(400)
                .json({ message: "Name and path are required." });
        }

        const newPath = new Path({ name, path });
        const savedPath = await newPath.save();
        res.status(201).json(savedPath);
    } catch (err) {
        if (err.code === 11000) {
            return res
                .status(400)
                .json({ message: "Path name must be unique." });
        }
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// GET /api/paths/:id — Get a specific path by id
router.get("/:id", async (req, res) => {
    try {
        const path = await Path.findById(req.params.id);
        if (!path) return res.status(404).json({ message: "Path not found" });
        res.json(path);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});
router.get("/", async (req, res) => {
    try {
        const paths = await Path.find({}, { path: 0 });
        res.json(paths);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});
export default router;
