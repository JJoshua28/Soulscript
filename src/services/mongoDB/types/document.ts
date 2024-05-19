import mongoose, { Document } from "mongoose";
import { Entry, NewEntry } from "../../../types/entries";

interface EntryDocument extends Document, Omit<Entry, "id"> {
    _id: mongoose.Types.ObjectId;
}

export default EntryDocument;