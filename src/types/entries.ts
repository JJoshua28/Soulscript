import mongoose from "mongoose";

export enum EntryTypes {
  MOOD = "mood",
  JOURNAL = "journal",
  GRATITUDE = "gratitude",
 };

export interface NewEntry {
    type: EntryTypes;
    sharedID?: mongoose.Types.ObjectId;
    subject: string | undefined;
    quote: string | undefined;
    tags: string[];
    datetime: Date | string ;
    content: string | string[];
}

export interface Entry extends NewEntry {
  id: mongoose.Types.ObjectId,
  datetime: Date
}

export interface NewCustomEntry {
  sharedID?: mongoose.Types.ObjectId | undefined,
  subject?: string,
  quote?: string,
  tags?: string[],
  datetime?: Date
  content?: string | string[],
}

export interface CustomEntry extends Omit<NewCustomEntry, "datetime"> {
  datetime?: Date,
}
