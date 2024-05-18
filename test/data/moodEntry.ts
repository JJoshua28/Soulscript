import mongoose from "mongoose";

import { EntryTypes, MoodEntry } from "../../src/types/entries";
import { MoodEntryDocument } from "../../src/services/mongoDB/types/document";

const defaultMoodEntry:MoodEntry = {
    id: new mongoose.Types.ObjectId(),
    type: [EntryTypes.MOOD],
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["test"],
    mood: "exhausted",
    datetime: new Date()
};

const mockMoodEntryDocument: MoodEntryDocument = {
    _id: new mongoose.Types.ObjectId(),
    type: ["mood"],
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["test"],
    mood: "exhausted",
    datetime: new Date()
} as MoodEntryDocument;

export { defaultMoodEntry, mockMoodEntryDocument };