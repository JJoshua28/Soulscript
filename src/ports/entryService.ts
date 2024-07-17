import { Entry, NewCustomEntry, NewEntry } from "../types/entries";

export interface EntryService {
    addEntry(entry: NewEntry): Promise<Entry>;
    getEntryByDate(date: Date): Promise<Entry[] | []>
    updateEntry(id: string, update: NewCustomEntry): Promise<Entry>
    deleteEntry(id: string): Promise<Entry>
}