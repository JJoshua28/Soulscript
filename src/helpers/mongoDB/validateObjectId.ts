import mongoose from "mongoose";

const isValidObjectId = (id: string) => {
    const objectIdPattern = /^[a-fA-F0-9]{24}$/;
    return mongoose.Types.ObjectId.isValid(id) && objectIdPattern.test(id);
};

const validObjectIDs = (tagIds:string[]) => {
    return tagIds.every(isValidObjectId);
};


export default validObjectIDs;