import { Request } from "express";
import MongoDBService from "../adapters/mongoDBService";
import { validDate } from "../helpers/validateDate";
import { MoodEntry } from "../types/entries";
import GetMoodEntryByDateUseCase from "../use cases/getMoodEntryByDateUseCase";

const handleGetMoodEntryByDate = async (req: Request): Promise<MoodEntry[] | []> => {
    const entryService = new MongoDBService();
    const getMoodEntryUseCase = new GetMoodEntryByDateUseCase(entryService);
    
    const {datetime} = (req.body as { datetime?: string })
    
    if (!datetime || !validDate(datetime)) throw new Error("Invalid date");

    return await getMoodEntryUseCase.execute(new Date(datetime));
}

export default handleGetMoodEntryByDate;
