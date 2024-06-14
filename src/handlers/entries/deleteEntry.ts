import { Request } from "express";

import { Entry, EntryTypes } from "../../types/entries";
import CustomErrors from "../../types/error";

import DeleteEntryUseCase from "../../use cases/entries/deleteEntry";
import MongoDBEntryService from "../../adapters/mongoDB/entryService";
import entryModel from "../../services/mongoDB/models/entry";


const handleDeleteEntry = async (req: Request, type: EntryTypes): Promise<Entry> => {
    const entryService = new MongoDBEntryService(entryModel, type);
    const deleteEntryUseCase = new DeleteEntryUseCase(entryService);
    
    if(!req.body.id) throw  new Error(CustomErrors.INVALID_REQUEST)
    const {id} = (req.body as {
        id: string, 
    })  
    return await deleteEntryUseCase.execute(id);
}

export default handleDeleteEntry;