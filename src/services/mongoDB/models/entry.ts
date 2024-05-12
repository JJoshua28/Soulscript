import { Schema, model } from "mongoose";
import { MoodEntrySchema } from "../../../schemas/mongdoDB";
import { MoodEntryDocument } from "../types/document";

/*MongoDB converts the collection name into lowercase and pluralizes it.
The collection name will really be "entries". */
const collectionName = "Entry"

const moodEntrySchema = new Schema<MoodEntryDocument>({...MoodEntrySchema});
const moodEntryModel = model<MoodEntryDocument>(collectionName, moodEntrySchema);

export {moodEntryModel}