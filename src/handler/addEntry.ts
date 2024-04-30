import {Request} from 'express';
import MongoDBService from "../adapter/mongoDBService";
import AddMoodEntryUseCase from "../use case/addMoodEntry";
import { MoodEntry } from '../types/entries';

const handleAddEntry = async (req: Request): Promise<MoodEntry> => {
    const entryService = new MongoDBService();
    const addMoodUseCase = new AddMoodEntryUseCase(entryService);
    
    const entryDate = req.body?.datetime? 
        new Date(req.body.datetime): new Date();
    const entry = {...req.body, datetime: entryDate}
    return await addMoodUseCase.execute(entry);
}

export default handleAddEntry;