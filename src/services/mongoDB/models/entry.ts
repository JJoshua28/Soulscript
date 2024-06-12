import { Model, model } from "mongoose";

import EntryDocument from "../types/document";
import entrySchema from "../schemas/entries";

/*MongoDB converts the collection name into lowercase and pluralizes it.
The collection name will really be "entries". */
const collectionName = "Entry"

const entryModel: Model<EntryDocument> = model<EntryDocument>(collectionName, entrySchema);

export default entryModel;