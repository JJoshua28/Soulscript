import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import { Entry, EntryTypes, NewEntry } from "../../src/types/entries";
import {  EntryDocument }  from "../../src/services/mongoDB/types/document";
import formatCurrentDate from "../../src/helpers/formatCurrentDate";

const datetime = formatCurrentDate();

const defaultMoodEntry:Entry = {
    id: new mongoose.Types.ObjectId().toString(),
    sharedID: uuidv4(),
    type: EntryTypes.MOOD,
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: [],
    content: "exhausted",
    datetime
};

const newMoodEntry: NewEntry = {
    type: EntryTypes.MOOD,
    sharedID: uuidv4(),
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: [new mongoose.Types.ObjectId()],
    content: "exhausted",
    datetime
}

const mockMoodEntryDocument: EntryDocument = {
    _id: new mongoose.Types.ObjectId(),
    sharedID: uuidv4(),
    type: EntryTypes.MOOD,
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: [new mongoose.Types.ObjectId()],
    content: "exhausted",
    datetime
} as EntryDocument;

export { defaultMoodEntry, mockMoodEntryDocument, newMoodEntry };