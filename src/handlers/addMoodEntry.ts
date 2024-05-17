import {Request} from 'express';

import CustomErrors from '../types/error';
import { MoodEntry } from '../types/entries';

import { validDate } from '../helpers/validateDate';
import MongoDBService from "../adapters/mongoDBService";
import AddMoodEntryUseCase from "../use cases/addMoodEntry";

const handleAddEntry = async (req: Request): Promise<MoodEntry> => {
    if(!req.body?.mood || typeof req.body?.mood != "string") throw new Error(CustomErrors.INVALID_REQUEST)
    const entryService = new MongoDBService();
    const addMoodUseCase = new AddMoodEntryUseCase(entryService);

    const {datetime} = (req.body as { datetime?: string })
    
    if (datetime && !validDate(datetime)) throw new Error(CustomErrors.INVALID_DATE);
    
    const entryDate = datetime? 
    new Date(datetime): new Date();
    const entry = {...req.body, type: ["mood"], datetime: entryDate}
    
    return await addMoodUseCase.execute(entry);
}

export default handleAddEntry;