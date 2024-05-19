import { Model, Schema, model } from "mongoose";

import EntryDocument from "../types/document";
import EntrySchema from "../schemas/entries";

/*MongoDB converts the collection name into lowercase and pluralizes it.
The collection name will really be "entries". */
const collectionName = "Entry"

const entrySchema = new Schema<EntryDocument>(EntrySchema);
const entryModel: Model<EntryDocument> = model<EntryDocument>(collectionName, entrySchema);

export default entryModel;