import { Request } from "express";

import { Entry, EntryTypes } from "../../types/entries";
import CustomMoodErrors from "../../types/error";

import MongoDBService from "../../adapters/mongoDBService";
import { validDate } from "../../helpers/validateDate";
import GetEntryByDateUseCase from "../../use cases/getEntryByDate";
import entryModel from "../../services/mongoDB/models/entry";

const handleGetEntryByDate = async (req: Request, type: EntryTypes): Promise<Entry[] | []> => {
    const entryService = new MongoDBService(entryModel, type);
    const getMoodEntryUseCase = new GetEntryByDateUseCase(entryService);
    
    if (!req?.body?.datetime) throw new Error(CustomMoodErrors.INVALID_REQUEST)
    const {datetime} = (req.body as { datetime
: string })
    
    
    if (!validDate(datetime)) throw new Error(CustomMoodErrors.INVALID_DATE);

    return await getMoodEntryUseCase.execute(new Date(datetime));
}

export default handleGetEntryByDate;