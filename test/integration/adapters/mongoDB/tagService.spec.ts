import type { NewTag } from "../../../../src/types/tags";
import CustomErrors from "../../../../src/types/error";

import MongoDBTagService from "../../../../src/adapters/mongoDB/tagService";
import tagModel from "../../../../src/services/mongoDB/models/tag";
import { tagExpectation } from "../../../assertions/tags";
import { mockNewTag } from "../../../data/tags";
import mongooseMemoryDB from "../../../services/mongoDB/config";

describe("Tag Service", () => {
    beforeAll(async ()=> {
        await mongooseMemoryDB.setupTestEnvironment();
    });
    afterAll(async () => {
        await mongooseMemoryDB.tearDownTestEnvironment();
    });

    describe("POST /api/tag/add", () => { 
        describe("Positive Tests", () => {
            it("should add a tag and return a new tag", async () => {
                const tagSerivce = new MongoDBTagService(tagModel);
                const response = await tagSerivce.addTag(mockNewTag);
                       
                expect(response).toEqual(expect.objectContaining(tagExpectation));
        
                const [findResponse] = await tagModel.find(mockNewTag);
                expect(findResponse).toEqual(expect.objectContaining(tagExpectation));
                expect(findResponse._id.toString()).toEqual(response.id);
            });
        });
        describe("Negative Tests", () => {
            it("should throw an error if a tag already exists with the same name", async () => {
                const tagSerivce = new MongoDBTagService(tagModel);
                await expect(tagSerivce.addTag(mockNewTag)).rejects.toThrow(CustomErrors.INVALID_TAG_NAME);
            });
        });
    });
    describe("isTagNameTaken", () => {
        describe("Positive Tests", () => {
            it("should return true if the tag name is taken", async () => {
                const tagSerivce = new MongoDBTagService(tagModel);
                const response = await tagSerivce.isTagNameTaken(mockNewTag.name);
                
                expect(response).toBeTruthy();
            });
            it("should return false if the tag name is not taken", async () => {
                const newTag: NewTag = {
                    name: "newTag",
                    description: "newTagDescription",
                    createdAt: new Date()
                }
                const tagSerivce = new MongoDBTagService(tagModel);
                const response = await tagSerivce.isTagNameTaken(newTag.name);
                
                expect(response).toBeFalsy();
            })
        })
    })
})