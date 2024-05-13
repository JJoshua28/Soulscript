import { MoodEntry, NewMoodEntry } from "../types/entries";
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
}

export default MongoDBService;