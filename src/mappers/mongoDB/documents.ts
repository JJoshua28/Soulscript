import EntryDocument from "../../services/mongoDB/types/document";
import { Entry } from "../../types/entries";

export const mapDocumentToEntry = (document: EntryDocument):Entry => {
    const {
        _id:id,
        sharedID, 
        type, 
        subject, 
        quote, 
        tags, 
        datetime, 
        content 
    } = document
    const mappedEntry: Entry = {
        id,
        sharedID,
        type,
        subject,
        quote,
        tags,
        content,
        datetime
    };
    return mappedEntry;
} 

export const mapDocumentsToEntry = (document: EntryDocument[]):Entry[] => {
    const mappedMoodEntries = document.map(document => {
        const {
            _id:id, 
            type,
            sharedID, 
            subject, 
            quote, 
            tags, 
            content, 
            datetime 
        } = document
        const mappedMoodEntry: Entry = {
            id,
            sharedID,
            type,
            subject,
            quote,
            tags,
            content,
            datetime
        };
        return mappedMoodEntry;
    })
    return mappedMoodEntries;
}