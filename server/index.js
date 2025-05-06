import { config } from "dotenv";
import express from "express";
const app = express();
const port = 3000;
import mongoose from "mongoose";
config();
mongoose.connect(process.env.MONGO_URI);
import pathRoutes from "./pathRoutes.js";
import cors from "cors";
app.use(express.json());

app.use(cors());
app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.use("/api/paths", pathRoutes);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
