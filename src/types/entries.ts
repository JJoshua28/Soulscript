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
  tags?: string[];
  datetime?: string;
}

export interface NewEntry {
    type: EntryTypes;
    sharedID: string | null;
    subject: string | null;
    quote: string | null;
    tags: string[];
    datetime: Date ;
    content: string | string[];
}

export interface Entry extends NewEntry {
  id: string,
}

export interface NewCustomEntry {
  sharedID?: string | null,
  subject?: string | null,
  quote?: string | null,
  tags?: string[],
  datetime?: Date,
  content?: string | string[],
}

export interface CustomEntry extends Omit<NewCustomEntry, "datetime"> {
  datetime?: Date,
}
