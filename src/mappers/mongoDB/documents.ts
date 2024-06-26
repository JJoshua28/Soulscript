import {  EntryDocument, TagDocument }  from "../../services/mongoDB/types/document";
import { Entry } from "../../types/entries";
import { Tag } from "../../types/tags";

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
    const mappedEntries = document.map(document => {
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
    return mappedEntries;
}

export const mapDocumentToTag = (document: TagDocument):Tag => {
    const id = document._id.toString();
    const { name, description, createdAt } = document;
    const mappedTag: Tag = {
        id,
        name,
        description: description || "",
        createdAt
    };
    return mappedTag;
}

export const mapDocumentsToTags = (document: TagDocument[]):Tag[] => {
    const mappedEntries = document.map(document => {
        const id = document._id.toString();
        const { name, description, createdAt } = document;
        const mappedTag: Tag = {
            id,
            name,
            description: description || "",
            createdAt
        };
        return mappedTag;
    })
    return mappedEntries;
}