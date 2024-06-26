import {Request} from "express";
import moment from "moment";

import { EntryTypes, NewEntryRequest } from "../../../../../src/types/entries";

import { defaultMoodEntry } from "../../../../data/moodEntry"
import handleAddEntry from "../../../../../src/handlers/entries/addEntry"
import AddEntryUseCase from "../../../../../src/use cases/entries/addEntry";
import { createEntry, createNewEntry } from "../../../../data/helpers/customEntry";
import mapNewEntry from "../../../../../src/mappers/newEntry";
import { defaultJournalEntry } from "../../../../data/journalEntry";
describe("Add Entry", () => {
    describe("Mood", () => {
        afterEach( async()=>{
            await jest.clearAllMocks();
        })
        describe("Positive Tests", () =>{
            
            it.each`
            date            | entry
            ${"2020-01-01"} | ${createNewEntry(defaultMoodEntry, {datetime: new Date("2020-01-01")})}
            ${"2021-05-06"} | ${createNewEntry(defaultMoodEntry, {datetime: new Date("2021-05-06")})}
            ${"2022-08-12"} | ${createNewEntry(defaultMoodEntry, {datetime: new Date("2022-08-12")})}
            ${"2023-11-26"} | ${createNewEntry(defaultMoodEntry, {datetime: new Date("2023-11-26")})}
            `("should create a mood entry with date $date", async ({date, entry})=> {
                
                const request = { body: entry } as Request
        
                const executeSpy = jest.spyOn(AddEntryUseCase.prototype, "execute");
                executeSpy.mockResolvedValue(entry);
        
                const response = await handleAddEntry(request, EntryTypes.MOOD);
        
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
                const entryExpectation = createEntry({...defaultMoodEntry, ...newEntryRequest}); 
                const request = { body: entry } as Request
                
            
                const executeSpy = jest.spyOn(AddEntryUseCase.prototype, "execute");
                executeSpy.mockResolvedValue(entryExpectation);
        
                const response = await handleAddEntry(request, EntryTypes.MOOD);
        
                expect(executeSpy).toHaveBeenCalledWith(newEntryRequest);
                expect(response).toEqual(entryExpectation);
            });
    
        })
        describe("Negative Tests", ()=> {
            
            it("should throw an error if something goes wrong", async ()=>{
                const requestBody = createNewEntry(defaultMoodEntry);  
        
                const request = { body: requestBody } as Request
        
                const executeSpy = jest.spyOn(AddEntryUseCase.prototype, "execute");
                executeSpy.mockRejectedValue(new Error());
        
                await expect(handleAddEntry(request, EntryTypes.MOOD)).rejects.toThrow(Error);
                expect(executeSpy).toHaveBeenCalledWith(requestBody);
        
            });
        })
    })
    describe("Journal", () => {
        afterEach( async()=>{
            await jest.clearAllMocks();
        })
        describe("Positive Tests", () =>{
            
            it.each`
            date            | entry
            ${"2020-01-01"} | ${createNewEntry(defaultJournalEntry, {datetime: new Date("2020-01-01")})}
            ${"2021-05-06"} | ${createNewEntry(defaultJournalEntry, {datetime: new Date("2021-05-06")})}
            ${"2022-08-12"} | ${createNewEntry(defaultJournalEntry, {datetime: new Date("2022-08-12")})}
            ${"2023-11-26"} | ${createNewEntry(defaultJournalEntry, {datetime: new Date("2023-11-26")})}
            `("should create a journal entry with date $date", async ({date, entry})=> {
                
                const request = { body: entry } as Request
        
                const executeSpy = jest.spyOn(AddEntryUseCase.prototype, "execute");
                executeSpy.mockResolvedValue(entry);
        
                const response = await handleAddEntry(request, EntryTypes.JOURNAL);
        
                expect(executeSpy).toHaveBeenCalledWith(entry);
                expect(response).toEqual(entry);
                expect(response).toHaveProperty("datetime", new Date(date));
                expect(response).toHaveProperty("type", EntryTypes.JOURNAL);
            });
            it("should create a journal entry when a request does not have a datetime", async()=>{
                const entry: NewEntryRequest = {
                    subject: "test data",
                    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                    tags: ["test"],
                    content: "exhausted",
                };
                
                const  newEntryRequest = mapNewEntry(entry, {type:EntryTypes.JOURNAL, datetime: new Date(moment().format("YYYY-MM-DD HH:mm:ss"))})
                const entryExpectation = createEntry({...defaultJournalEntry, ...newEntryRequest}); 
                const request = { body: entry } as Request
                
            
                const executeSpy = jest.spyOn(AddEntryUseCase.prototype, "execute");
                executeSpy.mockResolvedValue(entryExpectation);
        
                const response = await handleAddEntry(request, EntryTypes.JOURNAL);
        
                expect(executeSpy).toHaveBeenCalledWith(newEntryRequest);
                expect(response).toEqual(entryExpectation);
            });
    
        })
        describe("Negative Tests", ()=> {
            
            it("should throw an error if something goes wrong", async ()=>{
                const requestBody = createNewEntry(defaultJournalEntry);  
        
                const request = { body: requestBody } as Request
        
                const executeSpy = jest.spyOn(AddEntryUseCase.prototype, "execute");
                executeSpy.mockRejectedValue(new Error());
        
                await expect(handleAddEntry(request, EntryTypes.JOURNAL)).rejects.toThrow(Error);
                expect(executeSpy).toHaveBeenCalledWith(requestBody);
        
            });
        })
    })
});