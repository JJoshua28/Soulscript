import {Request} from "express";
import moment from "moment";

import CustomErrors from "../../types/error";
import { Entry, EntryTypes } from "../../types/entries";

import { validDate } from "../../helpers/validateDate";
import MongoDBEntryService from "../../adapters/mongoDB/entryService";
import AddEntryUseCase from "../../use cases/entries/addEntry";
import entryModel from "../../services/mongoDB/models/entry";
import mapNewEntry from "../../mappers/newEntry";

const handleAddEntry = async (req: Request, type: EntryTypes): Promise<Entry> => {
    if(!req.body?.content || typeof req.body?.content != "string" || req?.body?.content === " ") throw new Error(CustomErrors.INVALID_REQUEST);
    const entryService = new MongoDBEntryService( { entryModel }, type);
    const addEntryUseCase = new AddEntryUseCase(entryService);

    const {datetime} = (req.body as { datetime?: string });
    
    if (datetime && !validDate(datetime)) throw new Error(CustomErrors.INVALID_DATE);
    
    const formatedDate = datetime? 
    moment(datetime).format("YYYY-MM-DD HH:mm:ss"): moment().format("YYYY-MM-DD HH:mm:ss");
    const entry = mapNewEntry({...req.body}, {type, datetime: new Date(formatedDate)})
    
    return await addEntryUseCase.execute(entry);
}

export default handleAddEntry;