import { Model } from "mongoose";

import { CustomEntry, Entry, EntryTypes, NewEntry } from "../types/entries";
import CustomMoodErrors from "../types/error";
import { EntryService } from "../ports/entryService";
import EntryDocument from "../services/mongoDB/types/document";

import { mapDocumentToEntry, mapDocumentsToEntry } from "../mappers/mongoDB/documents";
import { getByDateQuery } from "../services/mongoDB/queries/moodEntry";

class MongoDBService implements EntryService {
    private model: Model<EntryDocument>;
    private entryType: EntryTypes;
    constructor(model: Model<EntryDocument>, entryType: EntryTypes) {
        this.model = model;
        this.entryType = entryType
    }
    async addEntry(entry: NewEntry): Promise<Entry> {
        try {
            const response = await this.model.create({...entry})
            const mappedMoodEntry = mapDocumentToEntry(response);
            return mappedMoodEntry;
        } catch (error) {
            throw Error(`Something went wrong trying to create this Entry.\n Entry: ${JSON.stringify(entry)}\nError: ${error}`)
        }
    }
    async getEntryByDate(date: Date): Promise<Entry[] | []> {
        try {
           const dateQuery = getByDateQuery(date, this.entryType);
            const response = await this.model.find(dateQuery);
            return mapDocumentsToEntry(response);
        } catch (error) {
            throw Error(`Something went wrong trying to retrieve and a mood entry.\n Date query: ${date}\nError: ${error}`)
        }
        
    }
    async updateEntry(id: string, update: CustomEntry): Promise<Entry> {
        try {
            const options = {
                new: true,
                runValidators: true,
                returnDocument: "after" as const
            }
            const response = await this.model.findByIdAndUpdate(id, update, options);
            if(!response && !await this.model.findById(id)) throw new Error(CustomMoodErrors.INVALID_ENTRY_ID);
            if(!response) throw new Error();
            const mappedMoodEntry = mapDocumentToEntry((response));
            return mappedMoodEntry;
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === CustomMoodErrors.INVALID_ENTRY_ID) throw new Error(error.message);
                throw new Error(`Something went wrong trying to update this Entry.\n Entry ID: ${id}\nError: ${error.message}`);
            } else {
                throw new Error(`An unknown error occurred.\n Entry ID: ${id}`);
            }
        }
    }
    async deleteEntry(id: string): Promise<Entry>  {
        try {
            const response = await this.model.findByIdAndDelete(id);

            if(!response && !await this.model.findById(id)) throw new Error(CustomMoodErrors.INVALID_ENTRY_ID);
            if (!response) throw new Error();

            return response && mapDocumentToEntry(response);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === CustomMoodErrors.INVALID_ENTRY_ID) throw new Error(error.message);
                throw new Error(`Something went wrong trying to remove a document with ID: ${id}`);
            } else {
                throw new Error(`An unknown error occurred.\n Entry ID: ${id}`);
            } 
        }
        
    }
}

export default MongoDBService;