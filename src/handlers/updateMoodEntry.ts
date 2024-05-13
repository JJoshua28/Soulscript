import { Request } from "express";
import mongoose from "mongoose"
;
import { CustomMoodEntry, MoodEntry, NewCustomMoodEntry } from "../types/entries";

import MongoDBService from "../adapters/mongoDBService";
import { validDate } from "../helpers/validateDate";
import UpdateMoodEntryUseCase from "../use cases/updateMoodEntry";

const handleUpdateMoodEntry = async (req: Request): Promise<MoodEntry> => {
    const entryService = new MongoDBService();
    const updateMoodUseCase = new UpdateMoodEntryUseCase(entryService);
    
    let {id, 
        update}: {
            id: mongoose.Types.ObjectId,
            update: NewCustomMoodEntry
        } = (req.body as {
        id: mongoose.Types.ObjectId, 
        update: NewCustomMoodEntry
    }) 
    if(!update || Object.keys(update).length === 0|| !id) throw new Error(`Request to update a mood entry record is missing an ID and or update.\nid: ${id}\nUpdate: ${update}`)
    if (update?.datetime && !validDate(update?.datetime)) throw new Error("Invalid date");
    if(update?.datetime) update = {
        ...update,
        datetime: new Date(update?.datetime)
    } as CustomMoodEntry;
    const entryUpdate:CustomMoodEntry = {...update  as CustomMoodEntry} 
    return await updateMoodUseCase.execute(id, entryUpdate);
}

export default handleUpdateMoodEntry;