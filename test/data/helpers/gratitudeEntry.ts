import { Entry, EntryTypes, NewCustomEntry, NewEntry } from "../../../src/types/entries";
import EntryDocument  from "../../../src/services/mongoDB/types/document";

import entryModel from "../../../src/services/mongoDB/models/entry";


const createNewGratitudeEntry = (defaultEntry: NewEntry ,entry?:NewCustomEntry): NewEntry=> {
    const {
        type, 
        subject, 
        quote, 
        tags, 
        datetime, 
        content 
    } = defaultEntry;

    return {
        type,
        subject,
        quote,
        tags,
        datetime,
        content,
        ...entry
    }
}

const createGratitudeEntry = (defaultEntry: Entry ,entry?:NewCustomEntry): Entry=> {
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
        id,
        type,
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
        subject: "test data",
        quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        tags: ["test"],
        content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."],
        datetime: Date()()
    };
    let testData: NewEntry[] = [
        {...gratitudeEntry, datetime: Date()(), content: ["Lorem ipsum dolor sit amet."]},
        {...gratitudeEntry, datetime: Date()(), content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit"]},
        {...gratitudeEntry, datetime: Date()("2020-10-25"), content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."]},
        {...gratitudeEntry, datetime: Date()("2015-05-15"), content: ["sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."]}
    ];  
    await entryModel.insertMany(testData);
}


export { createNewGratitudeEntry, createGratitudeEntry, createGratitudeEntryDocument, seedTestData}