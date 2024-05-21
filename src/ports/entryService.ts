import { CustomEntry, Entry, NewEntry } from "../types/entries";

export interface EntryService {
    addEntry(entry: NewEntry): Promise<Entry>;
    getEntryByDate(date: Date): Promise<Entry[] | []>
    updateEntry(id: any, update: CustomEntry): Promise<Entry>
    deleteEntry(id: any): Promise<Entry>}