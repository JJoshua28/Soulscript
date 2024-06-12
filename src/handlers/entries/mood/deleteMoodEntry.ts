import { Request } from "express";

import { Entry, EntryTypes } from "../../../types/entries";
import CustomMoodErrors from "../../../types/error";

import DeleteEntryUseCase from "../../../use cases/deleteEntry";
import MongoDBService from "../../../adapters/mongoDBService";
import entryModel from "../../../services/mongoDB/models/entry";


const handleDeleteMoodEntry = async (req: Request): Promise<Entry> => {
    const entryService = new MongoDBService(entryModel, EntryTypes.MOOD);
    const deleteMoodUseCase = new DeleteEntryUseCase(entryService);
    
    if(!req.body.id) throw  new Error(CustomMoodErrors.INVALID_REQUEST)
    const {id} = (req.body as {
        id: string, 
    })  
    return await deleteMoodUseCase.execute(id);
}

export default handleDeleteMoodEntry;