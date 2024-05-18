import mongoose from "mongoose";

export const Moods = {
  happy: "happy",
  sad: "sad",
  excited: "excited",
  bored: "bored",
  tired: "tired",
  exhausted: "exhausted",
  unsure: "unsure",
  anxious: "anxious",
  relaxed: "relaxed",
  stressed: "stressed",
  angry: "angry",
  sick: "sick",
  depressed: "depressed"
} as const;

export enum EntryTypes {
  MOOD = "mood",
  JOURNAL = "journal",
  GRATITUDE = "gratitude",
  MULTIPLE_ENTRY = "multiple-entry"
 };

enum EntryType {
  MOOD = "mood",
  JOURNAL = "journal",
  GRATITUDE = "gratitude",
  MULTIPLE_ENTRY = "multiple-entry"
 }

export interface NewEntry {
    type: EntryTypes[];
    subject: string | undefined;
    quote: string | undefined;
    tags: string[];
    datetime: Date;
}

export interface Entry extends NewEntry {
  id: mongoose.Types.ObjectId;
}

export interface NewCustomMoodEntry {
  type?: EntryTypes[],
  subject?: string,
  quote?: string,
  tags?: string[],
  mood?: keyof typeof Moods,
  datetime?: string | Date
}
export interface CustomMoodEntry extends Omit<NewCustomMoodEntry, "datetime"> {
  datetime?: Date
}

export interface NewMoodEntry extends NewEntry {
  mood: keyof typeof Moods;
}
export interface MoodEntry extends Entry, NewMoodEntry {}

export interface JournalEntry extends NewEntry {
  journal: string;
}

export interface GratitudeEntry extends NewEntry {
  gratitude: string[];
}

export interface MultipleEntry extends NewEntry {
  mood?: keyof typeof Moods;
  journal?: string;
  gratitude?: string[];
}