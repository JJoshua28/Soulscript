import mongoose from "mongoose";

import EntryDocument from "../../../src/services/mongoDB/types/document";
import { EntryTypes, Entry, NewEntry, CustomEntry, NewCustomEntry } from "../../../src/types/entries";
import entryModel from "../../../src/services/mongoDB/models/entry";
import moment from "moment";

const createNewMoodEntry = (defaultEntry: NewEntry, entry?:NewCustomEntry): NewEntry=> {
    const {
        type,
        sharedID, 
        subject, 
        quote, 
        tags, 
        datetime, 
        content 
    } = defaultEntry;

    return {
        type,
        sharedID,
        subject,
        quote,
        tags,
        datetime,
        content,
        ...entry
    }
}

const createMoodEntry = (defaultEntry: Entry, entry?:CustomEntry): Entry=> {
    const {
        id,
        type,
        sharedID, 
        subject, 
        quote, 
        tags, 
        datetime, 
        content 
    } = defaultEntry;
    return {
        id,
        type,
        sharedID,
        subject,
        quote,
        tags,
        datetime,
        content,
        ...entry
    }
}

const createMoodEntryDocument = (defaultDocument: Entry, entry?:CustomEntry) => {
    const {
        id,
        type,
        sharedID, 
        subject, 
        quote, 
        tags, 
        datetime, 
        content 
    } = defaultDocument;

    return {
        _id: id,
        type,
        sharedID,
        subject,
        quote,
        tags,
        datetime,
        content,
        ...entry
    } as EntryDocument
}

const seedTestData = async () => {
    const defaultMoodEntry:Entry = {
        id: new mongoose.Types.ObjectId(),
        sharedID: new mongoose.Types.ObjectId(),
        type: EntryTypes.MOOD,
        subject: "test data",
        quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        tags: ["test"],
        content: "exhausted",
        datetime: new Date()
    };
    let testData: Entry[] = [
        {...defaultMoodEntry, datetime: new Date(moment().format("YYYY-MM-DD")),  content: "happy"},
        {...defaultMoodEntry, datetime: new Date(moment().format("YYYY-MM-DD")), content: "exhausted"},
        {...defaultMoodEntry, datetime: new Date("2020-10-25"), content: "depressed"},
        {...defaultMoodEntry, datetime: new Date("2015-05-15"), content: "depressed"}
    ];  
    await entryModel.insertMany(testData);
}


export { createNewMoodEntry, createMoodEntry, createMoodEntryDocument, seedTestData}