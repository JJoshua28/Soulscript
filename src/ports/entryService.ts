import { CustomMoodEntry, MoodEntry, NewMoodEntry } from "../types/entries";

export interface EntryService {
    addMoodEntry(entry: NewMoodEntry): Promise<MoodEntry>;
    getMoodEntryByDate(date: Date): Promise<MoodEntry[] | []>
    updateMoodEntry(id: any, update: CustomMoodEntry): Promise<MoodEntry>
    deleteMoodEntry(id: any): Promise<MoodEntry| null>}