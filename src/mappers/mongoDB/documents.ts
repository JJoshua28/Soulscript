import { MoodEntryDocument } from "../../services/mongoDB/types/document";
import { MoodEntry } from "../../types/entries";

export const mapDocumentToMoodEntry = (document: MoodEntryDocument):MoodEntry => {
    const {
        _id:id, 
        type, 
        subject, 
        quote, 
        tags, 
        datetime, 
        mood 
    } = document
    const mappedMoodEntry: MoodEntry = {
        id,
        type,
        subject,
        quote,
        tags,
        datetime,
        mood
    };
    return mappedMoodEntry;
} 

export const mapDocumentsToMoodEntry = (document: MoodEntryDocument[]):MoodEntry[] => {
    const mappedMoodEntries = document.map(document => {
        const {
            _id:id, 
            type, 
            subject, 
            quote, 
            tags, 
            datetime, 
            mood 
        } = document
        const mappedMoodEntry: MoodEntry = {
            id,
            type,
            subject,
            quote,
            tags,
            datetime,
            mood
        };
        return mappedMoodEntry;
    })
    return mappedMoodEntries;
}