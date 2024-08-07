import mongoose, { Model } from "mongoose";

import { EntryTypes, NewEntry } from "../../../../src/types/entries";
import type { EntryDocument, TagDocument }  from "../../../../src/services/mongoDB/types/document";
import { defaultEntryExpectation, gratitudeEntryExpectation } from "../../../assertions/entries";

import { defaultMoodEntry, mockMoodEntryDocument, newMoodEntry } from "../../../data/moodEntry";
import MongoDBEntryService from "../../../../src/adapters/mongoDB/entryService";
import MongoDBTagService from "../../../../src/adapters/mongoDB/tagService";
import { createEntryDocument } from "../../../data/helpers/customEntry";
import entryModel from "../../../../src/services/mongoDB/models/entry";
import { defaultGratitudeEntry, newGratitudeEntry } from "../../../data/gratitudeEntry";
import { defaultJournalEntry, newJournalEntry } from "../../../data/journalEntry";
import tagModel from "../../../../src/services/mongoDB/models/tag";
import CustomErrors from "../../../../src/types/error";
import { createTagDocument } from "../../../data/helpers/customTags";
import { mockDefaultNewTag } from "../../../data/tags";
import { fieldIncludesElementQuery, removeArrayElementQuery } from "../../../../src/services/mongoDB/queries/queries";

jest.mock("../../../../src/services/mongoDB/models/entry");
jest.mock("../../../../src/services/mongoDB/models/tag");

jest.mock("../../../../src/adapters/mongoDB/tagService");

const mockEntryModel = entryModel as jest.Mocked<Model<EntryDocument>>;
const mockTagModel = tagModel as jest.Mocked<Model<TagDocument>>;



describe("Entry", ()=> {
    const mockTagService = new MongoDBTagService({tagModel: mockTagModel});
    const tagDocument = createTagDocument(mockDefaultNewTag);
    describe("Add", () => {
        jest.spyOn(mockTagService, "doAllTagsExist").mockResolvedValue(true)
        describe("Mood", () => {
            const newEntry = newMoodEntry;
            const mockMoodEntryDocument = createEntryDocument(defaultMoodEntry);
            describe("Positive", () => {
                let entryService: MongoDBEntryService;
                beforeAll(() => {
                    mockTagModel.exists = jest.fn().mockResolvedValue(true);
    
                   
                    entryService = new MongoDBEntryService( { entryModel: mockEntryModel, tagService: mockTagService }, EntryTypes.MOOD);
                });
                it("should return a mood Entry document", async () => {
                    mockEntryModel.create = jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockResolvedValue({
                            ...mockMoodEntryDocument,
                            tags: [tagDocument]
                        }),
                        populated: jest.fn().mockReturnValue(true),
                    }));

                    const response = await entryService.addEntry(newEntry);
                    
                    expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));
    
                });
                it("should return a mood Entry when attempting to add one without a tag", async () => {
                    mockEntryModel.create = jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockResolvedValue(mockMoodEntryDocument),
                        populated: jest.fn().mockReturnValue(true),
                    }));
    
                    const mockMoodEntry: NewEntry = {...newEntry, tags: []};                     
                    const response = await entryService.addEntry(mockMoodEntry);
                    
                    expect(response).toEqual(expect.objectContaining({
                        ...defaultEntryExpectation,
                        tags: []
                    }));
    
                });
            });
            describe("Negative", () => {
                it("should throw an error if unable to create", async () => {
                    mockEntryModel.create = jest.fn().mockRejectedValueOnce(new Error());
                    
                   
                    
                    const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel, tagService: mockTagService }, EntryTypes.MOOD);
                    
                    await expect(mongoService.addEntry(newEntry)).rejects.toThrow(Error);
                });
                it("should throw when trying to create an Entry with a tag that does not exist", async () => {
                    jest.spyOn(mockTagService, "doAllTagsExist").mockResolvedValueOnce(false)
                   
                    const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel, tagService: mockTagService }, EntryTypes.MOOD);
                                     
                    await expect(mongoService.addEntry(newEntry)).rejects.toThrow(CustomErrors.INVALID_TAG);
                });
                it("should throw when trying to add a mood entry without the tag service", async () => {
                   
                    const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.MOOD);
                                     
                    await expect(mongoService.addEntry(newEntry)).rejects.toThrow(CustomErrors.VOID_TAG_SERVICE);
                });
            });
        });
        
        describe("Gratitude", () => {
            const newEntry: NewEntry = newGratitudeEntry;
            describe("Positive Tests", () => {
                const mockGratitudeEntryDocument = createEntryDocument(defaultGratitudeEntry);
                let entryService: MongoDBEntryService;
                beforeAll(() => {
                    mockTagModel.exists = jest.fn().mockResolvedValue(true);
    
                    entryService = new MongoDBEntryService( { entryModel: mockEntryModel, tagService: mockTagService }, EntryTypes.GRATITUDE);
                });
                it("should return a gratitude Entry document", async () => {
                    mockEntryModel.create = jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockResolvedValue({
                            ...mockGratitudeEntryDocument,
                            tags: [tagDocument]
                        }),
                        populated: jest.fn().mockReturnValue(true),
                    }));

                    const response = await entryService.addEntry(newEntry);
                    
                    
                    expect(response).toEqual(expect.objectContaining(gratitudeEntryExpectation));
                });
                it("should return a Gratitude Entry when attempting to add one without a tag", async () => {
                    mockEntryModel.create = jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockResolvedValue(mockGratitudeEntryDocument),
                        populated: jest.fn().mockReturnValue(true),
                    }));

                    const response = await entryService.addEntry(newEntry);
                    
                    expect(response).toEqual(expect.objectContaining({
                        ...gratitudeEntryExpectation,
                        tags: [] 
                    }));
                });
            });
            describe("Negative Tests", () => {
                it("should throw an error if unable to create", async () => {
                    const mockEntryModel = entryModel as jest.Mocked<Model<EntryDocument>>;
                    mockEntryModel.create = jest.fn().mockRejectedValueOnce(new Error());
                    
                    const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel, tagService: mockTagService }, EntryTypes.GRATITUDE);
    
                    await expect(mongoService.addEntry(newEntry)).rejects.toThrow(Error);
                    jest.clearAllMocks();
                });
                it("should throw when trying to create an Entry with a tag that does not exist", async () => {
                    jest.spyOn(mockTagService, "doAllTagsExist").mockResolvedValueOnce(false)
                   
                    const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel, tagService: mockTagService }, EntryTypes.GRATITUDE);
                                     
                    await expect(mongoService.addEntry(newEntry)).rejects.toThrow(CustomErrors.INVALID_TAG);
                });
                it("should throw when trying to add an entry without the tag service", async () => {
                   
                    const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.GRATITUDE);
                                     
                    await expect(mongoService.addEntry(newEntry)).rejects.toThrow(CustomErrors.VOID_TAG_SERVICE);
                });
            })
        });

        describe("Journal", () => {
            const newEntry: NewEntry = newJournalEntry;
            describe("Positive Tests", () => {
                let entryService: MongoDBEntryService;

                const mockJournalEntryDocument = createEntryDocument(defaultJournalEntry);
                beforeAll(() => {
                    mockTagModel.exists = jest.fn().mockResolvedValue(true);

                    entryService = new MongoDBEntryService( { entryModel: mockEntryModel, tagService: mockTagService }, EntryTypes.JOURNAL);

                });
                it("should return a journal Entry document", async () => {
                    mockEntryModel.create = jest.fn().mockImplementationOnce(() => ({
                        populate: jest.fn().mockResolvedValueOnce({
                            ...mockJournalEntryDocument,
                            tags: [tagDocument],
                        }),
                        populated: jest.fn().mockReturnValue(true),
                    }));
                    
                    const response = await entryService.addEntry(newEntry);
                    
                    expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));
                });
                it("should return a journal Entry when attempting to add one without a tag", async () => {
                    mockEntryModel.create = jest.fn().mockImplementationOnce(() => ({
                        populate: jest.fn().mockResolvedValueOnce(mockJournalEntryDocument),
                        populated: jest.fn().mockReturnValue(true),
                    }));

                    const response  = await entryService.addEntry(newEntry);
                    
                    expect(response).toEqual(expect.objectContaining({
                        ...defaultEntryExpectation,
                        tags: []
                    }
                ));
    
                });
            })
            describe("Negative Tests", () => {
                it("should throw an error if unable to create", async () => {
                    mockEntryModel.create = jest.fn().mockRejectedValueOnce(new Error());
                    
                    const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel, tagService: mockTagService }, EntryTypes.JOURNAL);
                    
                    await expect(mongoService.addEntry(newEntry)).rejects.toThrow(Error);
                    jest.clearAllMocks();
                });
                it("should throw when trying to create an Entry with a tag that does not exist", async () => {
                    jest.spyOn(mockTagService, "doAllTagsExist").mockResolvedValueOnce(false)
                   
                    const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel, tagService: mockTagService }, EntryTypes.JOURNAL);
                                     
                    await expect(mongoService.addEntry(newEntry)).rejects.toThrow(CustomErrors.INVALID_TAG);
                });
                it("should throw when trying to add an entry without the tag service", async () => {
                   
                    const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.JOURNAL);
                                     
                    await expect(mongoService.addEntry(newEntry)).rejects.toThrow(CustomErrors.VOID_TAG_SERVICE);
                });
            })
        })
    });
    describe("Find by date", () => {
        describe("Mood", () => {
            it.each`
            date
            ${new Date("2020-01-01")}
            ${new Date("2021-05-06")}
            ${new Date("2022-08-12")}
            ${new Date("2021-11-26")}
            `("should return all entries for date $date", async ({date}: {date: Date}) => {
                const entry = createEntryDocument(defaultMoodEntry, {datetime: date, tags: [tagDocument]});
                mockEntryModel.find = jest.fn().mockImplementationOnce(() => ({
                    populate: jest.fn().mockResolvedValueOnce([{
                        ...entry,
                        populated: jest.fn().mockReturnValue(true),
                    }])
                }));                
                
                const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.MOOD);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toEqual(expect.arrayContaining([expect.objectContaining(defaultEntryExpectation)]));
                expect(response[0]).toHaveProperty("datetime", date);
                expect(response[0]).toHaveProperty("type", EntryTypes.MOOD);
        
            });
            it("should return an empty array if no entries are found", async () => {
                mockEntryModel.find = jest.fn().mockImplementationOnce(() => ({
                    populate: jest.fn().mockResolvedValueOnce([])
                }));                
                
                const date = new Date();
                const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.MOOD);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toStrictEqual([]);
    
            });
        });
        describe("Gratitude", () => {
            it.each`
            date
            ${new Date("2020-01-01")}
            ${new Date("2021-05-06")}
            ${new Date("2022-08-12")}
            ${new Date("2021-11-26")}
            `("should return all entries for date $date", async ({date}: {date: Date}) => {
                const entry = createEntryDocument(defaultGratitudeEntry, {datetime: date, tags: [tagDocument]});
                mockEntryModel.find = jest.fn().mockImplementationOnce(() => ({
                    populate: jest.fn().mockResolvedValueOnce([{
                        ...entry,
                        populated: jest.fn().mockReturnValue(true),
                    }])
                }));
                
                const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.GRATITUDE);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toEqual(expect.arrayContaining([expect.objectContaining(gratitudeEntryExpectation)]));
                expect(response[0]).toHaveProperty("datetime", date);
                expect(response[0]).toHaveProperty("type", EntryTypes.GRATITUDE);
        
            });
            it("should return an empty array if no entries are found", async () => {
                mockEntryModel.find = jest.fn().mockImplementationOnce(() => ({
                    populate: jest.fn().mockResolvedValueOnce([])
                }));
                
                const date = new Date();
                const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.GRATITUDE);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toStrictEqual([]);
    
            });
        });
        describe("Journal", () => {
            it.each`
            date
            ${new Date("2020-01-01")}
            ${new Date("2021-05-06")}
            ${new Date("2022-08-12")}
            ${new Date("2021-11-26")}
            `("should return all entries for date $date", async ({date}: {date: Date}) => {
                const entry = createEntryDocument(defaultJournalEntry, {datetime: date, tags: [tagDocument]});
                mockEntryModel.find = jest.fn().mockImplementationOnce(() => ({
                    populate: jest.fn().mockResolvedValueOnce([{
                        ...entry,
                        populated: jest.fn().mockReturnValue(true),
                    }])
                }));               
                
                const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.JOURNAL);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toEqual(expect.arrayContaining([expect.objectContaining(defaultEntryExpectation)]));
                expect(response[0]).toHaveProperty("datetime", date);
                expect(response[0]).toHaveProperty("type", EntryTypes.JOURNAL);
        
            });
            it("should return an empty array if no entries are found", async () => {
                mockEntryModel.find = jest.fn().mockImplementationOnce(() => ({
                    populate: jest.fn().mockResolvedValueOnce([])
                }));                  
                
                const date = new Date();
                const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.JOURNAL);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toStrictEqual([]);
    
            });
        });
    });
    describe("Update Entry", () => {
        describe("Mood", () => {
            describe("Positive tests", ()=> {
                it.each`
                update
                ${{datetime: new Date("2012-08-12")} }
                ${{quote: "I am the stone that the builder refused", tags: [new mongoose.Types.ObjectId()], subject: "Lorum Ipsem"}}
                ${{subject: "Moon River", datetime: new Date("2018-04-09"), tags: [new mongoose.Types.ObjectId()], content: "unsure" }}
                ${{content: "happy"}}
                ${{tags: [new mongoose.Types.ObjectId()]}}
                ${{quote: " "}}
                ${{subject: "Lorum Ipsum"}}
                ${{content: "tired", quote: "I am the stone that the builder refused"}}
                `("should update entry by with id with updates: $update", async ({update}) => {
                    update = update?.tags ? update : {...update, tags: [tagDocument]}
                    const entry = createEntryDocument(defaultMoodEntry, update);
                    
                    mockEntryModel.findById = jest.fn().mockResolvedValue(entry);

                    mockEntryModel.findByIdAndUpdate = jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockImplementation(() => (
                            {
                                orFail: jest.fn().mockResolvedValue(
                                    {
                                        ...entry,
                                        populated: jest.fn().mockResolvedValue(true),
                                    }
                                ),
                            })
                        ),
                    }));
                    
                    const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel, tagService: mockTagService }, EntryTypes.MOOD);
                    
                    const response =  await mongoService.updateEntry(entry._id.toString(), update);
                    
                    expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));
        
                    expect(response).toHaveProperty("type", EntryTypes.MOOD);
                });
            })
            describe("Negative tests", ()=> {
                it("should throw an error if no record exists with that id", async ()=> {
                    const update = {content: "tired", quote: "I am the stone that the builder refused"};
                    mockEntryModel.findById = jest.fn().mockRejectedValue("");
                    const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.MOOD);
                    
                    await expect(mongoService.updateEntry(new mongoose.Types.ObjectId().toString(), update)).rejects.toThrow(Error);
                    
                } )
    
            })
        });
        describe("Gratitude", () => {
            describe("Positive tests", ()=> {
                it.each`
                update
                ${{datetime: new Date("2012-08-12")} }
                ${{quote: "I am the stone that the builder refused", tags: [new mongoose.Types.ObjectId(), ], subject: "Lorum Ipsem"}}
                ${{subject: "Moon River", datetime: new Date("2018-04-09"), tags: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()], content: ["unsure"] }}
                ${{content: ["happy"]}}
                ${{tags: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId() ]}}
                ${{quote: " "}}
                ${{subject: "Lorum Ipsum"}}
                ${{content: ["tired"], quote: "I am the stone that the builder refused"}}
                `("should update entry by with id with updates: $update", async ({update}) => {

                    update = update?.tags ? update : {...update, tags: [tagDocument]}
                    const entry = createEntryDocument(defaultGratitudeEntry, update);

                    mockEntryModel.findById = jest.fn().mockResolvedValue(entry);
                    mockEntryModel.findById = jest.fn().mockResolvedValue(entry);

                    mockEntryModel.findByIdAndUpdate = jest.fn().mockImplementation(() => ({
                        populate: jest.fn().mockImplementation(() => (
                            {
                                orFail: jest.fn().mockResolvedValue(
                                    {
                                        ...entry,
                                        populated: jest.fn().mockResolvedValue(true),
                                    }
                                ),
                            })
                        ),
                    }));                    
                    const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel, tagService: mockTagService }, EntryTypes.GRATITUDE);
                    
                    const response =  await mongoService.updateEntry(entry._id.toString(), update);
                    
                    expect(response).toEqual(expect.objectContaining(gratitudeEntryExpectation));
        
                    expect(response).toHaveProperty("type", EntryTypes.GRATITUDE);
                    expect(response).toHaveProperty("id", entry._id.toString());

                });
            })
            describe("Negative tests", ()=> {
                it("should throw an error if no record exists with that id", async ()=> {
                    const update = {content: ["tired"], quote: "I am the stone that the builder refused"};
                    mockEntryModel.findById = jest.fn().mockRejectedValue("");
                    const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.GRATITUDE);
                    
                    await expect(mongoService.updateEntry(new mongoose.Types.ObjectId().toString(), update)).rejects.toThrow(Error);
                    
                } )
    
            })
        });
    });
    describe("Update Entries", () => {
        describe("Positive Tests", ()=> {
            it("should call updateMany and return true", async () => {
                const fieldName = "tags";
                const {tags: [tagDocumentId] } = mockMoodEntryDocument;

                const fieldToUpdateQuery = fieldIncludesElementQuery(fieldName,tagDocumentId?.toString());
                const updateQuery = removeArrayElementQuery(fieldName, [tagDocumentId?.toString()]);
                    
                mockEntryModel.updateMany = jest.fn().mockImplementation(() => ({
                    acknowledged: true
                })
                );
                
                const mongoService = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.MOOD);
                
                const response =  await mongoService.updateEntries(fieldToUpdateQuery, updateQuery);

                expect(mockEntryModel.updateMany).toHaveBeenCalledWith(fieldToUpdateQuery, updateQuery);
                expect(response).toStrictEqual(true);
            });

        });
            
    })
    describe("Delete Entry", () => {
        const mongooseID = new mongoose.Types.ObjectId().toString();
        describe("Mood", () => {    
            describe("Positive Tests", ()=> {
                it("should remove a mood entry and return it",  async () => {
                    const document =  createEntryDocument(defaultMoodEntry, {
                        tags: [tagDocument]
                    });
                    
                    jest.spyOn(mockEntryModel, "findById").mockResolvedValue(document);
                    mockEntryModel.findByIdAndDelete = jest.fn().mockImplementationOnce(() => ({
                        populate: jest.fn().mockImplementation(() => ({
                            orFail: jest.fn().mockResolvedValue({
                                ...document,
                                populated: jest.fn().mockResolvedValue(true)
                            })
                        })),
                    }));

        
                    const entryService  = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.MOOD);
                    const response = await entryService.deleteEntry(mongooseID);
        
                    expect(mockEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID)
                    expect(response).toEqual(expect.objectContaining(defaultEntryExpectation))
                })
            })
            describe("Negative Tests", () => {
                it("should throw a error if no document exists with that ID", async () => {
                    jest.spyOn(mockEntryModel, "findByIdAndDelete").mockResolvedValue(null);
                    jest.spyOn(mockEntryModel, "findById").mockResolvedValue(null);
            
                    const entryService  = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.MOOD);
                    await expect(entryService.deleteEntry(mongooseID)).rejects.toThrow(Error);
        
                    expect(mockEntryModel.findById).toHaveBeenCalledWith(mongooseID);
                })
                it("should throw and error if something goes wrong when trying to delete a document", async () => {
                    jest.spyOn(mockEntryModel, "findById").mockRejectedValue("");
        
                    const entryService  = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.MOOD);
                    await expect(entryService.deleteEntry(mongooseID)).rejects.toThrow(Error);
        
                    expect(mockEntryModel.findById).toHaveBeenCalledWith(mongooseID);
        
                })
            })
        })
        describe("Gratitude", () => {
            describe("Positive Tests", ()=> {
                it("should remove a gratitude entry and return it",  async () => {
                    const document =  createEntryDocument(defaultGratitudeEntry, {
                        tags: [tagDocument]

                    });
                    
                    jest.spyOn(mockEntryModel, "findById").mockResolvedValue(document);
                    mockEntryModel.findByIdAndDelete = jest.fn().mockImplementationOnce(() => ({
                        populate: jest.fn().mockImplementation(() => ({
                            orFail: jest.fn().mockResolvedValue({
                                ...document,
                                populated: jest.fn().mockResolvedValue(true)
                            })
                        })),
                    }));    
                    const entryService  = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.GRATITUDE);
                    const response = await entryService.deleteEntry(mongooseID);
    
                    expect(mockEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID);
                    expect(response).toEqual(expect.objectContaining(gratitudeEntryExpectation));
                });
            })
            describe("Negative Tests", () => {
                it("should throw a error if no document exists with that ID", async () => {                 
                    jest.spyOn(mockEntryModel, "findById").mockResolvedValue(null);
                    jest.spyOn(mockEntryModel, "findByIdAndDelete").mockResolvedValue(null);
            
                    const entryService  = new MongoDBEntryService( { entryModel: mockEntryModel }, EntryTypes.GRATITUDE);
                    await expect(entryService.deleteEntry(mongooseID)).rejects.toThrow(Error);
    
                    expect(mockEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID);
                });
            });
        })
            
    });
})
