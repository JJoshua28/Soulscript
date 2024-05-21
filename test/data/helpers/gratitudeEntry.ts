import { Entry, EntryTypes, NewCustomEntry, NewEntry } from "../../../src/types/entries";
import EntryDocument  from "../../../src/services/mongoDB/types/document";

import entryModel from "../../../src/services/mongoDB/models/entry";
import moment from "moment";


const createNewGratitudeEntry = (defaultEntry: NewEntry | Entry, entry?:NewCustomEntry): NewEntry=> {
    const {
        type, 
        subject, 
        sharedID, 
        quote, 
        tags, 
        datetime, 
        content 
    } = defaultEntry;

    return {
        type,
        subject,
        quote,
        sharedID, 
        tags,
        datetime,
        content,
        ...entry
    }
}

const createGratitudeEntry = (defaultEntry: Entry, entry?:NewCustomEntry): Entry=> {
    const {
        id,
        type, 
        subject, 
        quote,
        sharedID, 
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

const createGratitudeEntryDocument = (defaultEntry: Entry ,entry?:NewCustomEntry) => {
    const {
        id,
        type, 
        subject, 
        quote, 
        tags, 
        datetime, 
        content 
    } = defaultEntry;

    return {
        _id: id,
        type,
        subject,
        quote,
        tags,
        datetime,
        content,
        ...entry
    } as EntryDocument
}

const seedTestData = async () => {
    const gratitudeEntry:NewEntry = {
        type: EntryTypes.GRATITUDE,
        sharedID: null,
        subject: "test data",
        quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        tags: ["test"],
        content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."],
        datetime: new Date(moment().startOf("day").toISOString())
    };
    let testData: NewEntry[] = [
        {...gratitudeEntry, content: ["Lorem ipsum dolor sit amet."]},
        {...gratitudeEntry, content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit"]},
        {...gratitudeEntry, datetime: new Date("2020-10-25"), content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."]},
        {...gratitudeEntry, datetime: new Date("2015-05-15"), content: ["sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."]}
    ];  
    await entryModel.insertMany(testData);
}


export { createNewGratitudeEntry, createGratitudeEntry, createGratitudeEntryDocument, seedTestData}