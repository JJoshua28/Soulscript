import { Model } from "mongoose";

import type { TagDocument } from "../../../../src/services/mongoDB/types/document";
import CustomErrors from "../../../../src/types/error";

import tagModel from "../../../../src/services/mongoDB/models/tag";
import { mockDefaultNewTag } from "../../../data/tags";
import { createTagDocument } from "../../../data/helpers/customTags";
import MongoDBTagService from "../../../../src/adapters/mongoDB/tagService";
import { tagExpectation } from "../../../assertions/tags";


jest.mock("../../../../src/services/mongoDB/models/tag");
const mockTagModel = tagModel as jest.Mocked<Model<TagDocument>>;

describe("Tag", () => {
    describe("Add", () => {
        describe("Positive Tests", () => {
            it("should return a new tag", async () => {
                jest.spyOn(MongoDBTagService.prototype, "isTagNameTaken").mockResolvedValueOnce(false);
                mockTagModel.create = jest.fn().mockResolvedValueOnce(createTagDocument(mockDefaultNewTag));
               
                const tagService = new MongoDBTagService(mockTagModel);
                const response = await tagService.addTag(mockDefaultNewTag);
                
                expect(response).toEqual(expect.objectContaining(tagExpectation));
    
            });
        });
        describe("Negative Tests", () => { 
            it("should throw an error if the tag name already exists", async () => {
                jest.spyOn(MongoDBTagService.prototype, "isTagNameTaken").mockResolvedValueOnce(true);
                
                const tagService = new MongoDBTagService(mockTagModel);
                await await expect(tagService.addTag(mockDefaultNewTag)).rejects.toThrow(CustomErrors.INVALID_TAG_NAME);
        
            });
            it("should throw an error if a tag is not created and returned by MongoDB", async () => {
                jest.spyOn(MongoDBTagService.prototype, "isTagNameTaken").mockResolvedValueOnce(false);
                mockTagModel.create = jest.fn().mockResolvedValueOnce(null);
                
                const tagService = new MongoDBTagService(mockTagModel);
                await expect(tagService.addTag(mockDefaultNewTag)).rejects.toThrow(Error);
            });
        });
    });
    describe("isTagNameTaken", () => {
        describe("Positive Tests", () => {
            it("should return true if the tag name is taken", async () => {
                mockTagModel.exists = jest.fn().mockResolvedValueOnce(true);
                
                const tagService = new MongoDBTagService(mockTagModel);
                const response = await tagService.isTagNameTaken(mockDefaultNewTag.name);
                
                expect(response).toBeTruthy();
            });
            it("should return false if the tag name is not taken", async () => {
                mockTagModel.exists = jest.fn().mockResolvedValueOnce(false);
                
                const tagService = new MongoDBTagService(mockTagModel);
                const response = await tagService.isTagNameTaken(mockDefaultNewTag.name);
                
                expect(response).toBeFalsy();
            });
        });
        describe("Negative Tests", () => {
            describe("Negative Tests", () => {
                it("should throw an error if unable to check if the tag name is taken", async () => {
                    mockTagModel.exists = jest.fn().mockRejectedValueOnce(new Error());
                    
                    const tagService = new MongoDBTagService(mockTagModel);
                    await expect(tagService.isTagNameTaken(mockDefaultNewTag.name)).rejects.toThrow(Error);
                });
            });
        });
    })
})