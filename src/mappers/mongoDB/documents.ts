import type { EntryDocument, TagDocument }  from "../../services/mongoDB/types/document";
import type { Entry } from "../../types/entries";
import type { Tag } from "../../types/tags";


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

export const mapDocumentsToTags = (documents: TagDocument[]):Tag[] => {
    const mappedEntries = documents.map(document => {
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

export const mapDocumentToEntry = (document: EntryDocument):Entry => {
    const {
        sharedID, 
        type, 
        subject, 
        quote,
        tags, 
        datetime, 
        content 
    } = document;

    const tagDocuments = tags as TagDocument[]
    const id = document._id.toString();
    
    const mappedEntry: Entry = {
        id,
        sharedID,
        type,
        subject,
        quote,
        tags: mapDocumentsToTags(tagDocuments),
        content,
        datetime
    };
    return mappedEntry;
} 

export const mapDocumentsToEntries = (document: EntryDocument[]):Entry[] => {
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

        const tagDocuments = tags as TagDocument[]
        const id = document._id.toString();
        
        const mappedMoodEntry: Entry = {
            id,
            sharedID,
            type,
            subject,
            quote,
            tags: mapDocumentsToTags(tagDocuments),
            content,
            datetime
        };
        return mappedMoodEntry;
    })
    return mappedEntries;
}