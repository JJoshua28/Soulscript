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
import validObjectIDs from "../../../helpers/mongoDB/validateObjectId";

const handleAddGratitudeEntry = async (req: Request): Promise<Entry> => {
  const { content, datetime, tags } = req.body;

  if (!content || !Array.isArray(content) || content.length < 1) throw new Error(CustomErrors.INVALID_REQUEST);

  if (datetime && !validDate(datetime)) throw new Error(CustomErrors.INVALID_DATE);

  if (!!tags && (!Array.isArray(tags) || (tags.length > 0 && !validObjectIDs(tags)) ))  throw new Error(CustomErrors.INVALID_REQUEST);

  
  const formattedDate = datetime
    ? moment(datetime).format("YYYY-MM-DD HH:mm:ss")
    : moment().format("YYYY-MM-DD HH:mm:ss");

  const entry = mapNewEntry({
    ...req.body,
    type: EntryTypes.GRATITUDE,
    datetime: new Date(formattedDate),
  });

  const tagService = new MongoDBTagService({tagModel});
  const entryService = new MongoDBEntryService(
    { entryModel, tagService },
    EntryTypes.GRATITUDE
  );
  const addGratitudeUseCase = new AddEntryUseCase(entryService);

  return await addGratitudeUseCase.execute(entry);
};

export default handleAddGratitudeEntry;