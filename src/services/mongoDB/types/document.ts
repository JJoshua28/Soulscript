import { Document } from "mongoose";
import { MoodEntry } from "../../../types/entries";

export interface MoodEntryDocument extends MoodEntry, Document {}