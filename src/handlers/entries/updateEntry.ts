import { Request } from "express";

import { CustomEntry, Entry, EntryTypes, NewCustomEntry } from "../../types/entries";
import CustomErrors from "../../types/error";

import MongoDBEntryService from "../../adapters/mongoDB/entryService";
import { validDate } from "../../helpers/validateDate";
import UpdateEntryUseCase from "../../use cases/entries/updateEntry";
import entryModel from "../../services/mongoDB/models/entry";

const handleUpdateEntry = async (req: Request, type: EntryTypes): Promise<Entry> => {
    const entryService = new MongoDBEntryService( { entryModel }, type);
    const updateEntryUseCase = new UpdateEntryUseCase(entryService);
    
    if(!req?.body?.update || Object.keys(req?.body?.update).length === 0|| !req?.body?.id || req?.body?.update?.type) throw new Error(CustomErrors.INVALID_REQUEST);
    if(req?.body?.update?.content && typeof req?.body?.update?.content !== "string" || req?.body?.update?.content === "" || req?.body?.update?.content === " ") throw new Error(CustomErrors.INVALID_REQUEST);
    if (req?.body?.update?.datetime && !validDate(req?.body?.update?.datetime)) throw new Error(CustomErrors.INVALID_DATE);
  
    const {id} = (req.body as {
        id: string,
    });
    let {update} = (req.body as {
        update: NewCustomEntry
    });
  
    if(update?.datetime) update = {
        ...update,
        datetime: new Date(update?.datetime)
    } as CustomEntry;
  
    const entryUpdate:CustomEntry = {...update  as CustomEntry} 
    return await updateEntryUseCase.execute(id, entryUpdate);
}

export default handleUpdateEntry;