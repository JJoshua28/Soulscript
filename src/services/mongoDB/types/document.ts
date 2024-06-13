import mongoose, { Document } from "mongoose";
import { NewEntry } from "../../../types/entries";
import { NewTag } from "../../../types/tags";

export interface EntryDocument extends Document, NewEntry {
    _id: mongoose.Types.ObjectId;
}

export interface TagDocument extends Document, NewTag {
    _id: mongoose.Types.ObjectId;
}