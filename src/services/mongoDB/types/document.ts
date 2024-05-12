import mongoose, { Document } from "mongoose";
import { NewMoodEntry } from "../../../types/entries";

export interface MoodEntryDocument extends NewMoodEntry, Document {
    _id: mongoose.Types.ObjectId;
}