import type { Types } from "mongoose";

import type { Tag } from "./tags";
import { TagDocument } from "../services/mongoDB/types/document";

export enum EntryTypes {
  MOOD = "mood",
  JOURNAL = "journal",
  GRATITUDE = "gratitude",
 }

export interface NewEntryRequest {
  content: string | string[];
  sharedID?: string;
  subject?: string;
  quote?: string;
  tags?: Types.ObjectId[];
  datetime?: string;
}

export interface NewEntry {
    type: EntryTypes;
    sharedID: string | null;
    subject: string | null;
    quote: string | null;
    tags: Types.ObjectId[];
    datetime: Date ;
    content: string | string[];
}

export interface Entry extends Omit<NewEntry, "tags"> {
  id: string,
  tags: Tag[],
}

export interface NewCustomEntry {
  sharedID?: string | null,
  subject?: string | null,
  quote?: string | null,
  tags?: Types.ObjectId[],
  datetime?: Date,
  content?: string | string[],
}

export interface CustomEntryDocument extends Omit<NewCustomEntry, "tags"> {
  tags?: TagDocument[]
}
