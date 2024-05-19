import { Request } from "express";
import mongoose from "mongoose";

import { Entry, EntryTypes } from "../types/entries";
import CustomMoodErrors from "../types/error";

import DeleteMoodEntryUseCase from "../use cases/deleteMoodEntry";
import MongoDBService from "../adapters/mongoDBService";
import entryModel from "../services/mongoDB/models/entry";


const handleDeleteMoodEntry = async (req: Request): Promise<Entry> => {
    const entryService = new MongoDBService(entryModel, EntryTypes.MOOD);
    const deleteMoodUseCase = new DeleteMoodEntryUseCase(entryService);
    
    if(!req.body.id) throw  new Error(CustomMoodErrors.INVALID_REQUEST)
    let {id} 
        : {
            id: mongoose.Types.ObjectId,
        } = (req.body as {
        id: mongoose.Types.ObjectId, 
    }) 
    return await deleteMoodUseCase.execute(id);
}

export default handleDeleteMoodEntry;