import {Request} from 'express';
import { MoodEntry } from '../../../src/types/entries';
import { defaultMoodEntry } from "../../data/moodEntry"
import handleAddEntry from "../../../src/handlers/addEntry"
import AddMoodEntryUseCase from '../../../src/use cases/addMoodEntry';
import { createNewMoodEntry } from '../../data/helpers/moodEntry';

describe("Add Mood entry helper", () => {
    afterEach( async()=>{
        await jest.clearAllMocks();
    })
    describe("Positive Tests", () =>{
        
        it.each`
        date            | entry
        ${"2020-01-01"} | ${createNewMoodEntry({datetime: new Date("2020-01-01")})}
        ${"2021-05-06"} | ${createNewMoodEntry({datetime: new Date("2021-05-06")})}
        ${"2022-08-12"} | ${createNewMoodEntry({datetime: new Date("2022-08-12")})}
        ${"2023-11-26"} | ${createNewMoodEntry({datetime: new Date("2023-11-26")})}
        `("should create a mood entry with date $date", async ({date, entry})=> {
            
            const request = { body: entry } as Request
    
            const executeSpy = jest.spyOn(AddMoodEntryUseCase.prototype, 'execute');
            executeSpy.mockResolvedValue(entry);
    
            const response = await handleAddEntry(request);
    
            expect(executeSpy).toHaveBeenCalledWith(entry);
            expect(response).toEqual(entry);
            expect(response).toHaveProperty("datetime", new Date(date));
            expect(response).toHaveProperty("type", ["mood"]);
        });
        it("should create a mood entry when a request does not have a datetime", async()=>{
            const entry = {
                type: ["mood"],
                subject: "test data",
                quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                tags: ["test"],
                mood: "exhausted",
            } as MoodEntry;
            
            const entryExpectation = {...entry, datetime: new Date()}
            const request = { body: entry } as Request
    
            const executeSpy = jest.spyOn(AddMoodEntryUseCase.prototype, 'execute');
            executeSpy.mockResolvedValue(entryExpectation);
    
            const response = await handleAddEntry(request);
    
            expect(executeSpy).toHaveBeenCalledWith(entryExpectation);
            expect(response).toEqual(entryExpectation);
        });

    })
    describe("Negative Tests", ()=> {
        
        it("should throw an error if something goes wrong", async ()=>{
    
            const request = { body: defaultMoodEntry } as Request
    
            const executeSpy = jest.spyOn(AddMoodEntryUseCase.prototype, 'execute');
            executeSpy.mockRejectedValue(new Error());
    
            await expect(handleAddEntry(request)).rejects.toThrow(Error);
            expect(executeSpy).toHaveBeenCalledWith(defaultMoodEntry);
    
        });
    })
})