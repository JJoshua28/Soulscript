import mongoose from "mongoose";

import { MoodEntry } from "../../src/types/entries";
import { MoodEntryDocument } from "../../src/services/mongoDB/types/document";

const defaultMoodEntry:MoodEntry = {
    id: new mongoose.Types.ObjectId(),
    type: ["mood"],
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

const moodEntryExpectation = {
    id: expect.any(mongoose.Types.ObjectId),
    type: expect.arrayContaining([expect.any(String)]),
    subject: expect.any(String),
    quote: expect.any(String),
    tags: expect.arrayContaining([expect.any(String)]),
    mood: expect.any(String),
    datetime: expect.anything() 
}

const moodEntryDocumentExpectation = {
    _id: expect.any(mongoose.Types.ObjectId),
    type: expect.arrayContaining([expect.any(String)]),
    subject: expect.any(String),
    quote: expect.any(String),
    tags: expect.arrayContaining([expect.any(String)]),
    mood: expect.any(String),
    datetime: expect.anything() 
}

export {defaultMoodEntry, mockMoodEntryDocument, moodEntryExpectation, moodEntryDocumentExpectation};