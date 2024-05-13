import { MoodEntryDocument } from "../../../src/services/mongoDB/types/document";
import { CustomMoodEntry, NewMoodEntry, MoodEntry } from "../../../src/types/entries";
import { defaultMoodEntry } from "../moodEntry";

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

export { createNewMoodEntry, createMoodEntry, createMoodEntryDocument}