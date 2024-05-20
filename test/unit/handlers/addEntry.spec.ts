import {Request} from 'express';
import moment from 'moment';

import { EntryTypes, NewEntryRequest } from '../../../src/types/entries';

import { defaultMoodEntry } from "../../data/moodEntry"
import handleAddEntry from "../../../src/handlers/addMoodEntry"
import AddMoodEntryUseCase from '../../../src/use cases/addMoodEntry';
import { createMoodEntry, createNewMoodEntry } from '../../data/helpers/moodEntry';
import mapNewEntry from '../../../src/mappers/newEntry';

describe("Add Mood entry helper", () => {
    afterEach( async()=>{
        await jest.clearAllMocks();
    })
    describe("Positive Tests", () =>{
        
        it.each`
        date            | entry
        ${"2020-01-01"} | ${createNewMoodEntry(defaultMoodEntry, {datetime: new Date("2020-01-01")})}
        ${"2021-05-06"} | ${createNewMoodEntry(defaultMoodEntry, {datetime: new Date("2021-05-06")})}
        ${"2022-08-12"} | ${createNewMoodEntry(defaultMoodEntry, {datetime: new Date("2022-08-12")})}
        ${"2023-11-26"} | ${createNewMoodEntry(defaultMoodEntry, {datetime: new Date("2023-11-26")})}
        `("should create a mood entry with date $date", async ({date, entry})=> {
            
            const request = { body: entry } as Request
    
            const executeSpy = jest.spyOn(AddMoodEntryUseCase.prototype, 'execute');
            executeSpy.mockResolvedValue(entry);
    
            const response = await handleAddEntry(request);
    
            expect(executeSpy).toHaveBeenCalledWith(entry);
            expect(response).toEqual(entry);
            expect(response).toHaveProperty("datetime", new Date(date));
            expect(response).toHaveProperty("type", EntryTypes.MOOD);
        });
        it("should create a mood entry when a request does not have a datetime", async()=>{
            const entry: NewEntryRequest = {
                subject: "test data",
                quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                tags: ["test"],
                content: "exhausted",
            };
            
            const  newEntryRequest = mapNewEntry(entry, {type:EntryTypes.MOOD, datetime: new Date(moment().format("YYYY-MM-DD HH:mm:ss"))})
            const entryExpectation = createMoodEntry({...defaultMoodEntry, ...newEntryRequest}); 
            const request = { body: entry } as Request
            
        
            const executeSpy = jest.spyOn(AddMoodEntryUseCase.prototype, 'execute');
            executeSpy.mockResolvedValue(entryExpectation);
    
            const response = await handleAddEntry(request);
    
            expect(executeSpy).toHaveBeenCalledWith(newEntryRequest);
            expect(response).toEqual(entryExpectation);
        });

    })
    describe("Negative Tests", ()=> {
        
        it("should throw an error if something goes wrong", async ()=>{
            const requestBody = createNewMoodEntry(defaultMoodEntry);  
    
            const request = { body: requestBody } as Request
    
            const executeSpy = jest.spyOn(AddMoodEntryUseCase.prototype, 'execute');
            executeSpy.mockRejectedValue(new Error());
    
            await expect(handleAddEntry(request)).rejects.toThrow(Error);
            expect(executeSpy).toHaveBeenCalledWith(requestBody);
    
        });
    })
})