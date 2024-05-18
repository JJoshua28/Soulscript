import { Request } from "express";
import MongoDBService from "../adapters/mongoDBService";
import { validDate } from "../helpers/validateDate";
import { EntryTypes, MoodEntry } from "../types/entries";
import GetMoodEntryByDateUseCase from "../use cases/getMoodEntryByDate";
import CustomMoodErrors from "../types/error";
import { moodEntryModel } from "../services/mongoDB/models/entry";

const handleGetMoodEntryByDate = async (req: Request): Promise<MoodEntry[] | []> => {
    const entryService = new MongoDBService(moodEntryModel, EntryTypes.MOOD);
    const getMoodEntryUseCase = new GetMoodEntryByDateUseCase(entryService);
    
    if (!req?.body?.datetime) throw new Error(CustomMoodErrors.INVALID_REQUEST)
    const {datetime} = (req.body as { datetime
: string })
    
    if (!validDate(datetime)) throw new Error(CustomMoodErrors.INVALID_DATE);

    return await getMoodEntryUseCase.execute(new Date(datetime));
}

export default handleGetMoodEntryByDate;
