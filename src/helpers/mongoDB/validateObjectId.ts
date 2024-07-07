import mongoose from "mongoose";

const validObjectID = (tagIds: string[]): boolean => {
    tagIds.forEach((id) => {
        if (!mongoose.Types.ObjectId.isValid(id)) return false;
    })
    return true;
};

export default validObjectID;