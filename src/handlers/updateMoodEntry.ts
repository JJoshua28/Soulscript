import { Request } from "express";
import mongoose from "mongoose"
;
import { CustomMoodEntry, MoodEntry, NewCustomMoodEntry } from "../types/entries";

import MongoDBService from "../adapters/mongoDBService";
import { validDate } from "../helpers/validateDate";
import UpdateMoodEntryUseCase from "../use cases/updateMoodEntry";
import CustomMoodErrors from "../types/error";

const handleUpdateMoodEntry = async (req: Request): Promise<MoodEntry> => {
    const entryService = new MongoDBService();
    const updateMoodUseCase = new UpdateMoodEntryUseCase(entryService);
    
    if(!req?.body?.update || Object.keys(req?.body?.update).length === 0|| !req?.body?.id) throw new Error(CustomMoodErrors.INVALID_REQUEST);
    if (req?.body?.update?.datetime && !validDate(req?.body?.update?.datetime)) throw new Error(CustomMoodErrors.INVALID_DATE);
    let {id, 
        update}: {
            id: mongoose.Types.ObjectId,
            update: NewCustomMoodEntry
        } = (req.body as {
        id: mongoose.Types.ObjectId, 
        update: NewCustomMoodEntry
    }) 
    if(update?.datetime) update = {
        ...update,
        datetime: new Date(update?.datetime)
    } as CustomMoodEntry;
    const entryUpdate:CustomMoodEntry = {...update  as CustomMoodEntry} 
    return await updateMoodUseCase.execute(id, entryUpdate);
}

export default handleUpdateMoodEntry;