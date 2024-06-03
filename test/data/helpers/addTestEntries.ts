import mongoose from "mongoose";
import moment from "moment";

import { Entry, EntryTypes, NewEntry } from "../../../src/types/entries";

import entryModel from "../../../src/services/mongoDB/models/entry";

export const seedGratitudeEntryTestData = async () => {
    const gratitudeEntry:NewEntry = {
        type: EntryTypes.GRATITUDE,
        sharedID: new mongoose.Types.ObjectId(),
        subject: "test data",
        quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        tags: ["test"],
        content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."],
        datetime: new Date(moment().startOf("day").toISOString())
    };
    const basicGratitudeEntry:NewEntry = {
        type: EntryTypes.GRATITUDE,
        sharedID: null,
        subject: null,
        quote: null,
        tags: [],
        content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."],
        datetime: new Date(moment().startOf("day").toISOString())
    };

    let testData: NewEntry[] = [
        basicGratitudeEntry,
        {...gratitudeEntry, content: ["Lorem ipsum dolor sit amet."] },
        {...gratitudeEntry, content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit"] },
        {...gratitudeEntry, datetime: new Date("2020-10-25"), content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."] },
        {...gratitudeEntry, datetime: new Date("2015-05-15"), content: ["sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."] }
    ];  
    await entryModel.insertMany(testData);
};

export const seedMoodEntryTestData = async () => {
    const defaultMoodEntry:Entry = {
        id: new mongoose.Types.ObjectId(),
        sharedID: new mongoose.Types.ObjectId(),
        type: EntryTypes.MOOD,
        subject: "test data",
        quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        tags: ["test"],
        content: "exhausted",
        datetime: new Date(new Date(moment().startOf("day").toISOString()))
    };
    let testData: Entry[] = [
        {...defaultMoodEntry, content: "happy"},
        {...defaultMoodEntry, content: "exhausted"},
        {...defaultMoodEntry, datetime: new Date("2020-10-25"), content: "depressed"},
        {...defaultMoodEntry, datetime: new Date("2015-05-15"), content: "depressed"}
    ];  
    await entryModel.insertMany(testData);
};