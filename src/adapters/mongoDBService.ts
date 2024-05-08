import { EntryService } from "../ports/entryService";
import { MoodEntry } from "../types/entries";
import { moodEntryModel } from "../services/mongoDB/models/entry";

class MongoDBService implements EntryService {
    constructor() {}
    async addMoodEntry(entry: MoodEntry): Promise<MoodEntry> {
        try {
            return await moodEntryModel.create({...entry})
        } catch (error) {
            throw Error(`Something went wrong trying to create this Entry.\n Entry: ${JSON.stringify(entry)}\nError: ${error}`)
        }
    }
    async getMoodEntryByDate(date: Date): Promise<MoodEntry[] | []> {
        try {
            const earliestDate = new Date(date);
            earliestDate.setUTCHours(0, 0, 0, 0);

            const latestDate = new Date(date);
            latestDate.setUTCHours(23, 59, 59, 999);


            const dateQuery = { 
                datetime: {$gte: earliestDate, $lte:latestDate},
                type: ["mood"]
            }
            return await moodEntryModel.find(dateQuery);
        } catch (error) {
            throw Error(`Something went wrong trying to retrieve and a mood entry.\n Date query: ${date}\nError: ${error}`)
        }
        
    }

}

export default MongoDBService;