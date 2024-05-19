import {Request} from 'express';

import CustomErrors from '../types/error';
import { Entry, EntryTypes } from '../types/entries';

import { validDate } from '../helpers/validateDate';
import MongoDBService from "../adapters/mongoDBService";
import AddMoodEntryUseCase from "../use cases/addMoodEntry";
import entryModel from '../services/mongoDB/models/entry';

const handleAddEntry = async (req: Request): Promise<Entry> => {
    if(!req.body?.content || typeof req.body?.content != "string") throw new Error(CustomErrors.INVALID_REQUEST)
    const entryService = new MongoDBService(entryModel, EntryTypes.MOOD);
    const addMoodUseCase = new AddMoodEntryUseCase(entryService);

    const {datetime} = (req.body as { datetime?: string })
    
    if (datetime && !validDate(datetime)) throw new Error(CustomErrors.INVALID_DATE);
    
    const entryDate = datetime? 
    new Date(datetime): new Date();
    const entry = {...req.body, type: EntryTypes.MOOD, datetime: entryDate}
    
    return await addMoodUseCase.execute(entry);
}

export default handleAddEntry;