import mongoose, { Model } from "mongoose";
import moment from "moment";

import { EntryTypes, NewEntry } from "../../../src/types/entries";
import EntryDocument from "../../../src/services/mongoDB/types/document";
import { defaultEntryExpectation, gratitudeEntryExpectation } from "../../assertions/entries";

import { defaultMoodEntry, mockMoodEntryDocument } from "../../data/moodEntry";
import MongoDBService from "../../../src/adapters/mongoDBService";
import { createEntryDocument, createNewEntry } from "../../data/helpers/customEntry";
import entryModel from "../../../src/services/mongoDB/models/entry";
import { defaultGratitudeEntry, mockGratitudeEntryDocument } from "../../data/gratitudeEntry";
import { defaultJournalEntry } from "../../data/journalEntry";

jest.mock("../../../src/services/mongoDB/models/entry");
const mockEntryModel = entryModel as jest.Mocked<Model<EntryDocument>>;


describe("Entry", ()=> {
    describe("Add", () => {
        describe("Mood", () => {
            it("should return a mood Entry document", async () => {
                mockEntryModel.create = jest.fn().mockResolvedValueOnce(mockMoodEntryDocument);
               
                const mockMoodEntry: NewEntry = createNewEntry(defaultMoodEntry);
                const mongoService = new MongoDBService(mockEntryModel, EntryTypes.MOOD);
                const response = await mongoService.addEntry(mockMoodEntry);
                
                expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));

            });
            
            it("should throw an error if unable to create", async () => {
                mockEntryModel.create = jest.fn().mockRejectedValueOnce(new Error());
                
                const mockMoodEntry = {
                    type: EntryTypes.MOOD,
                    subject: "xo tour life",
                    tags: ["mental health"],
                    datetime: new Date()
                } as NewEntry;
                
                const mongoService = new MongoDBService(mockEntryModel, EntryTypes.MOOD);
                
                await expect(mongoService.addEntry(mockMoodEntry)).rejects.toThrow(Error);
            });
        });
        
        describe("Gratitude", () => {
            it("should return a gratitude Entry document", async () => {
                mockEntryModel.create = jest.fn().mockResolvedValueOnce(mockGratitudeEntryDocument);
                
                const mockGratitudeEntry: NewEntry = createNewEntry(defaultGratitudeEntry); 
                const mongoService = new MongoDBService(mockEntryModel, EntryTypes.GRATITUDE);
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

        });

        describe("Journal", () => {
            it("should return a journal Entry document", async () => {
                const entryResult = createEntryDocument(defaultJournalEntry) as EntryDocument;
                
                mockEntryModel.create = jest.fn().mockResolvedValueOnce(entryResult);
                const mockJournalEntry: NewEntry = createNewEntry(defaultJournalEntry);

                const mongoService = new MongoDBService(mockEntryModel, EntryTypes.JOURNAL);
                const response = await mongoService.addEntry(mockJournalEntry);
                
                expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));
            });
            
            it("should throw an error if unable to create", async () => {
                mockEntryModel.create = jest.fn().mockRejectedValueOnce(new Error());
                
                const mockMoodEntry = {
                    type: EntryTypes.JOURNAL,
                    subject: "xo tour life",
                    tags: ["mental health"],
                    datetime: new Date()
                } as NewEntry;
                
                const mongoService = new MongoDBService(mockEntryModel, EntryTypes.JOURNAL);
                
                await expect(mongoService.addEntry(mockMoodEntry)).rejects.toThrow(Error);
                jest.clearAllMocks();
            });
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
                const entry = createEntryDocument(defaultMoodEntry, {datetime: date});
                mockEntryModel.find = jest.fn().mockResolvedValueOnce([entry]);
                const mongoService = new MongoDBService(mockEntryModel, EntryTypes.MOOD);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toEqual(expect.arrayContaining([expect.objectContaining(defaultEntryExpectation)]));
                expect(response[0]).toHaveProperty("datetime", date);
                expect(response[0]).toHaveProperty("type", EntryTypes.MOOD);
        
            });
            it("should return an empty array if no entries are found", async () => {
                mockEntryModel.find = jest.fn().mockResolvedValueOnce([]);
                const date = new Date();
                const mongoService = new MongoDBService(mockEntryModel, EntryTypes.MOOD);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toStrictEqual([]);
    
            });
            it("should throw an error if something goes wrong", async ()=> {
                mockEntryModel.find = jest.fn().mockRejectedValueOnce(new Error("something went wrong"));

                const date = new Date();
                const mongoService = new MongoDBService(mockEntryModel, EntryTypes.MOOD);
                
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
                const entry = createEntryDocument(defaultGratitudeEntry, {datetime: date});
                mockEntryModel.find = jest.fn().mockResolvedValueOnce([entry]);
                
                const mongoService = new MongoDBService(mockEntryModel, EntryTypes.GRATITUDE);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toEqual(expect.arrayContaining([expect.objectContaining(gratitudeEntryExpectation)]));
                expect(response[0]).toHaveProperty("datetime", date);
                expect(response[0]).toHaveProperty("type", EntryTypes.GRATITUDE);
        
            });
            it("should return an empty array if no entries are found", async () => {
                mockEntryModel.find = jest.fn().mockResolvedValueOnce([]);
                
                const date = new Date();
                const mongoService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
        
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
                const entry = createEntryDocument(defaultJournalEntry, {datetime: date});
                mockEntryModel.find = jest.fn().mockResolvedValueOnce([entry]);
                const mongoService = new MongoDBService(mockEntryModel, EntryTypes.JOURNAL);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toEqual(expect.arrayContaining([expect.objectContaining(defaultEntryExpectation)]));
                expect(response[0]).toHaveProperty("datetime", date);
                expect(response[0]).toHaveProperty("type", EntryTypes.JOURNAL);
        
            });
            it("should return an empty array if no entries are found", async () => {
                mockEntryModel.find = jest.fn().mockResolvedValueOnce([]);
                const date = new Date();
                const mongoService = new MongoDBService(mockEntryModel, EntryTypes.JOURNAL);
        
                const response =  await mongoService.getEntryByDate(date);
                
                expect(response).toStrictEqual([]);
    
            });
            it("should throw an error if something goes wrong", async ()=> {
                mockEntryModel.find = jest.fn().mockRejectedValueOnce(new Error("something went wrong"));

                const date = new Date();
                const mongoService = new MongoDBService(mockEntryModel, EntryTypes.JOURNAL);
                
                await expect(mongoService.getEntryByDate(date)).rejects.toThrow(Error);
            });
        });
    });
    describe("Update Entry", () => {
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
                    const entry = createEntryDocument(defaultMoodEntry, update);
                    mockEntryModel.findByIdAndUpdate = jest.fn().mockResolvedValue(entry);
                    const mongoService = new MongoDBService(mockEntryModel, EntryTypes.MOOD);
                    
                    const response =  await mongoService.updateEntry(entry.id, update);
                    
                    expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));
        
                    expect(response).toHaveProperty("type", EntryTypes.MOOD);
                });
            })
            describe("Negative tests", ()=> {
                it("should throw an error if no record exists with that id", async ()=> {
                    const update = {content: "tired" as "tired", quote: "I am the stone that the builder refused"};
                    mockEntryModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error());
                    const mongoService = new MongoDBService(mockEntryModel, EntryTypes.MOOD);
                    
                    await expect(mongoService.updateEntry(new mongoose.Types.ObjectId().toString(), update)).rejects.toThrow(Error);
                    
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
                    const entry = createEntryDocument(defaultGratitudeEntry, update);
                    mockEntryModel.findByIdAndUpdate = jest.fn().mockResolvedValue(entry);
                    const mongoService = new MongoDBService(mockEntryModel, EntryTypes.GRATITUDE);
                    
                    const response =  await mongoService.updateEntry(entry._id.toString(), update);
                    
                    expect(response).toEqual(expect.objectContaining(gratitudeEntryExpectation));
        
                    expect(response).toHaveProperty("type", EntryTypes.GRATITUDE);
                    expect(response).toHaveProperty("id", entry._id.toString());

                });
            })
            describe("Negative tests", ()=> {
                it("should throw an error if no record exists with that id", async ()=> {
                    const update = {content: ["tired"], quote: "I am the stone that the builder refused"};
                    mockEntryModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error());
                    const mongoService = new MongoDBService(mockEntryModel, EntryTypes.GRATITUDE);
                    
                    await expect(mongoService.updateEntry(new mongoose.Types.ObjectId().toString(), update)).rejects.toThrow(Error);
                    
                } )
    
            })
        });
    })
    describe("Delete entry", () => {
        jest.mock("../../../src/services/mongoDB/models/entry");
        const mockGratitudeEntryModel = entryModel as jest.Mocked<Model<EntryDocument>>;
        const mongooseID = new mongoose.Types.ObjectId().toString();
        describe("Mood", () => {    
            describe("Positive Tests", ()=> {
                it("should remove a mood entry and return it",  async () => {
                    const document =  createEntryDocument(defaultMoodEntry);
                    
                    jest.spyOn(mockGratitudeEntryModel, "findByIdAndDelete").mockResolvedValue(document);
        
                    const entryService  = new MongoDBService(mockGratitudeEntryModel, EntryTypes.MOOD);
                    const response = await entryService.deleteEntry(mongooseID);
        
                    expect(mockGratitudeEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID)
                    expect(response).toEqual(expect.objectContaining(defaultEntryExpectation))
                })
            })
            describe("Negative Tests", () => {
                it("should throw a error if no document exists with that ID", async () => {
                    jest.spyOn(mockGratitudeEntryModel, "findByIdAndDelete").mockResolvedValue(null);
            
                    const entryService  = new MongoDBService(mockGratitudeEntryModel, EntryTypes.MOOD);
                    await expect(entryService.deleteEntry(mongooseID)).rejects.toThrow(Error);
        
                    expect(mockGratitudeEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID);
                })
                it("should throw and error if something goes wrong when trying to delete a document", async () => {
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
                    const document =  createEntryDocument(defaultGratitudeEntry);
                    
                    jest.spyOn(mockGratitudeEntryModel, "findByIdAndDelete").mockResolvedValue(document);
    
                    const entryService  = new MongoDBService(mockGratitudeEntryModel, EntryTypes.GRATITUDE);
                    const response = await entryService.deleteEntry(mongooseID);
    
                    expect(mockGratitudeEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID);
                    expect(response).toEqual(expect.objectContaining(gratitudeEntryExpectation));
                });
            })
            describe("Negative Tests", () => {
                it("should throw a error if no document exists with that ID", async () => {                 
                    jest.spyOn(mockGratitudeEntryModel, "findByIdAndDelete").mockResolvedValue(null);
            
                    const entryService  = new MongoDBService(mockGratitudeEntryModel, EntryTypes.GRATITUDE);
                    await expect(entryService.deleteEntry(mongooseID)).rejects.toThrow(Error);
    
                    expect(mockGratitudeEntryModel.findByIdAndDelete).toHaveBeenCalledWith(mongooseID);
                });
            });
        })
            
    })
})
