import { Request } from "express";
import { Entry, EntryTypes, NewCustomEntry } from "../../../types/entries";
import CustomErrors from "../../../types/error";

import MongoDBEntryService from "../../../adapters/mongoDB/entryService";
import { validDate } from "../../../helpers/validateDate";
import UpdateEntryUseCase from "../../../use cases/entries/updateEntry";
import entryModel from "../../../services/mongoDB/models/entry";
import MongoDBTagService from "../../../adapters/mongoDB/tagService";
import tagModel from "../../../services/mongoDB/models/tag";
import validObjectIDs from "../../../helpers/mongoDB/validateObjectId";

const handleUpdateGratitudeEntry = async (req: Request): Promise<Entry> => {
  const { id, update } = req.body;
  
  if (
    !update ||
    Object.keys(update).length === 0 ||
    !id ||
    update.type
  )throw new Error(CustomErrors.INVALID_REQUEST);
  
  const { datetime, content, tags } = update;
  
  if (content && (
      !Array.isArray(content) || content.length < 1
    )
  ) throw new Error(CustomErrors.INVALID_REQUEST);
  
  if (!!tags && (
    !Array.isArray(tags) || 
    (tags.length > 0 && !validObjectIDs(tags)) 
  )) throw new Error(CustomErrors.INVALID_REQUEST);  

  if (datetime && !validDate(datetime))
    throw new Error(CustomErrors.INVALID_DATE);

  const entryUpdate = {
    ...update,
    datetime: update.datetime ? new Date(update.datetime) : undefined,
  } as NewCustomEntry;

  const tagService = new MongoDBTagService({tagModel});
  const entryService = new MongoDBEntryService(
    { entryModel, tagService },
    EntryTypes.GRATITUDE
  );

  const updateGratitudeUseCase = new UpdateEntryUseCase(entryService);

  return await updateGratitudeUseCase.execute(id, entryUpdate);
};

export default handleUpdateGratitudeEntry;