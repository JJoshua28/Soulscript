export type Moods = "happy" | "sad" | "excited" | "bored" | "tired" 
| "exhausted" | "unsure" | "anxious" | "relaxed" | "stressed" 
| "angry" | "sick";

export type EntryTypes = typeof process.env.MOOD_ENTRY_TYPE | typeof process.env.JOURNAL_ENTRY_TYPE | typeof process.env.MOOD_ENTRY_TYPE | "multiple-entry";

export interface Entry {
    type: EntryTypes[];
    subject: string | undefined;
    quote: string | undefined;
    tags: string[];
    datetime: Date;
}

export interface CustomMoodEntry {
  type?: string[],
  subject?: string,
  quote?: string,
  tags?: string[],
  mood?: string,
  datetime?: Date
}

export interface MoodEntry extends Entry {
  mood: Moods;
}

export interface JournalEntry extends Entry {
  journal: string;
}

export interface GratitudeEntry extends Entry {
  gratitude: string[];
}

export interface MultipleEntry extends Entry {
  mood?: Moods;
  journal?: string;
  gratitude?: string[];
}