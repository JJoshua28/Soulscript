import mongoose from "mongoose";

const mapStringArrayToObjectIdArray = (tags: string[]): mongoose.Types.ObjectId[] => {
    return tags.map((tag) => new mongoose.Types.ObjectId(tag));
}

export default mapStringArrayToObjectIdArray;