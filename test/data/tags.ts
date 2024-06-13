import mongoose from "mongoose";

import { NewTag, Tag } from "../../src/types/tags";

export const mockDefaultNewTag: NewTag = {
    name: "test",
    description: "",
    createdAt: new Date()
}

export const mockNewTag: NewTag = {
    name: "test",
    description: "testing testing testing",
    createdAt: new Date()
}

export const mockDefaultTag: Tag = {
    id: new mongoose.Types.ObjectId().toString(),
    name: "test",
    description: "",
    createdAt: new Date()
}

export const mockTag: Tag = {
    id: new mongoose.Types.ObjectId().toString(),
    name: "test",
    description: "testing testing testing",
    createdAt: new Date()
}