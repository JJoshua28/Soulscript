import { Request } from "express";
import mongoose from "mongoose"
;
import { CustomEntry, Entry, EntryTypes, NewCustomEntry } from "../types/entries";
import CustomMoodErrors from "../types/error";

import MongoDBService from "../adapters/mongoDBService";
import { validDate } from "../helpers/validateDate";
import UpdateEntryUseCase from "../use cases/updateEntry";
import entryModel from "../services/mongoDB/models/entry";

const handleUpdateGratitudeEntry = async (req: Request): Promise<Entry> => {
    const entryService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
    const updateGratitudeUseCase = new UpdateEntryUseCase(entryService);
    
    if(!req?.body?.update || Object.keys(req?.body?.update).length === 0|| !req?.body?.id) throw new Error(CustomMoodErrors.INVALID_REQUEST);
    if(req?.body?.update?.content && !Array.isArray(req?.body?.update?.content) || req?.body?.update?.content?.length < 1) throw new Error(CustomMoodErrors.INVALID_REQUEST);
    if (req?.body?.update?.datetime && !validDate(req?.body?.update?.datetime)) throw new Error(CustomMoodErrors.INVALID_DATE);
    let {id, 
        update}: {
            id: mongoose.Types.ObjectId,
            update: NewCustomEntry
        } = (req.body as {
        id: mongoose.Types.ObjectId, 
        update: NewCustomEntry
    }) 
    if(update?.datetime) update = {
        ...update,
        datetime: new Date(update?.datetime)
    } as CustomEntry;
    const entryUpdate:CustomEntry = {...update  as CustomEntry} 
    return await updateGratitudeUseCase.execute(id, entryUpdate);
}

export default handleUpdateGratitudeEntry;