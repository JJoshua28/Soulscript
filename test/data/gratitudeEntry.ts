import mongoose from "mongoose";
import moment from "moment";

import { Entry, EntryTypes } from "../../src/types/entries";
import EntryDocument from "../../src/services/mongoDB/types/document";

const defaultGratitudeEntry:Entry = {
    id: new mongoose.Types.ObjectId(),
    type: EntryTypes.GRATITUDE,
    sharedID: new mongoose.Types.ObjectId(),
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["test"],
    content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"],
    datetime: new Date(moment().startOf("day").toISOString())
};

const mockGratitudeEntryDocument = {
    _id: new mongoose.Types.ObjectId(),
    sharedID: new mongoose.Types.ObjectId(),
    type: EntryTypes.GRATITUDE,
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["test"],
    content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua"],
    datetime: new Date(moment().startOf("day").toISOString())
}  as EntryDocument

export { defaultGratitudeEntry, mockGratitudeEntryDocument };