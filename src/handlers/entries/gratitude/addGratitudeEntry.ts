import {Request} from "express";
import moment from "moment";

import CustomErrors from "../../../types/error";
import { Entry, EntryTypes } from "../../../types/entries";

import { validDate } from "../../../helpers/validateDate";
import MongoDBEntryService from "../../../adapters/mongoDB/entryService";
import AddEntryUseCase from "../../../use cases/entries/addEntry";
import entryModel from "../../../services/mongoDB/models/entry";
import mapNewEntry from "../../../mappers/newEntry";
import MongoDBTagService from "../../../adapters/mongoDB/tagService";
import tagModel from "../../../services/mongoDB/models/tag";

const handleAddGratitudeEntry = async (req: Request): Promise<Entry> => {
    if(!req.body?.content || !Array.isArray(req.body?.content) || req.body?.content.length < 1) throw new Error(CustomErrors.INVALID_REQUEST);

    const tagService = new MongoDBTagService(tagModel);
    const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.GRATITUDE);
    const addGratitudeUseCase = new AddEntryUseCase(entryService);

    const {datetime} = (req.body as { datetime?: string })
    
    if (datetime && !validDate(datetime)) throw new Error(CustomErrors.INVALID_DATE);
    
    const formatedDate = datetime? 
    moment(datetime).format("YYYY-MM-DD HH:mm:ss"): moment().format("YYYY-MM-DD HH:mm:ss");
    const entry = mapNewEntry({...req.body}, {type: EntryTypes.GRATITUDE, datetime: new Date(formatedDate)})
    
    return await addGratitudeUseCase.execute(entry);
}

export default handleAddGratitudeEntry;