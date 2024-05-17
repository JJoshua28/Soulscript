import { Request } from "express";
import mongoose from "mongoose";
import waitForExpect from 'wait-for-expect';

import { MoodEntryDocument } from "../../../src/services/mongoDB/types/document";

import { defaultMoodEntry } from "../../data/moodEntry";
import { moodEntryModel } from "../../../src/services/mongoDB/models/entry";
import MongoDBService from "../../../src/adapters/mongoDBService";
import AddMoodEntryUseCase from "../../../src/use cases/addMoodEntry";
import { createNewMoodEntry, seedTestData } from "../../data/helpers/moodEntry";
import { getByDateQuery } from "../../../src/services/mongoDB/queries/moodEntry";
import { moodEntryExpectation, moodEntryDocumentExpectation } from "../../assertions/moodEntry";
import mongooseMemoryDB from "../../services/mongoDB/config";

describe("Mood Entry", ()=>{

    beforeAll(async ()=> {
        await mongooseMemoryDB.setupTestEnvironment();
    })
    afterAll(async () => {
        await mongooseMemoryDB.tearDownTestEnvironment();
    })

    describe("POST /api/mood/add-entry", () => {
        const request = {body: ""} as Request;
        afterEach(async () => {
            request.body = "";
        })
        describe("Positive Tests", () => {
            it.each`
                date                      | message
                ${new Date("2020")}       | ${"mood entry with a previous custom date in 2020"}
                ${new Date("2022-03-22")} | ${"mood entry with a previous custom date in 2022"}
                ${new Date()}             | ${"mood entry with todays date"}
            `
            ("should add a $message", async ({date}) => {
                const entry = createNewMoodEntry({datetime: date})
                const mongoService = new MongoDBService();
                const response = await mongoService.addMoodEntry(entry);
                       
                expect(response).toEqual(expect.objectContaining(moodEntryExpectation));
                expect(response).toHaveProperty("datetime", date);
                expect(response).toHaveProperty("type", ["mood"]);

                const [findResponse] = await moodEntryModel.find(entry);
                expect(findResponse).toEqual(expect.objectContaining(moodEntryDocumentExpectation));
                expect(findResponse).toHaveProperty("datetime", date);
            });
        })
        describe("Negative Tests", () => {
            it.each`
                propertyToDelete 
                ${"mood"}
                ${"type"}
                ${"subject"}
                ${"type"}
                ${"tags"}
            `
            ("should throw an error if a mood entry does not have a $propertyToDelete property", async ({propertyToDelete}) => {
                const entryService = new MongoDBService();
                const addMoodUseCase = new AddMoodEntryUseCase(entryService);
                const entry = Object.create(defaultMoodEntry);
                delete entry[propertyToDelete];
    
                await expect(addMoodUseCase.execute(entry)).rejects.toThrow(Error);
                
            })
        })
    })
    describe("GET /api/mood/get-entry-by-date", ()=>{
        describe("Positive Tests", () => {
            const currentDate = new Date();
            beforeAll(async ()=>{
                await mongooseMemoryDB.tearDownTestEnvironment();
                await mongooseMemoryDB.setupTestEnvironment();
                await seedTestData();
            })
            it.each`
                date                                                 | arrayLength 
                ${new Date().toISOString()} | ${2}        
                ${new Date("2015-05-15")}                            | ${1}        
                ${new Date("2018-01-01")}                            | ${0}      
            `
            ("should find $arrayLength mood entries with date add a $message", async ({date, arrayLength}) => {
                const mongoService = new MongoDBService();
                const response = await mongoService.getMoodEntryByDate(date);
                       
                expect(response).toHaveLength(arrayLength);             
            });
            it("should return a mood entry document", async ()=>{
                const mongoService = new MongoDBService();
                const [response] = await mongoService.getMoodEntryByDate(new Date());
                const {datetime} = response;

                expect(response).toEqual(expect.objectContaining(moodEntryExpectation));   
                expect(datetime.toDateString()).toStrictEqual(currentDate.toDateString())            
            })
            it("should return an empty array if no entries exist for that date", async ()=>{
                const mongoService = new MongoDBService();
                const response = await mongoService.getMoodEntryByDate(new Date("2000-05-30"));

                expect(response).toStrictEqual(expect.arrayContaining([]))
                expect(response.length).toStrictEqual(0);
            })
        })
    })
    describe("PUT /api/mood/update-entry", ()=> {
        describe("Positive tests", ()=> {
            seedTestData();
            it.each`
                findQuery                                                | updates
                ${{...getByDateQuery(new Date()), mood: "happy"}}        | ${{subject: "Moon River", datetime: new Date("2018-04-09"), tags: ["Lorum Ipsem"], mood: "unsure" }}
                ${{...getByDateQuery(new Date()), mood: "exhausted"}}    | ${{quote: " "}}
                ${{datetime: new Date("2020-10-25"), mood: "depressed"}} | ${{mood: "tired", quote: "I am the stone that the builder refused"}}
                ${{datetime: new Date("2015-05-15"), mood: "depressed"}} | ${{quote: "I am the stone that the builder refused", tags: ["music"], subject: "Lorum Ipsem"}}
            `("should update a mood entry with data $updates", async ({findQuery, updates}) => {
        
                let document = await moodEntryModel.findOne(findQuery);
                const options = {
                    new: true,
                    runValidators: true,
                    returnDocument: "after" as "after"
                }
                if(!document) throw new Error(`no document exist with query: ${findQuery}`)
    
                const mongoService = new MongoDBService();
                const response = await mongoService.updateMoodEntry(document._id, updates);
                        
                expect(response.id).toEqual(document._id);
                expect(response).toMatchObject({
                    ...updates,
                    type: ["mood"]
                });
                expect(response).not.toEqual(document);
            })
        })
        describe("Negative Tests", () => {
            it("should throw an error if no documents exists for that ID", async ()=> {
                const id = new mongoose.Types.ObjectId();
                const update = {quote: " "};
                const mongoService = new MongoDBService();
                await expect(mongoService.updateMoodEntry(id, update)).rejects.toThrow(Error)
            })
            
        })


    })
    describe("DELETE /api/mood/remove-entry", () => {
        describe("Positive Tests", ()=> {
            it("should delete a document with the specified ID and return that document", async () => {
                const documents =  await moodEntryModel.find<MoodEntryDocument>({});
                const [document] = documents; 
    
                const mongoDBService = new MongoDBService();
                const response  = await mongoDBService.deleteMoodEntry(document._id) as MoodEntryDocument;
                
                expect(response.id).toEqual(document._id);
                expect(response).toEqual(expect.objectContaining({
                    type: document.type,
                    subject: document.subject,
                    quote: document.quote,
                    tags: document.tags,
                    mood: document.mood,
                    datetime: document.datetime 
                }));
                await waitForExpect(async () => {
                    const foundDocument = await moodEntryModel.findById(document._id);
                    expect(foundDocument).toBeNull();
                });


            });
        })
        describe("Negative Tests", ()=> {

            it("should throw and error if no documents exists with that ID", async () => {
                const mongoDBService = new MongoDBService();
                const id = new mongoose.Types.ObjectId();
                
                await expect(mongoDBService.deleteMoodEntry(id)).rejects.toThrow(Error);
            })
        })
    })
    
})