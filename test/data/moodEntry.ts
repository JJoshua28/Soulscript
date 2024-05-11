import { MoodEntryDocument } from "../../src/services/mongoDB/types/document";
import { CustomMoodEntry, MoodEntry } from "../../src/types/entries";

const defaultMoodEntry:MoodEntry = {
    type: ["mood"],
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["test"],
    mood: "exhausted",
    datetime: new Date()
};

const mockMoodEntryDocument = {
    _id: "some string",
    type: ["mood"],
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["test"],
    mood: "exhausted",
    datetime: new Date()
} as MoodEntryDocument;

const createMoodEntry = (entry?:CustomMoodEntry)=> {
    return {
        ...defaultMoodEntry,
        ...entry
    }
}

export {defaultMoodEntry, createMoodEntry, mockMoodEntryDocument};