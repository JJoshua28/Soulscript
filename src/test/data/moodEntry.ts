import { CustomMoodEntry, MoodEntry } from "../../types/entries";

const defaultMoodEntry:MoodEntry = {
    type: ["mood"],
    subject: "test data",
    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    tags: ["test"],
    mood: "exhausted",
    datetime: new Date()
};

const createMoodEntry = (entry?:CustomMoodEntry)=> {
    return {
        ...defaultMoodEntry,
        ...entry
    }
}

export {defaultMoodEntry, createMoodEntry};