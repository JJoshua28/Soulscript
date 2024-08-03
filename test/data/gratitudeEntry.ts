import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

import { Entry, EntryTypes, NewEntry } from "../../src/types/entries";
import {  EntryDocument }  from "../../src/services/mongoDB/types/document";
import formatCurrentDate from "../../src/helpers/formatCurrentDate";

const datetime = formatCurrentDate()


const defaultGratitudeEntry:Entry = {
    id: new mongoose.Types.ObjectId().toString(),
    type: EntryTypes.GRATITUDE,
    sharedID: uuidv4(), 
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: [],
    content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"],
    datetime
};

const newGratitudeEntry: NewEntry = {
    type: EntryTypes.GRATITUDE,
    sharedID: uuidv4(),
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
    content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"],
    datetime
}

const mockGratitudeEntryDocument = {
    _id: new mongoose.Types.ObjectId(),
    sharedID: uuidv4(),
    type: EntryTypes.GRATITUDE,
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
    content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"],
    datetime
} as unknown  as EntryDocument

export { defaultGratitudeEntry, mockGratitudeEntryDocument, newGratitudeEntry };