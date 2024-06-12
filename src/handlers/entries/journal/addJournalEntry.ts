import moment from "moment";
import { Request } from "express";

import CustomErrors from "../../../types/error";
import { Entry, EntryTypes } from "../../../types/entries";

import MongoDBService from "../../../adapters/mongoDBService";
import { validDate } from "../../../helpers/validateDate";
import mapNewEntry from "../../../mappers/newEntry";
import entryModel from "../../../services/mongoDB/models/entry";
import AddEntryUseCase from "../../../use cases/addEntry";

const handleAddJournalEntry = async (req: Request): Promise<Entry> => {
    if(!req.body?.content || typeof req.body?.content != "string" || req?.body?.content === " ") throw new Error(CustomErrors.INVALID_REQUEST)
    const entryService = new MongoDBService(entryModel, EntryTypes.JOURNAL);
    const addMoodUseCase = new AddEntryUseCase(entryService);

    const {datetime} = (req.body as { datetime?: string })
    
    if (datetime && !validDate(datetime)) throw new Error(CustomErrors.INVALID_DATE);
    
    const formatedDate = datetime? 
    moment(datetime).format("YYYY-MM-DD HH:mm:ss"): moment().format("YYYY-MM-DD HH:mm:ss");
    const entry = mapNewEntry({...req.body}, {type: EntryTypes.JOURNAL, datetime: new Date(formatedDate)})
    
    return await addMoodUseCase.execute(entry);
}

export default handleAddJournalEntry;