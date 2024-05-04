import { MoodEntry } from "../../types/entries";

const defaultMoodEntry = {
    type: ["mood"],
     subject: "bored with life",
     quote: "I seem depressed, always being bothered neverless.",
     tags: ["mental health"],
     mood: "exhausted"
} as MoodEntry

const datetimeMoodEntry: MoodEntry = {...defaultMoodEntry,
    datetime: new Date("2020")
 }

export {defaultMoodEntry, datetimeMoodEntry};