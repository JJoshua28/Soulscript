import mongoose from "mongoose";

export enum EntryTypes {
  MOOD = "mood",
  JOURNAL = "journal",
  GRATITUDE = "gratitude",
 };

export interface NewEntryRequest {
  content: string | string[];
  sharedID?: mongoose.Types.ObjectId;
  subject?: string;
  quote?: string;
  tags?: string[];
  datetime?: string;
}

export interface NewEntry {
    type: EntryTypes;
    sharedID: mongoose.Types.ObjectId | null;
    subject: string | null;
    quote: string | null;
    tags: string[];
    datetime: Date ;
    content: string | string[];
}

export interface Entry extends NewEntry {
  id: mongoose.Types.ObjectId,
}

export interface NewCustomEntry {
  sharedID?: mongoose.Types.ObjectId | null,
  subject?: string | null,
  quote?: string | null,
  tags?: string[],
  datetime?: Date
  content?: string | string[],
}

export interface CustomEntry extends Omit<NewCustomEntry, "datetime"> {
  datetime?: Date,
}
