import { EntryService } from "../port/entryService";
import { MoodEntry } from "../types/entries";
import { moodEntryModel } from "../mongoDB/models/entry";

class MongoDBService implements EntryService {
    constructor() {}
    async addMoodEntry(entry: MoodEntry): Promise<MoodEntry> {
        try {
            return await moodEntryModel.create({...entry})
        } catch (error) {
            throw Error(`Something went wrong trying to create this Entry.\n Entry: ${JSON.stringify(entry)}\nError: ${error}`)
        }
        
    }
}

export default MongoDBService;