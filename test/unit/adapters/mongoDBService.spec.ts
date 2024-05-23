const mockingoose = require("mockingoose");
import mongoose, { Model } from "mongoose";
import moment from "moment";

import { EntryTypes, NewEntry } from "../../../src/types/entries";
import EntryDocument from "../../../src/services/mongoDB/types/document";
import { defaultEntryExpectation, gratitudeEntryExpectation } from "../../assertions/entries";

import { defaultMoodEntry, mockMoodEntryDocument } from "../../data/moodEntry";
import MongoDBService from "../../../src/adapters/mongoDBService";
import { createMoodEntryDocument, createNewMoodEntry } from "../../data/helpers/moodEntry";
import entryModel from "../../../src/services/mongoDB/models/entry";
import { defaultGratitudeEntry, mockGratitudeEntryDocument } from "../../data/gratitudeEntry";
import { createGratitudeEntryDocument, createNewGratitudeEntry } from "../../data/helpers/gratitudeEntry";

describe("Entry", ()=> {
    beforeEach(() => {
        jest.restoreAllMocks();
    });
    describe("Add", () => {
        describe("Mood", () => {
            it("should return a mood Entry document", async () => {
                mockingoose(entryModel).toReturn(
                    mockMoodEntryDocument, 
                    "save"
                );
                const mockMoodEntry: NewEntry = createNewMoodEntry(defaultMoodEntry);
                const mongoService = new MongoDBService(entryModel, EntryTypes.MOOD);
                const response = await mongoService.addEntry(mockMoodEntry);
                
                expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));
            });
            
            it("should throw an error if unable to create", async () => {
                jest.mock("../../../src/services/mongoDB/models/entry");
                const mockMoodEntryModel = entryModel as jest.Mocked<Model<EntryDocument>>;
                mockMoodEntryModel.create = jest.fn().mockRejectedValueOnce(new Error());
                
                const mockMoodEntry = {
                    type: EntryTypes.MOOD,
                    subject: "xo tour life",
                    tags: ["mental health"],
                    datetime: new Date()
                } as NewEntry;
                
                const mongoService = new MongoDBService(mockMoodEntryModel, EntryTypes.MOOD);
                
                await expect(mongoService.addEntry(mockMoodEntry)).rejects.toThrow(Error);
                jest.clearAllMocks();
            });
        });
        
        describe("Gratitude", () => {
            beforeEach( async () => {
                await mockingoose.resetAll();
            });
            it("should return a gratitude Entry document", async () => {
                jest.mock("../../../src/services/mongoDB/models/entry");
                const mockGratitudeEntryModel = entryModel as jest.Mocked<Model<EntryDocument>>;
                mockGratitudeEntryModel.create = jest.fn().mockResolvedValue(mockGratitudeEntryDocument);
                
                const mockGratitudeEntry: NewEntry = createNewGratitudeEntry(defaultGratitudeEntry); 
                const mongoService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
                const response = await mongoService.addEntry(mockGratitudeEntry);
                
                
                expect(response).toEqual(expect.objectContaining(gratitudeEntryExpectation));
            });
            
            it("should throw an error if unable to create", async () => {
                jest.mock("../../../src/services/mongoDB/models/entry");
                const mockGratitudeEntryModel = entryModel as jest.Mocked<Model<EntryDocument>>;
                mockGratitudeEntryModel.create = jest.fn().mockRejectedValueOnce(new Error());
                
                const mockGratitudeEntry = {
                    type: EntryTypes.GRATITUDE,
                    subject: "xo tour life",
                    tags: ["mental health"],
                    datetime: new Date(moment().startOf("day").toISOString())
                } as NewEntry;
                
                const mongoService = new MongoDBService(mockGratitudeEntryModel, EntryTypes.GRATITUDE);
                
                await expect(mongoService.addEntry(mockGratitudeEntry)).rejects.toThrow(Error);
                jest.clearAllMocks();
            });

        })
    });
    describe("Find by date", () => {
       afterEach( async () => {
            await mockingoose.resetAll();
       })
        describe("Mood", () => {
            it.each`
            date
            ${new Date("2020-01-01")}
            ${new Date("2021-05-06")}
            ${new Date("2022-08-12")}
            ${new Date("2021-11-26")}
            `("should return all entries for date $date", async ({date}: {date: Date}) => {
                const entry = createMoodEntryDocument(defaultMoodEntry, {datetime: date});
                mockingoose(entryModel).toReturn([entry], "find");
                const mongoService = new MongoDBService(entryModel, EntryTypes.MOOD);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toEqual(expect.arrayContaining([expect.objectContaining(defaultEntryExpectation)]));
                expect(response[0]).toHaveProperty("datetime", date);
                expect(response[0]).toHaveProperty("type", EntryTypes.MOOD);
        
            });
            it("should return an empty array if no entries are found", async () => {
                mockingoose(entryModel).toReturn([], "find");
                const date = new Date();
                const mongoService = new MongoDBService(entryModel, EntryTypes.MOOD);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toStrictEqual([]);
    
            });
            it("should throw an error if something goes wrong", async ()=> {
                mockingoose(entryModel).toReturn(new Error("something went wrong"), "find");
                const date = new Date();
                const mongoService = new MongoDBService(entryModel, EntryTypes.MOOD);
                
                await expect(mongoService.getEntryByDate(date)).rejects.toThrow(Error);
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
                const entry = createGratitudeEntryDocument(defaultGratitudeEntry, {datetime: date});
                mockingoose(entryModel).toReturn([entry], "find");
                const mongoService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toEqual(expect.arrayContaining([expect.objectContaining(gratitudeEntryExpectation)]));
                expect(response[0]).toHaveProperty("datetime", date);
                expect(response[0]).toHaveProperty("type", EntryTypes.GRATITUDE);
        
            });
            it("should return an empty array if no entries are found", async () => {
                mockingoose(entryModel).toReturn([], "find");
                const date = new Date();
                const mongoService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toStrictEqual([]);
    
            });
        });
    });
    describe("Update Entry", () => {
        jest.mock("../../../src/services/mongoDB/models/entry");
        const mockMoodEntryModel = entryModel as jest.Mocked<Model<EntryDocument>>;
        describe("Mood", () => {
            describe("Positive tests", ()=> {
                it.each`
                update
                ${{datetime: new Date("2012-08-12")} }
                ${{quote: "I am the stone that the builder refused", tags: ["music"], subject: "Lorum Ipsem"}}
                ${{subject: "Moon River", datetime: new Date("2018-04-09"), tags: ["Lorum Ipsem"], content: "unsure" }}
                ${{content: "happy"}}
                ${{tags: ["mental health", "sports", "boondocks"]}}
                ${{quote: " "}}
                ${{subject: "Lorum Ipsum"}}
                ${{content: "tired", quote: "I am the stone that the builder refused"}}
                `("should update entry by with id with updates: $update", async ({update}) => {
                    const entry = createMoodEntryDocument(defaultMoodEntry, update);
                    mockMoodEntryModel.findByIdAndUpdate = jest.fn().mockResolvedValue(entry);
                    const mongoService = new MongoDBService(mockMoodEntryModel, EntryTypes.MOOD);
                    
                    const response =  await mongoService.updateEntry(entry.id, update);
                    
                    expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));
        
                    expect(response).toHaveProperty("type", EntryTypes.MOOD);
                });
            })
            describe("Negative tests", ()=> {
                it("should throw an error if no record exists with that id", async ()=> {
                    const update = {content: "tired" as "tired", quote: "I am the stone that the builder refused"};
                    mockMoodEntryModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error());
                    const mongoService = new MongoDBService(mockMoodEntryModel, EntryTypes.MOOD);
                    
                    await expect(mongoService.updateEntry(new mongoose.Types.ObjectId(), update)).rejects.toThrow(Error);
                    
                } )
    
            })
        });
        describe("Gratitude", () => {
            describe("Positive tests", ()=> {
                it.each`
                update
                ${{datetime: new Date("2012-08-12")} }
                ${{quote: "I am the stone that the builder refused", tags: ["music"], subject: "Lorum Ipsem"}}
                ${{subject: "Moon River", datetime: new Date("2018-04-09"), tags: ["Lorum Ipsem"], content: ["unsure"] }}
                ${{content: ["happy"]}}
                ${{tags: ["mental health", "sports", "boondocks"]}}
                ${{quote: " "}}
                ${{subject: "Lorum Ipsum"}}
                ${{content: ["tired"], quote: "I am the stone that the builder refused"}}
                `("should update entry by with id with updates: $update", async ({update}) => {
                    const entry = createGratitudeEntryDocument(defaultGratitudeEntry, update);
                    mockMoodEntryModel.findByIdAndUpdate = jest.fn().mockResolvedValue(entry);
                    const mongoService = new MongoDBService(mockMoodEntryModel, EntryTypes.GRATITUDE);
                    
                    const response =  await mongoService.updateEntry(entry._id, update);
                    
                    expect(response).toEqual(expect.objectContaining(gratitudeEntryExpectation));
        
                    expect(response).toHaveProperty("type", EntryTypes.GRATITUDE);
                    expect(response).toHaveProperty("id", entry._id);

                });
            })
            describe("Negative tests", ()=> {
                it("should throw an error if no record exists with that id", async ()=> {
                    const update = {content: ["tired"], quote: "I am the stone that the builder refused"};
                    mockMoodEntryModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error());
                    const mongoService = new MongoDBService(mockMoodEntryModel, EntryTypes.GRATITUDE);
                    
                    await expect(mongoService.updateEntry(new mongoose.Types.ObjectId(), update)).rejects.toThrow(Error);
                    
                } )
    
            })
        });
    })
    describe("Delete entry", () => {
        jest.mock("../../../src/services/mongoDB/models/entry");
        const mockGratitudeEntryModel = entryModel as jest.Mocked<Model<EntryDocument>>;
        describe("Mood", () => {    
            describe("Positive Tests", ()=> {
                it("should remove a mood entry and return it",  async () => {
                    const document =  createMoodEntryDocument(defaultMoodEntry);
                    const mongooseID = new mongoose.Types.ObjectId();
                    
                    jest.spyOn(mockGratitudeEntryModel, "findByIdAndDelete").mockResolvedValue(document);
        
                    const entryService  = new MongoDBService(mockGratitudeEntryModel, EntryTypes.MOOD);
                    const response = await entryService.deleteEntry(mongooseID);
        
                    expect(mockGratitudeEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID)
                    expect(response).toEqual(expect.objectContaining(defaultEntryExpectation))
                })
            })
            describe("Negative Tests", () => {
                it("should throw a error if no document exists with that ID", async () => {
                    const mongooseID = new mongoose.Types.ObjectId();
                    
                    jest.spyOn(mockGratitudeEntryModel, "findByIdAndDelete").mockResolvedValue(null);
            
                    const entryService  = new MongoDBService(mockGratitudeEntryModel, EntryTypes.MOOD);
                    await expect(entryService.deleteEntry(mongooseID)).rejects.toThrow(Error);
        
                    expect(mockGratitudeEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID);
                })
                it("should throw and error if something goes wrong when trying to delete a document", async () => {
                    const mongooseID = new mongoose.Types.ObjectId();
                    
                    jest.spyOn(mockGratitudeEntryModel, "findByIdAndDelete").mockRejectedValue(new Error());
        
                    const entryService  = new MongoDBService(mockGratitudeEntryModel, EntryTypes.MOOD);
                    await expect(entryService.deleteEntry(mongooseID)).rejects.toThrow(Error);
        
                    expect(mockGratitudeEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID);
        
                })
            })
        })
        describe("Gratitude", () => {
            describe("Positive Tests", ()=> {
                it("should remove a gratitude entry and return it",  async () => {
                    const document =  createGratitudeEntryDocument(defaultGratitudeEntry);
                    const mongooseID = new mongoose.Types.ObjectId();
                    
                    jest.spyOn(mockGratitudeEntryModel, "findByIdAndDelete").mockResolvedValue(document);
    
                    const entryService  = new MongoDBService(mockGratitudeEntryModel, EntryTypes.GRATITUDE);
                    const response = await entryService.deleteEntry(mongooseID);
    
                    expect(mockGratitudeEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID);
                    expect(response).toEqual(expect.objectContaining(gratitudeEntryExpectation));
                });
            })
            describe("Negative Tests", () => {
                it("should throw a error if no document exists with that ID", async () => {
                    const mongooseID = new mongoose.Types.ObjectId();
                    
                    jest.spyOn(mockGratitudeEntryModel, "findByIdAndDelete").mockResolvedValue(null);
            
                    const entryService  = new MongoDBService(mockGratitudeEntryModel, EntryTypes.GRATITUDE);
                    await expect(entryService.deleteEntry(mongooseID)).rejects.toThrow(Error);
    
                    expect(mockGratitudeEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID);
                });
            });
        })
            
    })
})
