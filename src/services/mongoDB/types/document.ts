import mongoose, { Document, PopulatedDoc, Types } from "mongoose";
import { Entry } from "../../../types/entries";
import { NewTag } from "../../../types/tags";

export interface TagDocument extends Document, NewTag {
    _id: mongoose.Types.ObjectId;
}

export interface EntryDocument extends Document, Omit<Entry, "id" | "tags"> {
    _id: mongoose.Types.ObjectId;
    tags: PopulatedDoc<Document<Types.ObjectId> | TagDocument>[];
}
