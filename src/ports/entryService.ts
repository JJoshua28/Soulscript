import { MoodEntry, NewMoodEntry } from "../types/entries";

export interface EntryService {
    addMoodEntry(entry: NewMoodEntry): Promise<MoodEntry>;
    getMoodEntryByDate(date: Date): Promise<MoodEntry[] | []>
}