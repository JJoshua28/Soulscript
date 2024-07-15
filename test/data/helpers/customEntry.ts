import mongoose from "mongoose";
import {  EntryDocument }  from "../../../src/services/mongoDB/types/document";
import {  Entry, NewEntry, CustomEntry, NewCustomEntry, CustomEntryDocument } from "../../../src/types/entries";

const createNewEntry = (defaultEntry: NewEntry, entry?:NewCustomEntry): NewEntry=> {
    const {
        type,
        sharedID, 
        subject, 
        quote, 
        tags, 
        datetime, 
        content 
    } = defaultEntry;

    return {
        type,
        sharedID,
        subject,
        quote,
        tags,
        datetime,
        content,
        ...entry
    }
}

const createEntry = (defaultEntry: Entry, entry?:CustomEntry): Entry=> {
    const {
        id,
        type,
        sharedID, 
        subject, 
        quote, 
        tags, 
        datetime, 
        content 
    } = defaultEntry;
    return {
        id,
        type,
        sharedID,
        subject,
        quote,
        tags,
        datetime,
        content,
        ...entry
    }
}

const createEntryDocument = (defaultDocument: Entry, entry?:CustomEntryDocument) => {
    const {
        id,
        type,
        sharedID, 
        subject, 
        quote, 
        tags, 
        datetime, 
        content 
    } = defaultDocument;

    return {
        _id: mongoose.Types.ObjectId.createFromHexString(id),
        type,
        sharedID,
        subject,
        quote,
        tags,
        datetime,
        content,
        ...entry
    } as EntryDocument
}


export { createNewEntry, createEntry, 
    createEntryDocument }