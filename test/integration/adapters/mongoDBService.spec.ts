import { Request } from "express";
import { moodEntryModel } from "../../../src/services/mongoDB/models/entry";
import { seedTestData, setupTestEnvironment, tearDownTestEnvironment } from "../../services/mongoDB/config"
import { createMoodEntry, defaultMoodEntry } from "../../data/moodEntry";
import handleAddEntry from "../../../src/handlers/addEntry";
import MongoDBService from "../../../src/adapters/mongoDBService";
import AddMoodEntryUseCase from "../../../src/use cases/addMoodEntry";

describe("Mood Entry", ()=>{

    beforeAll(async ()=> {
        await setupTestEnvironment();
    })
    afterAll(async () => {
        await tearDownTestEnvironment();
    })

    describe("POST /api/add-entry/mood", () => {
        const request = {body: ""} as Request;
        afterEach(async () => {
            request.body = "";
        })
        describe("Positive Tests", () => {
            it.each`
                entry                                                  | expectation                                                | message
                ${createMoodEntry({datetime: new Date("2020")})}       | ${{...defaultMoodEntry, datetime: new Date("2020")}}       | ${"mood entry with a previous custom date in 2020"}
                ${createMoodEntry({datetime: new Date("2022-03-22")})} | ${{...defaultMoodEntry, datetime: new Date("2022-03-22")}} | ${"mood entry with a previous custom date in 2022"}
                ${createMoodEntry({datetime: new Date()})}             | ${{...defaultMoodEntry, datetime: new Date()}}             | ${"mood entry with todays date"}
            `
            ("should add a $message", async ({entry, expectation}) => {
                
                const mongoService = new MongoDBService();
                const response = await mongoService.addMoodEntry(entry);
                       
                expect(response).toEqual(expect.objectContaining({...expectation}));
                ;
                const [findResponse] = await moodEntryModel.find({...expectation});
                expect(findResponse).toEqual(expect.objectContaining({...expectation}));
                
            });
        })
        describe("Negative Tests", () => {
            it("should throw an error if a request has no body", async () =>{
                await expect(handleAddEntry(request)).rejects.toThrow(Error); 
            });
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
    describe("GET /api", ()=>{
        describe("Positive Tests", () => {
            const currentDate = new Date();
            beforeAll(async ()=>{
                await tearDownTestEnvironment();
                await setupTestEnvironment();
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

                expect(response).toEqual(expect.objectContaining({
                    type: expect.arrayContaining([expect.any(String)]),
                    subject: expect.any(String),
                    quote: expect.any(String),
                    tags: expect.arrayContaining([expect.any(String)]),
                    mood: expect.any(String),
                    datetime: expect.anything() 
                  

                }));   
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
    
})