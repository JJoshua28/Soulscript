import mongoose from "mongoose";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";

import { Entry, EntryTypes } from "../../src/types/entries";
import {  EntryDocument }  from "../../src/services/mongoDB/types/document";

const defaultMoodEntry:Entry = {
    id: new mongoose.Types.ObjectId().toString(),
    sharedID: uuidv4(),
    type: EntryTypes.MOOD,
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["test"],
    content: "exhausted",
    datetime: new Date(moment().startOf("day").toISOString())
};

const mockMoodEntryDocument: EntryDocument = {
    _id: new mongoose.Types.ObjectId(),
    sharedID: uuidv4(),
    type: EntryTypes.MOOD,
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["test"],
    content: "exhausted",
    datetime: new Date(moment().startOf("day").toISOString())
} as EntryDocument;

export { defaultMoodEntry, mockMoodEntryDocument };