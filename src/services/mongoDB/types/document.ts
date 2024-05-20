import mongoose, { Document } from "mongoose";
import { NewEntry } from "../../../types/entries";

interface EntryDocument extends Document, NewEntry {
    _id: mongoose.Types.ObjectId;
}

export default EntryDocument;