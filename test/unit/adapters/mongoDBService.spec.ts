const mockingoose = require("mockingoose");
import mongoose, { Model } from "mongoose";

import { EntryTypes, NewEntry } from "../../../src/types/entries";
import EntryDocument from "../../../src/services/mongoDB/types/document";
import { entryExpectation } from "../../assertions/entries";

import { defaultMoodEntry, mockMoodEntryDocument } from "../../data/moodEntry";
import MongoDBService from "../../../src/adapters/mongoDBService";
import { createMoodEntryDocument, createNewMoodEntry } from "../../data/helpers/moodEntry";
import entryModel from "../../../src/services/mongoDB/models/entry";

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
                
                expect(response).toEqual(expect.objectContaining(entryExpectation));
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
        /*
        describe.skip("Gratitude", () => {
            it("should return a mood Entry document", async () => {
                mockingoose(entryModel).toReturn(
                    mockGratitudeEntryDocument, 
                    "save"
                );
                const mockGratitudeEntry: NewEntry = createNewGratitudeEntry(); 
                const mongoService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
                const response = await mongoService.addEntry(mockGratitudeEntry);
                
                expect(response).toEqual(expect.objectContaining(entryExpectation));
            });
            
            it("should throw an error if unable to create", async () => {
                jest.mock("../../../src/services/mongoDB/models/entry");
                const mockGratitudeEntryModel = entryModel as jest.Mocked<Model<EntryDocument>>;
                mockGratitudeEntryModel.create = jest.fn().mockRejectedValueOnce(new Error());
                
                const mockGratitudeEntry = {
                    type: EntryTypes.GRATITUDE,
                    subject: "xo tour life",
                    tags: ["mental health"],
                    datetime: Date()()
                } as NewEntry;
                
                const mongoService = new MongoDBService(mockGratitudeEntryModel, EntryTypes.GRATITUDE);
                
                await expect(mongoService.addEntry(mockGratitudeEntry)).rejects.toThrow(Error);
                jest.clearAllMocks();
            });

        })
        */
    });
    describe("Find by date", () => {
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
            
            expect(response).toEqual(expect.arrayContaining([expect.objectContaining(entryExpectation)]));
            expect(response[0]).toHaveProperty("datetime", date);
            expect(response[0]).toHaveProperty("type", EntryTypes.MOOD);
    
        });
        it("should return an empty array if not entries are found", async () => {
            mockingoose(entryModel).toReturn([], "find");
            const date = new Date();
            const mongoService = new MongoDBService(entryModel, EntryTypes.MOOD);
    
            const response =  await mongoService.getEntryByDate(date);
            
            expect(response).toStrictEqual([]);

        })
        it("should throw an error if something goes wrong", async ()=> {
            mockingoose(entryModel).toReturn(new Error("something went wrong"), "find");
            const date = new Date();
            const mongoService = new MongoDBService(entryModel, EntryTypes.MOOD);
            
            await expect(mongoService.getEntryByDate(date)).rejects.toThrow(Error);
        })
    })
    describe("Update Entry", () => {
        jest.mock("../../../src/services/mongoDB/models/entry");
        const mockMoodEntryModel = entryModel as jest.Mocked<Model<EntryDocument>>;
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
            `("should return all entries for date $date", async ({update}) => {
                const entry = createMoodEntryDocument(defaultMoodEntry, update);
                mockMoodEntryModel.findByIdAndUpdate = jest.fn().mockResolvedValue(entry);
                const mongoService = new MongoDBService(mockMoodEntryModel, EntryTypes.MOOD);
                
                const response =  await mongoService.updateEntry(entry.id, update);
                
                expect(response).toEqual(expect.objectContaining(entryExpectation));
    
                expect(response).toHaveProperty("type", EntryTypes.MOOD);
            });
        })
        describe("Negative tests", ()=> {
            it("should throw an error if not record exists with that id", async ()=> {
                const update = {content: "tired" as "tired", quote: "I am the stone that the builder refused"};
                mockMoodEntryModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error());
                const mongoService = new MongoDBService(mockMoodEntryModel, EntryTypes.MOOD);
                
                await expect(mongoService.updateEntry(new mongoose.Types.ObjectId(), update)).rejects.toThrow(Error);
                
            } )

        })
    })
    describe("Delete entry", () => {
        jest.mock("../../../src/services/mongoDB/models/entry");
        const mockMoodEntryModel = entryModel as jest.Mocked<Model<EntryDocument>>;
        describe("Positive Tests", ()=> {
            it("should remove a mood entry and return it",  async () => {
                const document =  createMoodEntryDocument(defaultMoodEntry);
                const mongooseID = new mongoose.Types.ObjectId();
                
                jest.spyOn(mockMoodEntryModel, "findByIdAndDelete").mockResolvedValue(document);

                const entryService  = new MongoDBService(mockMoodEntryModel, EntryTypes.MOOD);
                const response = await entryService.deleteEntry(mongooseID);

                expect(mockMoodEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID)
                expect(response).toEqual(expect.objectContaining(entryExpectation))
            })
        })
        describe("Negative Tests", () => {
            it("should throw a error if no document exists with that ID", async () => {
                const mongooseID = new mongoose.Types.ObjectId();
                
                jest.spyOn(mockMoodEntryModel, "findByIdAndDelete").mockResolvedValue(null);
        
                const entryService  = new MongoDBService(mockMoodEntryModel, EntryTypes.MOOD);
                await expect(entryService.deleteEntry(mongooseID)).rejects.toThrow(Error);

                expect(mockMoodEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID);
            })
            it("should throw and error if something goes wrong when trying to delete a document", async () => {
                const mongooseID = new mongoose.Types.ObjectId();
                
                jest.spyOn(mockMoodEntryModel, "findByIdAndDelete").mockRejectedValue(new Error());

                const entryService  = new MongoDBService(mockMoodEntryModel, EntryTypes.MOOD);
                await expect(entryService.deleteEntry(mongooseID)).rejects.toThrow(Error);

                expect(mockMoodEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID);

            })
        })
    })
})
