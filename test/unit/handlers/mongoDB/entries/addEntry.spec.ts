import {Request} from "express";
import mongoose from "mongoose";

import { EntryTypes, NewEntry } from "../../../../../src/types/entries";

import { defaultMoodEntry, newMoodEntry } from "../../../../data/moodEntry"
import handleAddEntry from "../../../../../src/handlers/entries/addEntry"
import AddEntryUseCase from "../../../../../src/use cases/entries/addEntry";
import { defaultJournalEntry, newJournalEntry } from "../../../../data/journalEntry";
import { mockDefaultTag } from "../../../../data/tags";

describe("Add Entry", () => {
    describe("Mood", () => {
        const newEntry: NewEntry = {
            ...newMoodEntry,
        }

        const entry = {
            ...defaultMoodEntry,
            tags: [
            mockDefaultTag
        ]};

        afterEach( async()=>{
            await jest.clearAllMocks();
        })
        describe("Positive Tests", () =>{
            it.each`
            date            
            ${"2020-01-01"}
            ${"2021-05-06"}
            ${"2022-08-12"}
            ${"2023-11-26"}
            `("should create a mood entry with date $date", async ({date})=> {
                const testDate = new Date(date)
                const mockResolvedEntry = {
                    ...entry,
                    datetime: testDate
                }

                const request = { 
                    body: {
                        ...newEntry,
                        datetime: testDate
                    } 
                } as Request
        
                const executeSpy = jest.spyOn(AddEntryUseCase.prototype, "execute");
                executeSpy.mockResolvedValue(mockResolvedEntry);
        
                const response = await handleAddEntry(request, EntryTypes.MOOD);
        
                expect(executeSpy).toHaveBeenCalledWith(request.body);
                expect(response).toEqual(mockResolvedEntry);
                expect(response).toHaveProperty("datetime", new Date(date));
                expect(response).toHaveProperty("type", EntryTypes.MOOD);
            });
            it("should create a mood entry when a request does not have a datetime", async()=>{
                const requestBody = {
                    subject: "test data",
                    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                    tags: [new mongoose.Types.ObjectId().toString()],
                    content: "exhausted",
                };
                
                const entryExpectation = {
                    ...defaultMoodEntry,
                    ...requestBody,
                    tags: [mockDefaultTag]
                };

                const request = { body: requestBody } as Request
                
            
                const executeSpy = jest.spyOn(AddEntryUseCase.prototype, "execute");
                executeSpy.mockResolvedValue(entryExpectation);
        
                const response = await handleAddEntry(request, EntryTypes.MOOD);
        
                expect(executeSpy).toHaveBeenCalledWith(expect.objectContaining(requestBody));
                expect(response).toEqual(entryExpectation);
            });
        });
    })
    describe("Journal", () => {
        const newEntry = {
            ...newJournalEntry
        }

        const entry = {
            ...defaultJournalEntry, 
            tags: [
            mockDefaultTag
        ]};
        afterEach( async()=>{
            await jest.clearAllMocks();
        })
        describe("Positive Tests", () =>{
            it.each`
            date            
            ${"2020-01-01"}  
            ${"2021-05-06"}
            ${"2022-08-12"}
            ${"2023-11-26"}
            `("should create a journal entry with date $date", async ({date})=> {
                const testDate = new Date(date)
                const mockResolvedEntry = {
                    ...entry,
                    datetime: testDate
                }

                const request = { 
                    body: {
                        ...newEntry,
                        datetime: testDate
                    } 
                } as Request
        
                const executeSpy = jest.spyOn(AddEntryUseCase.prototype, "execute");
                executeSpy.mockResolvedValue(mockResolvedEntry);
        
                const response = await handleAddEntry(request, EntryTypes.JOURNAL);
        
                expect(executeSpy).toHaveBeenCalledWith(request.body);
                expect(response).toEqual(mockResolvedEntry);
                expect(response).toHaveProperty("datetime", testDate);
                expect(response).toHaveProperty("type", EntryTypes.JOURNAL);
            });
            it("should create a journal entry when a request does not have a datetime", async()=>{
                const tagID = new mongoose.Types.ObjectId().toString();
                const requestBody = {
                    subject: "test data",
                    quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
                    tags: [tagID],
                    content: "exhausted",
                };
                
                const entryExpectation = {
                    ...defaultMoodEntry,
                    ...requestBody,
                    tags: [mockDefaultTag]
                };
                 
                const request = { body: requestBody } as Request
            
                const executeSpy = jest.spyOn(AddEntryUseCase.prototype, "execute");
                executeSpy.mockResolvedValue(entryExpectation);
        
                const response = await handleAddEntry(request, EntryTypes.JOURNAL);
        
                expect(executeSpy).toHaveBeenCalledWith(expect.objectContaining(requestBody));
                expect(response).toEqual(entryExpectation);
            });
    
        })
    });
});