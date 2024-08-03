import mongoose, { Model } from "mongoose";

import type { EntryDocument, TagDocument } from "../../../../src/services/mongoDB/types/document";
import CustomErrors from "../../../../src/types/error";

import tagModel from "../../../../src/services/mongoDB/models/tag";
import { mockDefaultNewTag, mockDefaultTag, mockTag } from "../../../data/tags";
import { createTagDocument } from "../../../data/helpers/customTags";
import MongoDBTagService from "../../../../src/adapters/mongoDB/tagService";
import { tagExpectation } from "../../../assertions/tags";
import DeleteTagFromAllEntriesUseCase from "../../../../src/use cases/entries/deleteTagFromAllEntries";
import entryModel from "../../../../src/services/mongoDB/models/entry";
import MongoDBEntryService from "../../../../src/adapters/mongoDB/entryService";


jest.mock("../../../../src/services/mongoDB/models/tag");
const mockTagModel = tagModel as jest.Mocked<Model<TagDocument>>;

describe("Tag", () => {
    describe("Add", () => {
        describe("Positive Tests", () => {
            it("should return a new tag", async () => {
                mockTagModel.exists = jest.fn().mockResolvedValue(false);
                mockTagModel.create = jest.fn().mockResolvedValueOnce(createTagDocument(mockDefaultNewTag));
               
                const tagService = new MongoDBTagService({tagModel: mockTagModel});
                const response = await tagService.addTag(mockDefaultNewTag);
                
                expect(response).toEqual(expect.objectContaining(tagExpectation));
    
            });
        });
        describe("Negative Tests", () => { 
            it("should throw an error if the tag name already exists", async () => {
                mockTagModel.exists = jest.fn().mockResolvedValueOnce(true);
                
                const tagService = new MongoDBTagService({tagModel: mockTagModel});
                await await expect(tagService.addTag(mockDefaultNewTag)).rejects.toThrow(CustomErrors.INVALID_TAG_EXISTS);
        
            });
            it("should throw an error if a tag is not created and returned by MongoDB", async () => {
                mockTagModel.create = jest.fn().mockResolvedValueOnce(null);
                mockTagModel.exists = jest.fn().mockResolvedValueOnce(false);
                
                const tagService = new MongoDBTagService({tagModel: mockTagModel});
                await expect(tagService.addTag(mockDefaultNewTag)).rejects.toThrow(Error);
            });
        });
    });
    describe("doAllTagsExist", () => {
        describe("Positive Tests", () => {
            it("should return true if a document with that tag id exist", async () => {
                mockTagModel.exists = jest.fn().mockResolvedValue(true);
                
                const tagService = new MongoDBTagService({tagModel: mockTagModel});
                const response = await tagService.doAllTagsExist([
                    new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()
                ]);
                
                
                expect(response).toBeTruthy();
            });
            it("should return false if no document exists with that tag id", async () => {
                mockTagModel.exists = jest.fn().mockResolvedValueOnce(false);
                
                const tagService = new MongoDBTagService({tagModel: mockTagModel});
                const response = await tagService.doAllTagsExist([
                    new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()
                ]);
                
                expect(response).toBeFalsy();
            });
        });
        describe("Negative Tests", () => {
            describe("Negative Tests", () => {
                it("should throw an error if unable to check if the tag name is taken", async () => {
                    mockTagModel.exists = jest.fn().mockRejectedValueOnce(new Error());
                    
                    const tagService = new MongoDBTagService({tagModel: mockTagModel});
                    await expect(tagService.doAllTagsExist([
                        new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()
                    ])).rejects.toThrow(Error);
                });
            });
        });
    });
    describe("getAllTags", () => {
        describe("Positive Tests", () => {
            it("should return all tag entries", async () => {
                mockTagModel.find = jest.fn().mockResolvedValueOnce([
                    createTagDocument(mockDefaultTag),
                    createTagDocument(mockTag)
                ]);
                
                const tagService = new MongoDBTagService({tagModel: mockTagModel});
                const response = await tagService.getAllTags(); 
                expect(response).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        name: expect.any(String),
                        createdAt: expect.any(Date)
                    })
                ]));
            });
            it("should return an empty array if no tags documents are found", async () => {
                mockTagModel.find = jest.fn().mockResolvedValueOnce([]);
                
                const tagService = new MongoDBTagService({tagModel: mockTagModel});
                const response = await tagService.getAllTags(); 
                expect(response).toEqual(expect.arrayContaining([]));
            })
        })
    });
    describe("updateTag", () => {
        describe("Positive Tests", () => {
            beforeAll(() => mockTagModel.exists = jest.fn().mockResolvedValue(false));
            it("should update a tags description", async () => {
                const { id, ...tagInfo } = mockDefaultTag;
                const updatedTagDocument = {
                    _id: id,
                    ...tagInfo,
                    description: "updated description"
                }

                const updates = {
                    description: "updated description"
                }

                mockTagModel.exists = jest.fn().mockResolvedValueOnce(true);

                mockTagModel.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(updatedTagDocument);
                
                const tagService = new MongoDBTagService({tagModel: mockTagModel});
                const response = await tagService.updateTag(mockDefaultTag.id, updates);
                
                expect(response).toEqual(expect.objectContaining({
                    id: updatedTagDocument._id,
                    name: updatedTagDocument.name,
                    description: updatedTagDocument.description,
                    createdAt: expect.any(Date)
                }));
            });
            it("should update a tags name", async () => {
                const { id, ...tagInfo } = mockTag;
                const updatedTagDocument = {
                    _id: id,
                    ...tagInfo,
                    name: "updateTag test"
                }

                const updates = {
                    name: "updateTag test"
                }

                mockTagModel.exists = jest.fn().mockResolvedValueOnce(true);
                mockTagModel.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(updatedTagDocument);
                
                const tagService = new MongoDBTagService({tagModel: mockTagModel});
                const response = await tagService.updateTag(mockTag.id, updates);
                
                expect(response).toEqual(expect.objectContaining({
                    id: updatedTagDocument._id,
                    name: updatedTagDocument.name,
                    description: updatedTagDocument.description,
                    createdAt: expect.any(Date)
                }));
            });
            it("should update a tags name and description", async () => {
                const { id, ...tagInfo } = mockTag;
                const updatedTagDocument = {
                    _id: id,
                    ...tagInfo,
                    name: "updateTag test",
                    descriptiopn: "updated description"
                }

                const updates = {
                    name: "updateTag test",
                    descriptiopn: "updated description"
                }

                mockTagModel.exists = jest.fn().mockResolvedValueOnce(true);
                mockTagModel.findByIdAndUpdate = jest.fn().mockResolvedValueOnce(updatedTagDocument);
                
                const tagService = new MongoDBTagService({tagModel: mockTagModel});
                const response = await tagService.updateTag(mockTag.id, updates);
                
                expect(response).toEqual(expect.objectContaining({
                    id: updatedTagDocument._id,
                    name: updatedTagDocument.name,
                    description: updatedTagDocument.description,
                    createdAt: expect.any(Date)
                }));
            });
        });
        describe("Negative Tests", () => {
            it("should throw if no tag if exist with the provided id", async () => {
                mockTagModel.exists = jest.fn().mockResolvedValueOnce(false);
                
                const tagService = new MongoDBTagService({tagModel: mockTagModel});
                await expect(tagService.updateTag(mockTag.id, {})).rejects.toThrow(CustomErrors.VOID_TAG);
            });
            it("should throw if a tag already exists with the name in the update", async () => {
                const updates = {
                    name: "test"
                }
                mockTagModel.exists = jest.fn().mockResolvedValue(true);
                
                const tagService = new MongoDBTagService({tagModel: mockTagModel});
                await expect(tagService.updateTag(mockTag.id, updates)).rejects.toThrow(CustomErrors.INVALID_TAG_EXISTS);
            });
        });
    });
    describe("deleteTag", () => {
        const mockEntryModel = entryModel as jest.Mocked<Model<EntryDocument>>;
        const mockEntryService = new MongoDBEntryService({entryModel: mockEntryModel});
        
        const tagService = new MongoDBTagService({tagModel: mockTagModel, entryService: mockEntryService});
        
        const executeSpy = jest.spyOn(DeleteTagFromAllEntriesUseCase.prototype, "execute");
        executeSpy.mockResolvedValue(true);
        describe("Positive Tests", () => {
            const responseDocument =createTagDocument(mockTag);
            const {_id: mockTagDocumentId} = responseDocument;
            const mockTagId = mockTagDocumentId.toString();
            
            mockTagModel.exists = jest.fn().mockResolvedValue(true);
            mockTagModel.findByIdAndDelete = jest.fn().mockResolvedValue(responseDocument);
            it("should delete a tag with the specified id and return that document", async () => {

                const response = await tagService.deleteTag(mockTagId);
                
                expect(response).toEqual(expect.objectContaining({
                    id: mockTagId,
                    name: expect.any(String),
                    description: expect.any(String),
                    createdAt: expect.any(Date)
                }));
            });
            it("should call the entry service to remove all entries with a provided tag", async () => {
   
                await tagService.deleteTag(mockTagId);

                expect(executeSpy).toHaveBeenCalledWith(mockTagId);
                
            });
        });
        describe("Negative Tests", () => {
            const mockTagId = new mongoose.Types.ObjectId().toString();
            it("should throw if no tag if exist with the provided id", async () => {
                mockTagModel.exists = jest.fn().mockResolvedValueOnce(false);
                
                await expect(tagService.deleteTag(mockTagId)).rejects.toThrow(CustomErrors.INVALID_TAG);
            }); 
        });
    });
})