import mongoose from "mongoose";

const isValidObjectId = (id: string) => {
    return mongoose.Types.ObjectId.isValid(id) && typeof id === "string";
};

const validObjectIDs = (tagIds: string[]) => {
    return tagIds.every(isValidObjectId);
};

export default validObjectIDs;
