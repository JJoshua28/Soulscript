const mockingoose = require("mockingoose");
import { Model } from "mongoose";

import { NewMoodEntry } from "../../../src/types/entries";
import { mockMoodEntryDocument, moodEntryExpectation } from "../../data/moodEntry";
import MongoDBService from "../../../src/adapters/mongoDBService";
import { moodEntryModel } from "../../../src/services/mongoDB/models/entry";
import { MoodEntryDocument } from "../../../src/services/mongoDB/types/document";
import { createMoodEntryDocument, createNewMoodEntry } from "../../data/helpers/moodEntry";

describe("Mood Entry", ()=> {
    describe("Add entry", () => {
        it("should return a mood Entry document", async () => {
            mockingoose(moodEntryModel).toReturn(
                mockMoodEntryDocument, 
                "save"
            );
            //jest.spyOn(mockMoodEntryModel.prototype, "create").mockResolvedValue(mockMoodEntryDocument)
            const mockMoodEntry: NewMoodEntry = createNewMoodEntry();
            const mongoService = new MongoDBService();
            const response = await mongoService.addMoodEntry(mockMoodEntry);
            
            expect(response).toEqual(expect.objectContaining(moodEntryExpectation));
        });
        
        it("should throw an error if unable to create", async () => {
            jest.mock("../../../src/services/mongoDB/models/entry");
            const mockMoodEntryModel = moodEntryModel as jest.Mocked<Model<MoodEntryDocument>>;
            mockMoodEntryModel.create = jest.fn().mockRejectedValueOnce(new Error());
            
            const mockMoodEntry = {
                type: ["mood"],
                subject: "xo tour life",
                tags: ["mental health"],
                datetime: new Date()
            } as NewMoodEntry;
            
            const mongoService = new MongoDBService();
            
            await expect(mongoService.addMoodEntry(mockMoodEntry)).rejects.toThrow(Error);
            jest.clearAllMocks();
        });

        
    
    });
    describe("Find entry by date", () => {
        it.each`
        date
        ${new Date("2020-01-01")}
        ${new Date("2021-05-06")}
        ${new Date("2022-08-12")}
        ${new Date("2021-11-26")}
        `("should return all entries for date $date", async ({date}) => {
            const entry = createMoodEntryDocument({datetime: date});
            mockingoose(moodEntryModel).toReturn([entry], "find");
            const mongoService = new MongoDBService();
    
            const response =  await mongoService.getMoodEntryByDate(date);
            
            expect(response).toEqual(expect.arrayContaining([expect.objectContaining(moodEntryExpectation)]));
            expect(response[0]).toHaveProperty("datetime", date);
            expect(response[0]).toHaveProperty("type", ["mood"]);
    
        });
        it("should return an empty array if not entries are found", async () => {
            mockingoose(moodEntryModel).toReturn([], "find");
            const date = new Date();
            const mongoService = new MongoDBService();
    
            const response =  await mongoService.getMoodEntryByDate(date);
            
            expect(response).toStrictEqual([]);

        })
        it("should throw an error if something goes wrong", async ()=> {
            mockingoose(moodEntryModel).toReturn(new Error("something went wrong"), "find");
            const date = new Date();
            const mongoService = new MongoDBService();
    
            await expect(mongoService.getMoodEntryByDate(date)).rejects.toThrow(Error);
        })
    })
})
