import mongoose from "mongoose";

import { MoodEntryDocument } from "../../../src/services/mongoDB/types/document";
import { CustomMoodEntry, NewMoodEntry, MoodEntry, EntryTypes } from "../../../src/types/entries";

import { defaultMoodEntry } from "../moodEntry";
import { moodEntryModel } from "../../../src/services/mongoDB/models/entry";

const createNewMoodEntry = (entry?:CustomMoodEntry): NewMoodEntry=> {
    const {
        type, 
        subject, 
        quote, 
        tags, 
        datetime, 
        mood 
    } = defaultMoodEntry;

    return {
        type,
        subject,
        quote,
        tags,
        datetime,
        mood,
        ...entry
    }
}

const createMoodEntry = (entry?:CustomMoodEntry): MoodEntry=> {
    const {
        id,
        type, 
        subject, 
        quote, 
        tags, 
        datetime, 
        mood 
    } = defaultMoodEntry;

    return {
        id,
        type,
        subject,
        quote,
        tags,
        datetime,
        mood,
        ...entry
    }
}

const createMoodEntryDocument = (entry?:CustomMoodEntry) => {
    const {
        id,
        type, 
        subject, 
        quote, 
        tags, 
        datetime, 
        mood 
    } = defaultMoodEntry;

    return {
        _id: id,
        type,
        subject,
        quote,
        tags,
        datetime,
        mood,
        ...entry
    } as MoodEntryDocument
}

const seedTestData = async () => {
    const defaultMoodEntry:MoodEntry = {
        id: new mongoose.Types.ObjectId(),
        type: [EntryTypes.MOOD],
        subject: "test data",
        quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        tags: ["test"],
        mood: "exhausted",
        datetime: new Date()
    };
    let testData: NewMoodEntry[] = [
        {...defaultMoodEntry, datetime: new Date(), mood: "happy"},
        {...defaultMoodEntry, datetime: new Date(), mood: "exhausted"},
        {...defaultMoodEntry, datetime: new Date("2020-10-25"), mood: "depressed"},
        {...defaultMoodEntry, datetime: new Date("2015-05-15"), mood: "depressed"}
    ];  
    await moodEntryModel.insertMany(testData);
}


export { createNewMoodEntry, createMoodEntry, createMoodEntryDocument, seedTestData}