import mongoose from "mongoose";

import type { NewTag, Tag } from "../../../../src/types/tags";
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
    let globalTag: Tag;
    describe("POST /api/tag/add", () => { 
        describe("Positive Tests", () => {
            it("should add a tag and return a new tag", async () => {
                const tagSerivce = new MongoDBTagService(tagModel);
                const response = await tagSerivce.addTag(mockNewTag);
                       
                expect(response).toEqual(expect.objectContaining(tagExpectation));
        
                const [findResponse] = await tagModel.find(mockNewTag);
                expect(findResponse).toEqual(expect.objectContaining(tagExpectation));
                expect(findResponse._id.toString()).toEqual(response.id);
                globalTag = response;
            });
        });
        describe("Negative Tests", () => {
            it("should throw an error if a tag already exists with the same name", async () => {
                const tagSerivce = new MongoDBTagService(tagModel);
                await expect(tagSerivce.addTag(mockNewTag)).rejects.toThrow(CustomErrors.INVALID_TAG);
            });
        });
    });
    describe("doAllTagsExist", () => {
        describe("Positive Tests", () => {
            it("should return true if the tag name is taken", async () => {
                const tagSerivce = new MongoDBTagService(tagModel);
                const response = await tagSerivce.doAllTagsExist([mockNewTag.name]);
                
                expect(response).toBeTruthy();
            });
            it("should return false if the tag name is not taken", async () => {
                const newTag: NewTag = {
                    name: "newTag",
                    description: "newTagDescription",
                    createdAt: new Date()
                }
                const tagSerivce = new MongoDBTagService(tagModel);
                const response = await tagSerivce.doAllTagsExist([newTag.name]);
                
                expect(response).toBeFalsy();
            })
        })
    });
    describe("PUT /api/tag/update", () => {
        describe("Positive Tests", () => {
            it("should update a tag's name and return the tag", async () => {
                const updates = {
                    name: "updatedTag test"
                }

                const tagSerivce = new MongoDBTagService(tagModel);
                const response = await tagSerivce.updateTag(globalTag.id, updates);
                
                expect(response).toEqual(expect.objectContaining({
                    id: expect.any(String),
                    ...tagExpectation
                }));
                expect(response.name).toEqual(updates.name);
            });
            it("should update a tag's description and return the tag", async () => {
                const updates = {
                    description: "updatedTagDescription test"
                }

                const tagSerivce = new MongoDBTagService(tagModel);
                const response = await tagSerivce.updateTag(globalTag.id, updates);
                
                expect(response).toEqual(expect.objectContaining({
                    id: expect.any(String),
                    ...tagExpectation
                }));
                expect(response.description).toEqual(updates.description);
            })
            it("should update a tag's name and description and return the tag", async () => {
                const updates = {
                    name: "updatedTag test",
                    description: "updatedTagDescription test"
                }

                const tagSerivce = new MongoDBTagService(tagModel);
                const response = await tagSerivce.updateTag(globalTag.id, updates);
                
                expect(response).toEqual(expect.objectContaining({
                    id: expect.any(String),
                    ...tagExpectation
                }));
                expect(response.name).toEqual(updates.name);
                expect(response.description).toEqual(updates.description);  
            })
        });
        describe("Negative Tests", () => {
            it("should throw if no tags exist with that ID", async () => {
                const updates = {
                    name: "updatedTag test"
                }

                const tagSerivce = new MongoDBTagService(tagModel);
                await expect(tagSerivce.updateTag(new mongoose.Types.ObjectId().toString(), updates)).rejects.toThrow(CustomErrors.INVALID_TAG);
            });
        });
    });
    describe("GET /api/tag/get-all", () => {
        describe("Positive Tests", () => {
            it("should return all tag entries", async () => {
                const tagSerivce = new MongoDBTagService(tagModel);
                const response = await tagSerivce.getAllTags(); 
                expect(response).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        name: expect.any(String),
                        createdAt: expect.any(Date)
                    })
                ]));
            });
            it("should return an empty array if no tags documents are found", async () => {
                await mongooseMemoryDB.tearDownTestEnvironment();
                await mongooseMemoryDB.setupTestEnvironment();
                
                const tagSerivce = new MongoDBTagService(tagModel);
                const response = await tagSerivce.getAllTags(); 
                expect(response).toEqual(expect.arrayContaining([]));
            });
            
        })
    })
})