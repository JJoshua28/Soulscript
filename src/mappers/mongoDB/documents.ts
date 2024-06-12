import EntryDocument from "../../services/mongoDB/types/document";
import { Entry } from "../../types/entries";

export const mapDocumentToEntry = (document: EntryDocument):Entry => {
    const {
        sharedID, 
        type, 
        subject, 
        quote, 
        tags, 
        datetime, 
        content 
    } = document

    const id = document._id.toString();
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
            type,
            sharedID, 
            subject, 
            quote, 
            tags, 
            content, 
            datetime 
        } = document

        const id = document._id.toString();
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