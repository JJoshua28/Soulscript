import { Model, model } from "mongoose";

import type{ TagDocument } from "../types/document";
import tagSchema from "../schemas/tag";


/*MongoDB converts the collection name into lowercase and pluralizes it.
The collection name will really be "tags". */
const collectionName = "Tag"

const tagModel: Model<TagDocument> = model<TagDocument>(collectionName, tagSchema);

export default tagModel;