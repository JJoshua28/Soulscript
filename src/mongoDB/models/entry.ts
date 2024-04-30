import { Schema, model } from "mongoose";
import { MoodEntrySchema } from "../../schemas/mongdoDB";
import { MoodEntry } from "../../types/entries";

/*MongoDB converts the collection name into lowercase and pluralizes it.
The collection name will really be "entries". */
const collectionName = "Entry"

const moodEntrySchema = new Schema<MoodEntry>({...MoodEntrySchema});
const moodEntryModel = model<MoodEntry>(collectionName, moodEntrySchema);

export {moodEntryModel}