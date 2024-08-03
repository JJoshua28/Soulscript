import { Request } from "express";

import { Entry, EntryTypes, NewCustomEntry } from "../../types/entries";
import CustomErrors from "../../types/error";

import MongoDBEntryService from "../../adapters/mongoDB/entryService";
import { validDate } from "../../helpers/validateDate";
import UpdateEntryUseCase from "../../use cases/entries/updateEntry";
import entryModel from "../../services/mongoDB/models/entry";
import tagModel from "../../services/mongoDB/models/tag";
import MongoDBTagService from "../../adapters/mongoDB/tagService";
import validObjectIDs from "../../helpers/mongoDB/validateObjectId";

const handleUpdateEntry = async (
  req: Request,
  type: EntryTypes
): Promise<Entry> => {

  const { id, update } = req.body;

  if (
    !update ||
    Object.keys(update).length === 0 ||
    !id) throw new Error(CustomErrors.INVALID_REQUEST);
  
  const {datetime, tags, content} = update;

  if (datetime && !validDate(datetime)) throw new Error(CustomErrors.INVALID_DATE);

  if (content && typeof content !== "string") throw new Error(CustomErrors.INVALID_REQUEST);

  if (!!tags && (
      !Array.isArray(tags) || 
      (tags.length > 0 && !validObjectIDs((tags))) 
    )
  )  throw new Error(CustomErrors.INVALID_REQUEST);

  const entryUpdate = {
    ...update,
    datetime: datetime ? new Date(datetime) : undefined,
  } as NewCustomEntry;

  const tagService = new MongoDBTagService({tagModel});
  const entryService = new MongoDBEntryService(
    { entryModel, tagService },
    type
  );

  const updateEntryUseCase = new UpdateEntryUseCase(entryService);
  return await updateEntryUseCase.execute(id, entryUpdate);
};

export default handleUpdateEntry;
