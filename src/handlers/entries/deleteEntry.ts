import { Request } from "express";

import { Entry, EntryTypes } from "../../types/entries";
import CustomMoodErrors from "../../types/error";

import DeleteEntryUseCase from "../../use cases/deleteEntry";
import MongoDBService from "../../adapters/mongoDBService";
import entryModel from "../../services/mongoDB/models/entry";


const handleDeleteEntry = async (req: Request, type: EntryTypes): Promise<Entry> => {
    const entryService = new MongoDBService(entryModel, type);
    const deleteEntryUseCase = new DeleteEntryUseCase(entryService);
    
    if(!req.body.id) throw  new Error(CustomMoodErrors.INVALID_REQUEST)
    const {id} = (req.body as {
        id: string, 
    })  
    return await deleteEntryUseCase.execute(id);
}

export default handleDeleteEntry;