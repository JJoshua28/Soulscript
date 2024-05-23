import { Request } from "express";
import mongoose from "mongoose";

import { Entry, EntryTypes } from "../types/entries";
import CustomMoodErrors from "../types/error";

import DeleteEntryUseCase from "../use cases/deleteEntry";
import MongoDBService from "../adapters/mongoDBService";
import entryModel from "../services/mongoDB/models/entry";


const handleDeleteGratitudeEntry = async (req: Request): Promise<Entry> => {
    const entryService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
    const deleteGratitudeUseCase = new DeleteEntryUseCase(entryService);
    
    if(!req.body.id) throw  new Error(CustomMoodErrors.INVALID_REQUEST)
    let {id} 
        : {
            id: mongoose.Types.ObjectId,
        } = (req.body as {
        id: mongoose.Types.ObjectId, 
    }) 
    return await deleteGratitudeUseCase.execute(id);
}

export default handleDeleteGratitudeEntry;