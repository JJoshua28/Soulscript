import { Model } from "mongoose";
import { createMoodEntry } from "../../data/moodEntry";
import MongoDBService from "../../../src/adapters/mongoDBService";
import { moodEntryModel } from "../../../src/services/mongoDB/models/entry";
import { MoodEntry } from "../../../src/types/entries";

jest.mock("../../../src/services/mongoDB/models/entry");

// Asserting the type of moodEntryModel as jest.Mocked<Model<MoodEntry>>
const mockMoodEntryModel = moodEntryModel as jest.Mocked<Model<MoodEntry>>;

describe("Mood Entry", ()=> {
    
    describe("Add entry", () => {
        it("should return a mood Entry document", async () => {
            const mockMoodEntry: MoodEntry = {
                type: ["mood"],
                subject: "test data",
                quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                tags: ["test"],
                mood: "exhausted",
                datetime: new Date()
            }
            const mongoService = new MongoDBService();
            await mongoService.addMoodEntry(mockMoodEntry);
            
            expect(mockMoodEntryModel.create).toHaveBeenCalledWith(mockMoodEntry);
        });
        
        it("should throw an error if unable to create", async () => {
        const mockMoodEntry = {
            type: ["mood"],
            subject: "bored with life",
            tags: ["mental health"],
            datetime: new Date()
        } as MoodEntry;
        mockMoodEntryModel.create.mockRejectedValueOnce(new Error());
    
        const mongoService = new MongoDBService();
        await expect(mongoService.addMoodEntry(mockMoodEntry)).rejects.toThrow(Error);
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
            const entry = createMoodEntry({datetime: date});
            mockMoodEntryModel.find.mockResolvedValue([entry]);
            const mongoService = new MongoDBService();
    
            const response =  await mongoService.getMoodEntryByDate(date);
            
            expect(mockMoodEntryModel.find).toHaveBeenCalled();
            expect(response).toEqual(expect.arrayContaining([entry]));
            expect(response[0]).toHaveProperty("datetime", date);
            expect(response[0]).toHaveProperty("type", ["mood"]);
    
        });
        it("should return an empty array if not entries are found", async () => {
            mockMoodEntryModel.find.mockResolvedValue([]);
            const date = new Date();
            const mongoService = new MongoDBService();
    
            const response =  await mongoService.getMoodEntryByDate(date);
            
            expect(mockMoodEntryModel.find).toHaveBeenCalled();
            expect(response).toStrictEqual([]);

        })
        it("should throw an error if something goes wrong", async ()=> {
            mockMoodEntryModel.find.mockRejectedValue(new Error("something went wrong"));
            const date = new Date();
            const mongoService = new MongoDBService();
    
            await expect(mongoService.getMoodEntryByDate(date)).rejects.toThrow(Error);
            expect(mockMoodEntryModel.find).toHaveBeenCalled();

        })
    })
})
