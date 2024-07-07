import { Model, model } from "mongoose";

import type{ TagDocument } from "../types/document";
import tagSchema from "../schemas/tag";


/*MongoDB converts the collection name into lowercase and pluralizes it.
The collection name will really be "tags". */
export const tagCollectionName = "Tag"

const tagModel: Model<TagDocument> = model<TagDocument>(tagCollectionName, tagSchema);

export default tagModel;