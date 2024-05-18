import mongoose, { Model } from "mongoose";

import { CustomMoodEntry, EntryTypes, MoodEntry, NewMoodEntry } from "../types/entries";
import { MoodEntryDocument } from "../services/mongoDB/types/document";
import CustomMoodErrors from "../types/error";
import { EntryService } from "../ports/entryService";

import { mapDocumentToMoodEntry, mapDocumentsToMoodEntry } from "../mappers/mongoDB/documents";
import { getByDateQuery } from "../services/mongoDB/queries/moodEntry";

class MongoDBService implements EntryService {
    private model: Model<MoodEntryDocument>;
    private entryType: EntryTypes;
    constructor(model: Model<MoodEntryDocument>, entryType: EntryTypes) {
        this.model = model;
        this.entryType = entryType
    }
    async addMoodEntry(entry: NewMoodEntry): Promise<MoodEntry> {
        try {
            const response = await this.model.create({...entry})
            const mappedMoodEntry = mapDocumentToMoodEntry(response);
            return mappedMoodEntry;
        } catch (error) {
            throw Error(`Something went wrong trying to create this Entry.\n Entry: ${JSON.stringify(entry)}\nError: ${error}`)
        }
    }
    async getMoodEntryByDate(date: Date): Promise<MoodEntry[] | []> {
        try {
           const dateQuery = getByDateQuery(date, this.entryType);
            const response = await this.model.find(dateQuery);
            return mapDocumentsToMoodEntry(response);
        } catch (error) {
            throw Error(`Something went wrong trying to retrieve and a mood entry.\n Date query: ${date}\nError: ${error}`)
        }
        
    }
    async updateMoodEntry(id: mongoose.Types.ObjectId, update: CustomMoodEntry): Promise<MoodEntry> {
        try {
            const options = {
                new: true,
                runValidators: true,
                returnDocument: "after" as "after"
            }
            const response = await this.model.findByIdAndUpdate(id, update, options);
            if(!response && !await this.model.findById(id)) throw new Error(CustomMoodErrors.INVALID_ENTRY_ID);
            if(!response) throw new Error();
            const mappedMoodEntry = mapDocumentToMoodEntry((response));
            return mappedMoodEntry;
        } catch (error: any) {
            if(error.message === CustomMoodErrors.INVALID_ENTRY_ID) throw new Error(error.message)
            throw Error(`Something went wrong trying to update this Entry.\n Entry ID: ${id}\nError: ${error}`)
        }
    }
    async deleteMoodEntry(id: mongoose.Types.ObjectId): Promise<null | MoodEntry>  {
        try {
            const response = await this.model.findByIdAndDelete(id);

            if(!response && !await this.model.findById(id)) throw new Error(CustomMoodErrors.INVALID_ENTRY_ID);
            if (!response) throw new Error();

            return response && mapDocumentToMoodEntry(response);
        } catch (error: any){
            if(error.message === CustomMoodErrors.INVALID_ENTRY_ID) throw new Error(error.message)
            throw new Error(`Something went wrong trying to remove a document with ID: ${id}`)
        }
        
    }
}

export default MongoDBService;