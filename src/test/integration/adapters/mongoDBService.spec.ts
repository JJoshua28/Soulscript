import { Request } from "express";
import { moodEntryModel } from "../../../integrations/mongoDB/models/entry";
import { setupTestEnvironment, tearDownTestEnvironment } from "../../../integrations/mongoDB/test/config"
import { datetimeMoodEntry, defaultMoodEntry } from "../../data/moodEntry";
import handleAddEntry from "../../../handlers/addEntry";
import MongoDBService from "../../../adapters/mongoDBService";
import AddMoodEntryUseCase from "../../../use cases/addMoodEntry";

describe("POST /api/add-entry/mood", () => {
    const request = {body: ""} as Request;
    beforeEach(async ()=> {
        await setupTestEnvironment();
    })
    afterEach(async () => {
        request.body = "";
        await tearDownTestEnvironment();
    })

    describe("Positive Tests", () => {
        it.each`
            entry                                   | expectation          | message
            ${{...request, body: defaultMoodEntry}} | ${defaultMoodEntry}  | ${"mood entry with todays date"}
            ${{...request, body:datetimeMoodEntry}} | ${datetimeMoodEntry} | ${"mood entry with a previous custom date in 2020"}
        `
        ("should add a $message", async ({entry, expectation}) => {
            
            const response = await handleAddEntry(entry); 
                   
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
            const entry = Object.create(datetimeMoodEntry);
            delete entry[propertyToDelete];

            await expect(addMoodUseCase.execute(entry)).rejects.toThrow(Error);
            
        })
    })
})