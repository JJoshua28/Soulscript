import {Request} from 'express';
import MongoDBService from "../adapters/mongoDBService";
import AddMoodEntryUseCase from "../use cases/addMoodEntry";
import { MoodEntry } from '../types/entries';
import { validDate } from '../helpers/validateDate';

const handleAddEntry = async (req: Request): Promise<MoodEntry> => {
    const entryService = new MongoDBService();
    const addMoodUseCase = new AddMoodEntryUseCase(entryService);
    
    const {datetime} = (req.body as { datetime?: string })
    
    if (datetime && !validDate(datetime)) throw new Error("Invalid date");
    
    const entryDate = datetime? 
    new Date(datetime): new Date();
    const entry = {...req.body, datetime: entryDate}
    
    return await addMoodUseCase.execute(entry);
}

export default handleAddEntry;