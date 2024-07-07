import { NewEntry } from "../types/entries"

const mapNewEntry = (entry: NewEntry): NewEntry => {
    const {
        sharedID, 
        subject, 
        quote, 
        tags, 
        content,
        datetime,
        type
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