import { Model } from "mongoose";
import MongoDBService from "../../../adapters/mongoDBService";
import { moodEntryModel } from "../../../integrations/mongoDB/models/entry";
import { MoodEntry } from "../../../types/entries";

jest.mock("../../../integrations/mongoDB/models/entry");

// Asserting the type of moodEntryModel as jest.Mocked<Model<MoodEntry>>
const mockMoodEntryModel = moodEntryModel as jest.Mocked<Model<MoodEntry>>;

describe("Add a mood entry", () => {
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
        const result = await mongoService.addMoodEntry(mockMoodEntry);
        
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


})
