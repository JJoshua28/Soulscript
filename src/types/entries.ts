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
} as const
export type EntryTypes = "mood" | "journal" | "gratitude" | "multiple-entry";

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


export interface CustomMoodEntry {
  type?: EntryTypes[],
  subject?: string,
  quote?: string,
  tags?: string[],
  mood?: keyof typeof Moods,
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