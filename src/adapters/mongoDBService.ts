import mongoose from "mongoose";

import { CustomMoodEntry, MoodEntry, NewMoodEntry } from "../types/entries";
import { EntryService } from "../ports/entryService";

import { moodEntryModel } from "../services/mongoDB/models/entry";
import { mapDocumentToMoodEntry, mapDocumentsToMoodEntry } from "../mappers/mongoDB/documents";
import { getByDateQuery } from "../services/mongoDB/queries/moodEntry";

class MongoDBService implements EntryService {
    constructor() {}
    async addMoodEntry(entry: NewMoodEntry): Promise<MoodEntry> {
        try {
            const response = await moodEntryModel.create({...entry})
            const mappedMoodEntry = mapDocumentToMoodEntry(response);
            return mappedMoodEntry;
        } catch (error) {
            throw Error(`Something went wrong trying to create this Entry.\n Entry: ${JSON.stringify(entry)}\nError: ${error}`)
        }
    }
    async getMoodEntryByDate(date: Date): Promise<MoodEntry[] | []> {
        try {
           const dateQuery = getByDateQuery(date);
            const response = await moodEntryModel.find(dateQuery);
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
            const response = await moodEntryModel.findByIdAndUpdate(id, update, options);
            if(!response) throw new Error(`No entry exists with ID: ${id}`);
            const mappedMoodEntry = mapDocumentToMoodEntry((response));
            return mappedMoodEntry;
        } catch (error) {
            throw Error(`Something went wrong trying to update this Entry.\n Entry ID: ${id}\nError: ${error}`)
        }
    }
    async deleteMoodEntry(id: mongoose.Types.ObjectId): Promise<null | MoodEntry>  {
        try {
            const response = await moodEntryModel.findByIdAndDelete(id);

            return response && mapDocumentToMoodEntry(response);
        } catch (error){
            throw new Error(`Something went wrong trying to remove a document with ID: ${id}`)
        }
        
    }
}

export default MongoDBService;