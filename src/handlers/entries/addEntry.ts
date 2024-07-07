import {Request} from "express";
import moment from "moment";

import CustomErrors from "../../types/error";
import { Entry, EntryTypes } from "../../types/entries";

import { validDate } from "../../helpers/validateDate";
import MongoDBEntryService from "../../adapters/mongoDB/entryService";
import AddEntryUseCase from "../../use cases/entries/addEntry";
import entryModel from "../../services/mongoDB/models/entry";
import mapNewEntry from "../../mappers/newEntry";
import MongoDBTagService from "../../adapters/mongoDB/tagService";
import tagModel from "../../services/mongoDB/models/tag";
import validObjectID from "../../helpers/mongoDB/validateObjectId";
import mapStringArrayToObjectIdArray from "../../mappers/mongoDB/stringToObjectID";

const handleAddEntry = async (req: Request, type: EntryTypes): Promise<Entry> => {
    const { content, datetime, tags } = req.body;

    if (!content || typeof content !== "string" || content.trim() === "") {
        throw new Error(CustomErrors.INVALID_REQUEST);
    }

    if (datetime && !validDate(datetime)) throw new Error(CustomErrors.INVALID_DATE);
    
    if (tags && !Array.isArray(tags) || tags.length > 0 && !validObjectID(tags)) throw new Error(CustomErrors.INVALID_REQUEST);

    const formattedDate = datetime
        ? moment(datetime).format("YYYY-MM-DD HH:mm:ss")
        : moment().format("YYYY-MM-DD HH:mm:ss");

    const formattedTags = tags && tags.length > 0 ? 
        mapStringArrayToObjectIdArray(tags) : [];

    const newEntry = mapNewEntry({
        sharedID: req.body?.sharedID,
        datetime: new Date(formattedDate),
        content,
        tags: formattedTags,
        subject: req.body?.subject,
        quote: req.body?.quote,
        type,
    })

    const tagService = new MongoDBTagService(tagModel);
    const entryService = new MongoDBEntryService({ entryModel, tagService }, type);
    const addEntryUseCase = new AddEntryUseCase(entryService);

    return await addEntryUseCase.execute(newEntry);
}

export default handleAddEntry;