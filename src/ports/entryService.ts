import mongoose from "mongoose";
import { CustomMoodEntry, MoodEntry, NewMoodEntry } from "../types/entries";

export interface EntryService {
    addMoodEntry(entry: NewMoodEntry): Promise<MoodEntry>;
    getMoodEntryByDate(date: Date): Promise<MoodEntry[] | []>
    updateMoodEntry(id: mongoose.Types.ObjectId, update: CustomMoodEntry): Promise<MoodEntry>
}