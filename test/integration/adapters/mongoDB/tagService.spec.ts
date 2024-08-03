import mongoose from "mongoose";

import type { Tag } from "../../../../src/types/tags";
import CustomErrors from "../../../../src/types/error";

import MongoDBTagService from "../../../../src/adapters/mongoDB/tagService";
import tagModel from "../../../../src/services/mongoDB/models/tag";
import { tagExpectation } from "../../../assertions/tags";
import { mockNewTag } from "../../../data/tags";
import mongooseMemoryDB from "../../../services/mongoDB/config";
import entryModel from "../../../../src/services/mongoDB/models/entry";
import MongoDBEntryService from "../../../../src/adapters/mongoDB/entryService";
import { seedTagData } from "../../../data/helpers/seedTagData";

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
                const tagSerivce = new MongoDBTagService({tagModel});
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
                const tagSerivce = new MongoDBTagService({tagModel});
                await expect(tagSerivce.addTag(mockNewTag)).rejects.toThrow(CustomErrors.INVALID_TAG_EXISTS);
            });
        });
    });
    describe("doAllTagsExist", () => {
        describe("Positive Tests", () => {
            it("should return true if the tag is taken", async () => {
                const tagSerivce = new MongoDBTagService({tagModel});
                const response = await tagSerivce.doAllTagsExist([new mongoose.Types.ObjectId(globalTag.id)]);
                
                expect(response).toBeTruthy();
            });
            it("should return false if the tag id does not exist", async () => {
                const tagSerivce = new MongoDBTagService({tagModel});
                const response = await tagSerivce.doAllTagsExist([new mongoose.Types.ObjectId()]);
                

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

                const tagSerivce = new MongoDBTagService({tagModel});
                const response = await tagSerivce.updateTag(globalTag.id, updates);
                
                expect(response).toStrictEqual(expect.objectContaining({
                    id: expect.any(String),
                    ...tagExpectation
                }));
                expect(response.name).toEqual(updates.name);
            });
            it("should update a tag's description and return the tag", async () => {
                const updates = {
                    description: "updatedTagDescription test"
                }

                const tagSerivce = new MongoDBTagService({tagModel});
                const response = await tagSerivce.updateTag(globalTag.id, updates);
                
                expect(response).toStrictEqual(expect.objectContaining({
                    id: expect.any(String),
                    ...tagExpectation
                }));
                expect(response.description).toEqual(updates.description);
            })
            it("should update a tag's name and description and return the tag", async () => {
                const updates = {
                    name: "updating tag test",
                    description: "updatedTagDescription test"
                }

                const tagSerivce = new MongoDBTagService({tagModel});
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

                const tagSerivce = new MongoDBTagService({tagModel});
                await expect(tagSerivce.updateTag(new mongoose.Types.ObjectId().toString(), updates)).rejects.toThrow(CustomErrors.VOID_TAG);
            });
            it("should throw if a tag already exists with the name in the update", async () => {
                const updates = {
                    name: "updating tag test"
                }

                const tagSerivce = new MongoDBTagService({tagModel});
                await expect(tagSerivce.updateTag(globalTag.id, updates)).rejects.toThrow(CustomErrors.INVALID_TAG_EXISTS);
            })
        });
    });
    describe("GET /api/tag/get-all", () => {
        describe("Positive Tests", () => {
            it("should return all tag entries", async () => {
                const tagSerivce = new MongoDBTagService({tagModel});
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
                
                const tagSerivce = new MongoDBTagService({tagModel});
                const response = await tagSerivce.getAllTags(); 
                expect(response).toEqual(expect.arrayContaining([]));
            });
            
        })
    });
    describe("DELETE /api/tag/delete", () => {
        const entryService = new MongoDBEntryService({entryModel});
        const tagSerivce = new MongoDBTagService({tagModel, entryService});
        describe("Positive Tests", () => {
            it("should delete a tag and return the deleted tag", async () => {
                globalTag = await seedTagData(tagModel, "tag Updates test");
                
                const response = await tagSerivce.deleteTag(globalTag.id); 
                expect(response).toEqual(expect.objectContaining({
                    id: expect.any(String),
                    ...tagExpectation
                }));
            });
        });
        describe("Negative Tests", () => {
            it("should throw if no tags exist with that ID", async () => {
                await expect(tagSerivce.deleteTag(new mongoose.Types.ObjectId().toString())).rejects.toThrow(CustomErrors.INVALID_TAG);
            });
        });
    });
})