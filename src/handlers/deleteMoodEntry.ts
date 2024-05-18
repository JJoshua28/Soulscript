import { Request } from "express";
import mongoose from "mongoose";

import { MoodEntry } from "../types/entries";
import CustomMoodErrors from "../types/error";

import DeleteMoodEntryUseCase from "../use cases/deleteMoodEntry";
import MongoDBService from "../adapters/mongoDBService";
import { moodEntryModel } from "../services/mongoDB/models/entry";


const handleDeleteMoodEntry = async (req: Request): Promise<MoodEntry | null> => {
    const entryService = new MongoDBService(moodEntryModel);
    const deleteMoodUseCase = new DeleteMoodEntryUseCase(entryService);
    
    let {id} 
        : {
            id: mongoose.Types.ObjectId,
        } = (req.body as {
        id: mongoose.Types.ObjectId, 
    }) 
    if(!id) throw  new Error(CustomMoodErrors.INVALID_REQUEST)
    return await deleteMoodUseCase.execute(id);
}

export default handleDeleteMoodEntry;