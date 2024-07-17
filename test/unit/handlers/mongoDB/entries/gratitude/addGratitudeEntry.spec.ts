import {Request} from "express";
import { v4 as uuidv4 } from "uuid";


import { EntryTypes } from "../../../../../../src/types/entries";

import AddEntryUseCase from "../../../../../../src/use cases/entries/addEntry";
import handleAddGratitudeEntry from "../../../../../../src/handlers/entries/gratitude/addGratitudeEntry"
import { defaultGratitudeEntry, newGratitudeEntry } from "../../../../../data/gratitudeEntry";
import { mockDefaultTag } from "../../../../../data/tags";
import mongoose from "mongoose";

describe("Add Gratitude entry helper", () => {
    afterEach( async()=>{
        await jest.clearAllMocks();
    })
    describe("Positive Tests", () =>{
        
        it.each`
        entry
        ${{ content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."]}}
        ${{ datetime: new Date("2020"), content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."]}})}
        ${{ tags: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()], content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."]}})}
        ${{ quote: "Always knew we would get our revenge", content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."]}})}
        ${{ subject: "Testing", content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."]}})}
        ${{ sharedID: uuidv4(), content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."]}})}
        `("should create an entry with date $date", async ({entry})=> {
            
            const request = { body: entry } as Request;
            const entryExpectation = {
                ...defaultGratitudeEntry,
                 ...entry
            };
    
            const executeSpy = jest.spyOn(AddEntryUseCase.prototype, "execute");
            executeSpy.mockResolvedValue(entryExpectation);
    
            const response = await handleAddGratitudeEntry(request);
    
            expect(response).toHaveProperty("content", entryExpectation.content);
            expect(response).toHaveProperty("datetime");
            expect(response).toHaveProperty("quote", entryExpectation.quote || null);
            expect(response).toHaveProperty("subject", entryExpectation.subject || null);
            expect(response).toHaveProperty("sharedID", entryExpectation.sharedID || null);
            expect(response).toHaveProperty("tags", entryExpectation.tags || []);
            expect(response).toHaveProperty("id");
            expect(response).toHaveProperty("type", EntryTypes.GRATITUDE);
        });
        it("should create an entry when a request does not have a datetime", async()=>{
            const entry = {
                ...defaultGratitudeEntry,
                ...newGratitudeEntry,
                tags: [mockDefaultTag]
            };

            const {datetime, ...requestBody } = newGratitudeEntry;
           
            const request = { body: requestBody } as Request
            
        
            const executeSpy = jest.spyOn(AddEntryUseCase.prototype, "execute");
            executeSpy.mockResolvedValue(entry);
    
            const response = await handleAddGratitudeEntry(request);
    
            expect(executeSpy).toHaveBeenCalledWith(expect.objectContaining(requestBody));
            expect(response).toHaveProperty("content", entry.content);
            expect(response).toHaveProperty("datetime");
            expect(response).toHaveProperty("quote", entry.quote);
            expect(response).toHaveProperty("subject", entry.subject);
            expect(response).toHaveProperty("sharedID", entry.sharedID);
            expect(response).toHaveProperty("tags", entry.tags);
            expect(response).toHaveProperty("id", entry.id);
            expect(response).toHaveProperty("type", EntryTypes.GRATITUDE);
        });
    })
    describe("Negative Tests", ()=> {
        it.each`
        $requestBody
        ${{content: "happy"}}
        ${{content: 12}}
        ${{content: {}}}
        ${{content: []}}
        ${{datetime: new Date().toString()}}
        ${{content: ["test"], datetime: new Date("3030").toString()}}
        ${{tags: []}}
        `("should throw an error because request body $requestBody is not valid", async ({requestBody})=>{
   
            const request = { body: requestBody } as Request

            await expect(handleAddGratitudeEntry(request)).rejects.toThrow(Error);
    
        });
        
    })
})