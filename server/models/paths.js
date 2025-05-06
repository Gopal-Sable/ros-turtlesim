import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

const PathSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    path: {
        type: [
            {
                x: Number,
                y: Number,
                z: Number,
            },
        ],
    },
    start: Number,
    end: Number,
    date: {
        type: Date,
        default: Date.now,
        immutable: true,
    },
});

const Path = model("paths", PathSchema);

export default Path;
