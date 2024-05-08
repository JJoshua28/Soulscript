import { MoodEntry } from "../types/entries";

export interface EntryService {
    addMoodEntry(entry: MoodEntry): Promise<MoodEntry>;
    getMoodEntryByDate(date: Date): Promise<MoodEntry[] | []>
}