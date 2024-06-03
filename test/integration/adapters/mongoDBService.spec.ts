import { Request } from "express";
import mongoose from "mongoose";
import waitForExpect from 'wait-for-expect';
import moment from "moment";

import { EntryTypes, NewEntry } from "../../../src/types/entries";
import { defaultEntryExpectation, entryDocumentExpectation, gratitudeEntryDocumentExpectation, gratitudeEntryExpectation, } from "../../assertions/entries" 
import EntryDocument from "../../../src/services/mongoDB/types/document";

import AddEntryUseCase from "../../../src/use cases/addEntry"
import { defaultMoodEntry } from "../../data/moodEntry";
import MongoDBService from "../../../src/adapters/mongoDBService";
import { createNewEntry } from "../../data/helpers/customEntry";
import { getByDateQuery } from "../../../src/services/mongoDB/queries/moodEntry";
import mongooseMemoryDB from "../../services/mongoDB/config";
import entryModel from "../../../src/services/mongoDB/models/entry";
import { defaultGratitudeEntry } from "../../data/gratitudeEntry";
import { seedGratitudeEntryTestData, seedMoodEntryTestData } from "../../data/helpers/addTestEntries";

describe("Mood Entry", ()=>{
    beforeAll(async ()=> {
        await mongooseMemoryDB.setupTestEnvironment();
    });
    afterAll(async () => {
        await mongooseMemoryDB.tearDownTestEnvironment();
    });

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
                ${Date()}                 | ${"mood entry with todays date"}
            `
            ("should add a $message", async ({date}) => {
                const entry = createNewEntry(defaultMoodEntry, {datetime: date})
                const mongoService = new MongoDBService(entryModel, EntryTypes.MOOD);
                const response = await mongoService.addEntry(entry);
                       
                expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));
                expect(response).toHaveProperty("datetime", new Date(date));
                expect(response).toHaveProperty("type", EntryTypes.MOOD);

                const [findResponse] = await entryModel.find(entry);
                expect(findResponse).toEqual(expect.objectContaining(entryDocumentExpectation));
                expect(findResponse).toHaveProperty("datetime", new Date(date));
            });
        })
        describe("Negative Tests", () => {
            it.each`
                propertyToDelete 
                ${EntryTypes.MOOD}
                ${"type"}
                ${"subject"}
                ${"type"}
                ${"tags"}
            `
            ("should throw an error if a mood entry does not have a $propertyToDelete property", async ({propertyToDelete}) => {
                const entryService = new MongoDBService(entryModel, EntryTypes.MOOD);
                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = Object.create(defaultMoodEntry);
                delete entry[propertyToDelete];
    
                await expect(addMoodUseCase.execute(entry)).rejects.toThrow(Error);
                
            })
        })
    });
    describe("GET /api/mood/get-entry-by-date", ()=>{
        describe("Positive Tests", () => {
            const currentDate = new Date(new Date(moment().startOf("day").toISOString()));
            beforeAll(async ()=>{
                await mongooseMemoryDB.tearDownTestEnvironment();
                await mongooseMemoryDB.setupTestEnvironment();
                await seedMoodEntryTestData();
            })
            it.each`
                date                        | arrayLength 
                ${new Date(new Date(moment().startOf("day").toISOString()))}                   | ${2}        
                ${new Date("2015-05-15")}   | ${1}        
                ${new Date("2018-01-01")}   | ${0}      
            `
            ("should find $arrayLength mood entries with date add a $message", async ({date, arrayLength}) => {
                const mongoService = new MongoDBService(entryModel, EntryTypes.MOOD);
                const response = await mongoService.getEntryByDate(date);
                       
                expect(response).toHaveLength(arrayLength);             
            });
            it("should return a mood entry document", async ()=>{
                const mongoService = new MongoDBService(entryModel, EntryTypes.MOOD);
                const [response] = await mongoService.getEntryByDate(new Date(new Date(moment().startOf("day").toISOString())));
                const {datetime} = response;

                expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));   
                expect(datetime).toEqual(currentDate);            
            })
            it("should return an empty array if no entries exist for that date", async ()=>{
                const mongoService = new MongoDBService(entryModel, EntryTypes.MOOD);
                const response = await mongoService.getEntryByDate(new Date("2000-05-30"));

                expect(response).toStrictEqual(expect.arrayContaining([]))
                expect(response.length).toStrictEqual(0);
            })
        })
    });
    describe("PUT /api/mood/update-entry", ()=> {
        describe("Positive tests", ()=> {
            seedMoodEntryTestData();
            it.each`
                findQuery                                                                 | updates
                ${ {...getByDateQuery(new Date(new Date(moment().startOf("day").toISOString())), EntryTypes.MOOD), content: "happy"}}    | ${{subject: "Moon River", datetime: new Date("2018-04-09"), tags: ["Lorum Ipsem"], content: "unsure" }}
                ${{...getByDateQuery(new Date(new Date(moment().startOf("day").toISOString())), EntryTypes.MOOD), content: "exhausted"}} | ${{quote: " "}}
                ${{datetime: new Date("2020-10-25"), content: "depressed"}}               | ${{content: "tired", quote: "I am the stone that the builder refused"}}
                ${{datetime: new Date("2015-05-15"), content: "depressed"}}               | ${{quote: "I am the stone that the builder refused", tags: ["music"], subject: "Lorum Ipsem"}}
            `("should update a mood entry with data $updates", async ({findQuery, updates}) => {
        
                let document = await entryModel.findOne(findQuery);
                const options = {
                    new: true,
                    runValidators: true,
                    returnDocument: "after" as "after"
                }
                if(!document) throw new Error(`no document exist with query: ${findQuery}`);
    
                const mongoService = new MongoDBService(entryModel, EntryTypes.MOOD);
                const response = await mongoService.updateEntry(document._id, updates);
                        
                expect(response.id).toEqual(document._id);
                expect(response).toMatchObject({
                    ...updates,
                    type: EntryTypes.MOOD
                });
                expect(response).not.toEqual(document);
            })
        })
        describe("Negative Tests", () => {
            it("should throw an error if no documents exists for that ID", async ()=> {
                const id = new mongoose.Types.ObjectId();
                const update = {quote: " "};
                const mongoService = new MongoDBService(entryModel, EntryTypes.MOOD);
                await expect(mongoService.updateEntry(id, update)).rejects.toThrow(Error)
            })
            
        })


    });
    describe("DELETE /api/mood/remove-entry", () => {
        describe("Positive Tests", ()=> {
            it("should delete a document with the specified ID and return that document", async () => {
                const documents =  await entryModel.find<EntryDocument>({});
                const [document] = documents; 
    
                const mongoDBService = new MongoDBService(entryModel, EntryTypes.MOOD);
                const response  = await mongoDBService.deleteEntry(document._id) as EntryDocument;
                
                expect(response.id).toEqual(document._id);
                expect(response).toEqual(expect.objectContaining({
                    type: document.type,
                    subject: document.subject,
                    quote: document.quote,
                    tags: document.tags,
                    content: document.content,
                    datetime: document.datetime 
                }));
                await waitForExpect(async () => {
                    const foundDocument = await entryModel.findById(document._id);
                    expect(foundDocument).toBeNull();
                });


            });
        })
        describe("Negative Tests", ()=> {

            it("should throw and error if no documents exists with that ID", async () => {
                const mongoDBService = new MongoDBService(entryModel, EntryTypes.MOOD);
                const id = new mongoose.Types.ObjectId();
                
                await expect(mongoDBService.deleteEntry(id)).rejects.toThrow(Error);
            })
        })
    });
});

describe("Gratitude Entry", () => {
    beforeEach(async ()=> {
        await mongooseMemoryDB.setupTestEnvironment();
        await seedGratitudeEntryTestData();
    });
    afterEach(async () => {
        await mongooseMemoryDB.tearDownTestEnvironment();
    });
    describe("POST /api/gratitude/add-entry", () => {
        describe("Positive Tests", () => {
            it.each`
                date                      | message
                ${new Date("2020")}       | ${"a previous custom date in 2020"}
                ${new Date(moment().format("YYYY-MM-DD HH:MM:ss"))} | ${"today's date"}
            `
            ("should add a gratitude entry with $message", async ({date}) => {
                const entry = createNewEntry (defaultGratitudeEntry, {datetime: date})
                const mongoService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
                const response = await mongoService.addEntry(entry);
                       
                expect(response).toEqual(expect.objectContaining(gratitudeEntryExpectation));
                expect(response).toHaveProperty("datetime", date);
                expect(response).toHaveProperty("type", EntryTypes.GRATITUDE);

                const findResponse = await entryModel.find(entry);
                expect(findResponse[0]).toEqual(expect.objectContaining(gratitudeEntryDocumentExpectation));
                expect(findResponse[0]).toHaveProperty("datetime", date);
            });
        })
        describe("Negative Tests", () => {
            it.each`
                propertyToDelete 
                ${EntryTypes.MOOD}
                ${"type"}
                ${"subject"}
                ${"type"}
                ${"tags"}
            `
            ("should throw an error if a mood entry does not have a $propertyToDelete property", async ({propertyToDelete}) => {
                const entryService = new MongoDBService(entryModel, EntryTypes.MOOD);
                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = Object.create(defaultMoodEntry);
                delete entry[propertyToDelete];
    
                await expect(addMoodUseCase.execute(entry)).rejects.toThrow(Error);
                
            })
        })
    });
    describe("GET /api/gratitude/get-entry-by-date", ()=>{
        describe("Positive Tests", () => {
            it.each`
                date                                                            | arrayLength 
                ${new Date(new Date(moment().startOf("day").toISOString()))}    | ${3}        
                ${new Date("2015-05-15")}                                       | ${1}        
                ${new Date("2018-01-01")}                                       | ${0}      
            `
            ("should find $arrayLength gratitude entries with date add a $message", async ({date, arrayLength}) => {
                const mongoService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
                const response = await mongoService.getEntryByDate(date);
                       
                expect(response).toHaveLength(arrayLength);             
            });
            it("should return a gratitude entry document", async ()=>{
                const mongoService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
                const [response] = await mongoService.getEntryByDate(new Date("2020-10-25"));
                const {datetime} = response;

                expect(response).toEqual(expect.objectContaining(gratitudeEntryExpectation));   
                expect(datetime).toEqual(new Date("2020-10-25"));            
            })
            it("should return an empty array if no entries exist for that date", async ()=>{
                const mongoService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
                const response = await mongoService.getEntryByDate(new Date("2000-05-30"));

                expect(response).toStrictEqual(expect.arrayContaining([]))
                expect(response.length).toStrictEqual(0);
            })
        })
    });
    describe("PUT /api/gratitude/update-entry", ()=> {
        describe("Positive tests", ()=> {
            seedGratitudeEntryTestData();
            it.each`
                findQuery                                                                                                                                                                       | updates
                ${{ ...getByDateQuery(new Date(new Date(moment().startOf("day").toISOString())), EntryTypes.GRATITUDE), content: ["Lorem ipsum dolor sit amet."] }}                             | ${{subject: "Moon River", datetime: new Date("2018-04-09"), tags: ["Lorum Ipsem"], content: ["I'm grateful because I see ghosts!"] }}
                ${{ ...getByDateQuery(new Date(new Date(moment().startOf("day").toISOString())), EntryTypes.GRATITUDE), content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit"] }} | ${{ quote: "Lucky me, I see ghosts" }   }
                ${{datetime: new Date("2020-10-25"), content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."] }}                                            | ${{content: ["I'm grateful because I see ghosts!"], quote: "I am the stone that the builder refused"}}
                ${{datetime: new Date("2015-05-15"), content: ["sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."] }}                                                         | ${{quote: "I am the stone that the builder refused", tags: ["music"], subject: "Lorum Ipsem"}}
            `("should update a mood entry with data $updates", async ({findQuery, updates}) => {
        
                let document = await entryModel.findOne(findQuery);
                const options = {
                    new: true,
                    runValidators: true,
                    returnDocument: "after" as "after"
                }
                if(!document) throw new Error(`no document exist with query: ${findQuery}`);
    
                const mongoService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
                const response = await mongoService.updateEntry(document._id, updates);
                        
                expect(response.id).toEqual(document._id);
                expect(response).toMatchObject({
                    ...updates,
                    type: EntryTypes.GRATITUDE
                });
                expect(response).not.toEqual(document);
            })
        })
        describe("Negative Tests", () => {
            it("should throw an error if no documents exists for that ID", async ()=> {
                const id = new mongoose.Types.ObjectId();
                const update = {quote: " "};
                const mongoService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
                await expect(mongoService.updateEntry(id, update)).rejects.toThrow(Error)
            })
            
        })


    });
    describe("DELETE /api/gratitude/remove-entry", () => {
        describe("Positive Tests", ()=> {
            it("should delete a document with the specified ID and return that document", async () => {
                const documents =  await entryModel.find<EntryDocument>({});
                const [document] = documents; 
    
                const mongoDBService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
                const response  = await mongoDBService.deleteEntry(document._id) as EntryDocument;
                
                expect(response.id).toEqual(document._id);
                expect(response).toEqual(expect.objectContaining({
                    type: document.type,
                    subject: document.subject,
                    quote: document.quote,
                    tags: document.tags,
                    content: document.content,
                    datetime: document.datetime 
                }));
                await waitForExpect(async () => {
                    const foundDocument = await entryModel.findById(document._id);
                    expect(foundDocument).toBeNull();
                });


            });
        })
        describe("Negative Tests", ()=> {

            it("should throw and error if no documents exists with that ID", async () => {
                const mongoDBService = new MongoDBService(entryModel, EntryTypes.GRATITUDE);
                const id = new mongoose.Types.ObjectId();
                
                await expect(mongoDBService.deleteEntry(id)).rejects.toThrow(Error);
            })
        })
    });
});

describe("Journal Entry", () => {
    beforeAll(async ()=> {
        await mongooseMemoryDB.setupTestEnvironment();
    });
    afterAll(async () => {
        await mongooseMemoryDB.tearDownTestEnvironment();
    });
    const defaultJournalEntry: NewEntry = {
        sharedID: new mongoose.Types.ObjectId(),
        type: EntryTypes.JOURNAL,
        subject: "test data",
        quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        tags: ["test"],
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Section 1.10.32 of 'de Finibus Bonorum et Malorum', written by Cicero in 45 BC Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
        datetime: new Date(moment().startOf("day").toISOString())
    };

    describe("POST /api/journal/add-entry", () => {
        const request = {body: ""} as Request;
        afterEach(async () => {
            request.body = "";
        })
        describe("Positive Tests", () => {
            it.each`
                date                      | message
                ${new Date("2020")}       | ${"a previous custom date in 2020"}
                ${new Date("2022-03-22")} | ${"a previous custom date in 2022"}
                ${Date()}                 | ${"todays date"}
            `
            ("should add a journal entry with $message", async ({date}) => {
                const entry = {...defaultJournalEntry, datetime: date};
                const mongoService = new MongoDBService(entryModel, EntryTypes.JOURNAL);
                const response = await mongoService.addEntry(entry);
                       
                expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));
                expect(response).toHaveProperty("datetime", expect.any(Date));
                expect(response).toHaveProperty("type", EntryTypes.JOURNAL);

                const [findResponse] = await entryModel.find(entry);
                expect(findResponse).toEqual(expect.objectContaining(entryDocumentExpectation));
                expect(findResponse).toHaveProperty("datetime", expect.any(Date));
            });
        })
        describe("Negative Tests", () => {
            it.each`
                propertyToDelete 
                ${EntryTypes.JOURNAL}
                ${"type"}
                ${"subject"}
                ${"type"}
                ${"tags"}
            `
            ("should throw an error if a mood entry does not have a $propertyToDelete property", async ({propertyToDelete}) => {
                const entryService = new MongoDBService(entryModel, EntryTypes.MOOD);
                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = Object.create(defaultMoodEntry);
                delete entry[propertyToDelete];
    
                await expect(addMoodUseCase.execute(entry)).rejects.toThrow(Error);
                
            })
        })
    });
});