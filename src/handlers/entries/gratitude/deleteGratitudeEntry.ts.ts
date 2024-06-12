import { Request } from "express";

import { Entry, EntryTypes } from "../../../types/entries";
import CustomMoodErrors from "../../../types/error";

import DeleteEntryUseCase from "../../../use cases/deleteEntry";
import MongoDBService from "../../../adapters/mongoDBService";
import entryModel from "../../../services/mongoDB/models/entry";


const handleDeleteGratitudeEntry = async (req: Request): Promise<Entry> => {
    const entryService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
    const deleteGratitudeUseCase = new DeleteEntryUseCase(entryService);
    
    if(!req.body.id) throw  new Error(CustomMoodErrors.INVALID_REQUEST)
    const {id} = (req.body as {
        id: string, 
    }) 
    return await deleteGratitudeUseCase.execute(id);
}

export default handleDeleteGratitudeEntry;