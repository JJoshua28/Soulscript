import { EntryTypes, NewEntry, NewEntryRequest } from "../types/entries"

const mapNewEntry = (entry: NewEntryRequest, {type, datetime}: {type: EntryTypes, datetime: Date}): NewEntry => {
    const {
        sharedID, 
        subject, 
        quote, 
        tags, 
        content 
    } = entry
    const mappedEntry: NewEntry = {
        sharedID: sharedID || null,
        type,
        subject: subject || null,
        quote: quote || null,
        tags: tags || [],
        content,
        datetime
    };
    return mappedEntry;
}

export default mapNewEntry;