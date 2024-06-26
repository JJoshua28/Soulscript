import type { Request } from "express";
import mongoose from "mongoose";
import waitForExpect from "wait-for-expect";
import moment from "moment";

import { EntryTypes } from "../../../../src/types/entries";
import { defaultEntryExpectation, entryDocumentExpectation, gratitudeEntryDocumentExpectation, gratitudeEntryExpectation, } from "../../../assertions/entries" 
import {  EntryDocument }  from "../../../../src/services/mongoDB/types/document";
import CustomErrors from "../../../../src/types/error";

import AddEntryUseCase from "../../../../src/use cases/entries/addEntry"
import { defaultMoodEntry } from "../../../data/moodEntry";
import MongoDBEntryService from "../../../../src/adapters/mongoDB/entryService";
import MongoDBTagService from "../../../../src/adapters/mongoDB/tagService";
import { createNewEntry } from "../../../data/helpers/customEntry";
import { getByDateQuery } from "../../../../src/services/mongoDB/queries/moodEntry";
import mongooseMemoryDB from "../../../services/mongoDB/config";
import entryModel from "../../../../src/services/mongoDB/models/entry";
import tagModel from "../../../../src/services/mongoDB/models/tag";
import { defaultGratitudeEntry } from "../../../data/gratitudeEntry";
import { seedGratitudeEntryTestData, seedJournalEntryTestData, seedMoodEntryTestData } from "../../../data/helpers/addTestEntries";
import { defaultJournalEntry } from "../../../data/journalEntry";
import { seedTagData } from "../../../data/helpers/seedTagData";

describe("Mood Entry", () => {
    beforeAll(async ()=> {
        await mongooseMemoryDB.setupTestEnvironment();

        await seedTagData(tagModel, defaultMoodEntry.tags[0]);
    });
    afterAll(async () => {
        await mongooseMemoryDB.tearDownTestEnvironment();
    });

    describe("POST /api/entries/mood/add", () => {
        describe("Positive Tests", () => {
            it.each`
                date                      | message
                ${new Date("2020")}       | ${"mood entry with a previous custom date in 2020"}
                ${new Date("2022-03-22")} | ${"mood entry with a previous custom date in 2022"}
                ${Date()}                 | ${"mood entry with todays date"}
            `("should add a $message", async ({date}) => {
                const tagService = new MongoDBTagService(tagModel);
                const entry = createNewEntry(defaultMoodEntry, {datetime: date});

                const mongoService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.MOOD);
                const response = await mongoService.addEntry(entry);
                       
                expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));
                expect(response).toHaveProperty("datetime", new Date(date));
                expect(response).toHaveProperty("type", EntryTypes.MOOD);

                const [findResponse] = await entryModel.find(entry);
                expect(findResponse).toEqual(expect.objectContaining(entryDocumentExpectation));
                expect(findResponse).toHaveProperty("datetime", new Date(date));
            });
            it("should add a mood entry without a tag", async () => {
                const tagService = new MongoDBTagService(tagModel);
            
                const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.MOOD);
                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = createNewEntry(defaultMoodEntry, {tags: []});
    
                const response = await addMoodUseCase.execute(entry);
                expect(response).toHaveProperty("type", EntryTypes.MOOD);
                expect(response).toHaveProperty("content", expect.any(String));
                expect(response).toHaveProperty("datetime", expect.any(Date));
                expect(response).toHaveProperty("tags", []);
            })
        })
        describe("Negative Tests", () => {
            it.each`
                propertyToDelete 
                ${EntryTypes.MOOD}
                ${"type"}
                ${"subject"}
                ${"type"}
                ${"tags"}
            `("should throw an error if a mood entry does not have a $propertyToDelete property", async ({propertyToDelete}) => {
                const tagService = new MongoDBTagService(tagModel);
            
                const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.MOOD);
                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = Object.create(defaultMoodEntry);
                delete entry[propertyToDelete];
    
                await expect(addMoodUseCase.execute(entry)).rejects.toThrow(Error);
                
            });
            it("should throw an error when trying to add a mood entry with a tag that does not exist", async () => {
                const tagService = new MongoDBTagService(tagModel);
            
                const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.MOOD);
                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = createNewEntry(defaultMoodEntry, {tags: ["invalidTag"]});
    
                await expect(addMoodUseCase.execute(entry)).rejects.toThrow(CustomErrors.INVALID_TAG);
                
            });
            it("should throw an error if the tag service is missing", async () => {
                const entryService = new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);

                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = createNewEntry(defaultMoodEntry);
    
                await expect(addMoodUseCase.execute(entry)).rejects.toThrow(CustomErrors.VOID_TAG_SERVICE);
                
            });
            it("should throw when an entry does not match the request type", async () => {
                const tagService = new MongoDBTagService(tagModel);
            
                const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.MOOD);
                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = createNewEntry(defaultJournalEntry);
    
                await expect(addMoodUseCase.execute(entry)).rejects.toThrow(CustomErrors.INVALID_ENTRY_TYPE);
            });
        })
    });
    describe("GET /api/entries/mood/get-entry-by-date", ()=>{
        describe("Positive Tests", () => {
            const currentDate = new Date(new Date(moment().startOf("day").toISOString()));
            beforeAll(async ()=>{
                await mongooseMemoryDB.tearDownTestEnvironment();
                await mongooseMemoryDB.setupTestEnvironment();
                await seedMoodEntryTestData(entryModel);
            })
            it.each`
                date                        | arrayLength 
                ${new Date(new Date(moment().startOf("day").toISOString()))}                   | ${2}        
                ${new Date("2015-05-15")}   | ${1}        
                ${new Date("2018-01-01")}   | ${0}      
            `("should find $arrayLength mood entries with date add a $message", async ({date, arrayLength}) => {
                const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
                const response = await mongoService.getEntryByDate(date);
                       
                expect(response).toHaveLength(arrayLength);             
            });
            it("should return a mood entry document", async ()=>{
                const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
                const [response] = await mongoService.getEntryByDate(new Date(new Date(moment().startOf("day").toISOString())));
                const {datetime} = response;

                expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));   
                expect(datetime).toEqual(currentDate);            
            })
            it("should return an empty array if no entries exist for that date", async ()=>{
                const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
                const response = await mongoService.getEntryByDate(new Date("2000-05-30"));

                expect(response).toStrictEqual(expect.arrayContaining([]))
                expect(response.length).toStrictEqual(0);
            })
        })
    });
    describe("PUT /api/entries/mood/update", ()=> {
        describe("Positive tests", ()=> {
            seedMoodEntryTestData(entryModel);
            it.each`
                findQuery                                                                 | updates
                ${ {...getByDateQuery(new Date(new Date(moment().startOf("day").toISOString())), EntryTypes.MOOD), content: "happy"}}    | ${{subject: "Moon River", datetime: new Date("2018-04-09"), tags: ["Lorum Ipsem"], content: "unsure" }}
                ${{...getByDateQuery(new Date(new Date(moment().startOf("day").toISOString())), EntryTypes.MOOD), content: "exhausted"}} | ${{quote: " "}}
                ${{datetime: new Date("2020-10-25"), content: "depressed"}}               | ${{content: "tired", quote: "I am the stone that the builder refused"}}
                ${{datetime: new Date("2015-05-15"), content: "depressed"}}               | ${{quote: "I am the stone that the builder refused", tags: ["music"], subject: "Lorum Ipsem"}}
            `("should update a mood entry with data $updates", async ({findQuery, updates}) => {
        
                const document = await entryModel.findOne(findQuery);
                if(!document) throw new Error(`no document exist with query: ${findQuery}`);
                
                const {_id: id} = document
                const mongoService =  new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
                const response = await mongoService.updateEntry((id.toString()), updates);
                        
                expect(response.id).toEqual(document._id.toString());
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
                const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
                await expect(mongoService.updateEntry(id.toString(), update)).rejects.toThrow(Error)
            })
            
        })


    });
    describe("DELETE /api/entries/mood/remove", () => {
        describe("Positive Tests", ()=> {
            it("should delete a document with the specified ID and return that document", async () => {
                const documents =  await entryModel.find<EntryDocument>({});
                const [document] = documents; 
    
                const mongoDBEntryService = new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
                const response  = await mongoDBEntryService.deleteEntry(document._id.toString());
                
                expect(response.id).toEqual(document._id.toString());
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
                const mongoDBEntryService = new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
                const id = new mongoose.Types.ObjectId();
                
                await expect(mongoDBEntryService.deleteEntry(id.toString())).rejects.toThrow(Error);
            })
        })
    });
});

describe("Gratitude Entry", () => {
    beforeEach(async ()=> {
        await mongooseMemoryDB.setupTestEnvironment();

        await seedTagData(tagModel, defaultGratitudeEntry.tags[0]);
        await seedGratitudeEntryTestData(entryModel);
    });
    afterEach(async () => {
        await mongooseMemoryDB.tearDownTestEnvironment();
    });
    describe("POST /api/entries/gratitude/add", () => {
        describe("Positive Tests", () => {
            it.each`
                date                                                | message
                ${new Date("2020")}                                 | ${"a previous custom date in 2020"}
                ${new Date(moment().format("YYYY-MM-DD HH:MM:ss"))} | ${"today's date"}
            `("should add a gratitude entry with $message", async ({date}) => {
                const tagService = new MongoDBTagService(tagModel);
                const entry = createNewEntry (defaultGratitudeEntry, {datetime: date})
                
                const mongoService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.GRATITUDE);
                const response = await mongoService.addEntry(entry);
                       
                expect(response).toEqual(expect.objectContaining(gratitudeEntryExpectation));
                expect(response).toHaveProperty("datetime", date);
                expect(response).toHaveProperty("type", EntryTypes.GRATITUDE);

                const findResponse = await entryModel.find(entry);
                expect(findResponse[0]).toEqual(expect.objectContaining(gratitudeEntryDocumentExpectation));
                expect(findResponse[0]).toHaveProperty("datetime", date);
            });
            it("should add a gratitude entry without a tag", async () => {
                const tagService = new MongoDBTagService(tagModel);
            
                const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.GRATITUDE);
                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = createNewEntry(defaultGratitudeEntry, {tags: []});
    
                const response = await addMoodUseCase.execute(entry);
                expect(response).toHaveProperty("type", EntryTypes.GRATITUDE);
                expect(response).toHaveProperty("content", expect.arrayContaining([expect.any(String)]));
                expect(response).toHaveProperty("datetime", expect.any(Date));
                expect(response).toHaveProperty("tags", []);
            })
        })
        describe("Negative Tests", () => {
            it.each`
                propertyToDelete 
                ${EntryTypes.MOOD}
                ${"type"}
                ${"subject"}
                ${"type"}
                ${"tags"}
            `("should throw an error if a mood entry does not have a $propertyToDelete property", async ({propertyToDelete}) => {
                const tagService = new MongoDBTagService(tagModel);
                const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.MOOD);
                
                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = Object.create(defaultMoodEntry);
                delete entry[propertyToDelete];
    
                await expect(addMoodUseCase.execute(entry)).rejects.toThrow(Error);
                
            });
            it("should throw when trying to add an entry with a tag that does not exist", async () => {
                const tagService = new MongoDBTagService(tagModel);
                const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.GRATITUDE);
                
                const addGratitudeUseCase = new AddEntryUseCase(entryService);
                const entry = createNewEntry(defaultGratitudeEntry, {tags: ["invalidTag"]});
    
                await expect(addGratitudeUseCase.execute(entry)).rejects.toThrow(CustomErrors.INVALID_TAG);
            });
            it("should throw if the tag service is missing", async () => {
                const entryService = new MongoDBEntryService( { entryModel }, EntryTypes.GRATITUDE);
                
                const addGratitudeUseCase = new AddEntryUseCase(entryService);
    
                await expect(addGratitudeUseCase.execute(defaultGratitudeEntry)).rejects.toThrow(CustomErrors.VOID_TAG_SERVICE);
            });
            it("should throw when an entry does not match the request type", async () => {
                const tagService = new MongoDBTagService(tagModel);
            
                const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.GRATITUDE);
                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = createNewEntry(defaultJournalEntry);
    
                await expect(addMoodUseCase.execute(entry)).rejects.toThrow(CustomErrors.INVALID_ENTRY_TYPE);
            });

        })
    });
    describe("GET /api/entries/gratitude/get-entry-by-date", ()=>{
        describe("Positive Tests", () => {
            it.each`
                date                                                            | arrayLength 
                ${new Date(new Date(moment().startOf("day").toISOString()))}    | ${3}        
                ${new Date("2015-05-15")}                                       | ${1}        
                ${new Date("2018-01-01")}                                       | ${0}      
            `("should find $arrayLength gratitude entries with date add a $message", async ({date, arrayLength}) => {
                const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.GRATITUDE);
                const response = await mongoService.getEntryByDate(date);
                       
                expect(response).toHaveLength(arrayLength);             
            });
            it("should return a gratitude entry document", async ()=>{
                const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.GRATITUDE);
                const [response] = await mongoService.getEntryByDate(new Date("2020-10-25"));
                const {datetime} = response;

                expect(response).toEqual(expect.objectContaining(gratitudeEntryExpectation));   
                expect(datetime).toEqual(new Date("2020-10-25"));            
            })
            it("should return an empty array if no entries exist for that date", async ()=>{
                const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.GRATITUDE);
                const response = await mongoService.getEntryByDate(new Date("2000-05-30"));

                expect(response).toStrictEqual(expect.arrayContaining([]))
                expect(response.length).toStrictEqual(0);
            })
        })
    });
    describe("PUT /api/entries/gratitude/update", ()=> {
        describe("Positive tests", ()=> {
            seedGratitudeEntryTestData(entryModel);
            it.each`
                findQuery                                                                                                                                                                       | updates
                ${{ ...getByDateQuery(new Date(new Date(moment().startOf("day").toISOString())), EntryTypes.GRATITUDE), content: ["Lorem ipsum dolor sit amet."] }}                             | ${{subject: "Moon River", datetime: new Date("2018-04-09"), tags: ["Lorum Ipsem"], content: ["I'm grateful because I see ghosts!"] }}
                ${{ ...getByDateQuery(new Date(new Date(moment().startOf("day").toISOString())), EntryTypes.GRATITUDE), content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit"] }} | ${{ quote: "Lucky me, I see ghosts" }   }
                ${{datetime: new Date("2020-10-25"), content: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor."] }}                                            | ${{content: ["I'm grateful because I see ghosts!"], quote: "I am the stone that the builder refused"}}
                ${{datetime: new Date("2015-05-15"), content: ["sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."] }}                                                         | ${{quote: "I am the stone that the builder refused", tags: ["music"], subject: "Lorum Ipsem"}}
            `("should update a mood entry with data $updates", async ({findQuery, updates}) => {
                const document = await entryModel.findOne(findQuery);

                if(!document) throw new Error(`no document exist with query: ${findQuery}`);
    
                const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.GRATITUDE);
                const response = await mongoService.updateEntry(document._id.toString(), updates);
                        
                expect(response.id).toEqual(document._id.toString());
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
                const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.GRATITUDE);
                await expect(mongoService.updateEntry(id.toString(), update)).rejects.toThrow(Error)
            })
            
        })


    });
    describe("DELETE /api/entries/gratitude/remove", () => {
        describe("Positive Tests", ()=> {
            it("should delete a document with the specified ID and return that document", async () => {
                const documents =  await entryModel.find<EntryDocument>({});
                const [document] = documents; 
    
                const mongoDBEntryService = new MongoDBEntryService( { entryModel }, EntryTypes.GRATITUDE);
                const response  = await mongoDBEntryService.deleteEntry(document._id.toString());
                
                expect(response.id).toEqual(document._id.toString());
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
                const mongoDBEntryService = new MongoDBEntryService( { entryModel }, EntryTypes.GRATITUDE);
                const id = new mongoose.Types.ObjectId();
                
                await expect(mongoDBEntryService.deleteEntry(id.toString())).rejects.toThrow(Error);
            })
        })
    });
});

describe("Journal Entry", () => {
    beforeAll(async ()=> {
        await mongooseMemoryDB.setupTestEnvironment();
        
        await seedTagData(tagModel, defaultJournalEntry.tags[0]);

    });
    afterAll(async () => {
        await mongooseMemoryDB.tearDownTestEnvironment();
    });

    describe("POST /api/entries/journal/add", () => {
        const request = {body: ""} as Request;
        afterEach(async () => {
            request.body = "";
        })

        describe("Positive Tests", () => {
           it.each`
                date                      | message
                ${new Date("2020")}       | ${"a previous custom date in 2020"}
                ${new Date("2022-03-22")} | ${"a previous custom date in 2022"}
                ${new Date()}             | ${"today's date"}
            `("should add a journal entry with $message", async ({ date }) => {
                const tagService = new MongoDBTagService(tagModel);
                const entry = { ...defaultJournalEntry, datetime: date };

                const mongoService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.JOURNAL);
                const response = await mongoService.addEntry(entry);

                expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));
                expect(response).toHaveProperty("datetime", expect.any(Date));
                expect(response).toHaveProperty("type", EntryTypes.JOURNAL);

                const [findResponse] = await entryModel.find({ _id: response.id });

                await waitForExpect(async () => {
                    expect(findResponse).toEqual(expect.objectContaining(entryDocumentExpectation));
                    expect(findResponse).toHaveProperty("datetime", expect.any(Date));
                })
            });
            it("should add a journal entry without a tag", async () => {
                const tagService = new MongoDBTagService(tagModel);
            
                const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.JOURNAL);
                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = createNewEntry(defaultJournalEntry, {tags: []});
    
                const response = await addMoodUseCase.execute(entry);
                expect(response).toHaveProperty("type", EntryTypes.JOURNAL);
                expect(response).toHaveProperty("content", expect.any(String));
                expect(response).toHaveProperty("datetime", expect.any(Date));
                expect(response).toHaveProperty("tags", []);
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
            `("should throw an error if a journal entry does not have a $propertyToDelete property", async ({propertyToDelete}) => {
                const tagService = new MongoDBTagService(tagModel);

                const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.MOOD);
                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = Object.create(defaultMoodEntry);
                delete entry[propertyToDelete];
    
                await expect(addMoodUseCase.execute(entry)).rejects.toThrow(Error);
                
            });
            it("should throw when adding a journal entry with a tag that does not exist", async () => {
                const tagService = new MongoDBTagService(tagModel);
                const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.JOURNAL);
                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = { ...defaultJournalEntry, tags: ["InvalidTag"] };
    
                await expect(addMoodUseCase.execute(entry)).rejects.toThrow(CustomErrors.INVALID_TAG);
            });
            it("should throw if the tag service is missing when trying to add journal with a tag", async () => {
                const entryService = new MongoDBEntryService( { entryModel }, EntryTypes.JOURNAL);
                const addMoodUseCase = new AddEntryUseCase(entryService);
    
                await expect(addMoodUseCase.execute(defaultJournalEntry)).rejects.toThrow(CustomErrors.VOID_TAG_SERVICE);
            });
            it("should throw when an entry does not match the request type", async () => {
                const tagService = new MongoDBTagService(tagModel);
            
                const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.JOURNAL);
                const addMoodUseCase = new AddEntryUseCase(entryService);
                const entry = createNewEntry(defaultMoodEntry);
    
                await expect(addMoodUseCase.execute(entry)).rejects.toThrow(CustomErrors.INVALID_ENTRY_TYPE);
            });
        })
    });

    describe("GET /api/entries/journal/get-entry-by-date", ()=>{
        describe("Positive Tests", () => {
            beforeAll(async ()=>{
                await mongooseMemoryDB.tearDownTestEnvironment();
                await mongooseMemoryDB.setupTestEnvironment();
                await seedJournalEntryTestData(entryModel);
            })
            it.each`
                date                                                            | arrayLength 
                ${new Date(new Date(moment().startOf("day").toISOString()))}    | ${2}        
                ${new Date("2015-05-15")}                                       | ${1}        
                ${new Date("2018-01-01")}                                       | ${0}      
            `("should find $arrayLength mood entries with date add a $message", async ({date, arrayLength}) => {
                const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.JOURNAL);
                const response = await mongoService.getEntryByDate(date);
                       
                expect(response).toHaveLength(arrayLength);             
            });
            it("should return a journal entry document", async () => {
                const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.JOURNAL);
                const [response] = await mongoService.getEntryByDate(new Date(new Date(moment().startOf("day").toISOString())));
              
                expect(response).toHaveProperty("id", expect.any(String));
                expect(response).toHaveProperty("type", EntryTypes.JOURNAL);
                expect(response).toHaveProperty("content", expect.any(String));
                expect(response).toHaveProperty("datetime", expect.any(Date));
                expect(response).toHaveProperty("tags", expect.any(Array));
                expect(response).toHaveProperty("subject");
                expect(response).toHaveProperty("quote");
                expect(response).toHaveProperty("sharedID");

            });
            
            it("should return an empty array if no entries exist for that date", async ()=>{
                const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.JOURNAL);
                const response = await mongoService.getEntryByDate(new Date("2000-05-30"));

                expect(response).toStrictEqual(expect.arrayContaining([]))
                expect(response.length).toStrictEqual(0);
            })
        })
    });
    describe("PUT /api/entries/journal/update", ()=> {
        describe("Positive tests", ()=> {
            seedMoodEntryTestData(entryModel);
            it.each`
                findQuery                                                                                               | updates
                ${ {...getByDateQuery(new Date(new Date(moment().startOf("day").toISOString())), EntryTypes.JOURNAL) }} | ${{subject: "Moon River", datetime: new Date("2018-04-09"), tags: ["Lorum Ipsem"], content: "Which way do I go?" }}
                ${{...getByDateQuery(new Date(new Date(moment().startOf("day").toISOString())), EntryTypes.JOURNAL) }}  | ${{quote: " "}}
                ${{datetime: new Date("2020-10-25") }}                                                                  | ${{content: "Testin wide awake, I'm wide awake", quote: "I am the stone that the builder refused"}}
                ${{datetime: new Date("2015-05-15") }}                                                                  | ${{quote: "I am the stone that the builder refused", tags: ["music"], subject: "Lorum Ipsem"}}
            `("should update a journal entry with data $updates", async ({findQuery, updates}) => {
        
                const document = await entryModel.findOne(findQuery);
                if(!document) throw new Error(`no document exist with query: ${findQuery}`);
                
                const {_id: id} = document
                const mongoService =  new MongoDBEntryService( { entryModel }, EntryTypes.JOURNAL);
                const response = await mongoService.updateEntry((id.toString()), updates);
                        
                expect(response.id).toEqual(document._id.toString());
                expect(response).toMatchObject({
                    ...updates,
                    type: EntryTypes.JOURNAL
                });
                expect(response).not.toEqual(document);
            })
        })
        describe("Negative Tests", () => {
            it("should throw an error if no documents exists for that ID", async ()=> {
                const id = new mongoose.Types.ObjectId();
                const update = {quote: " "};
                const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.JOURNAL);
                await expect(mongoService.updateEntry(id.toString(), update)).rejects.toThrow(Error);
            });
            
        });
    });
    describe("DELETE /api/entries/journal/remove", () => {
        describe("Positive Tests", ()=> {
            it("should delete a document with the specified ID and return that document", async () => {
                const documents =  await entryModel.find<EntryDocument>({type: EntryTypes.JOURNAL});
                const [document] = documents; 
    
                const entryService = new MongoDBEntryService( { entryModel }, EntryTypes.JOURNAL);
                const response  = await entryService.deleteEntry(document._id.toString());
                
                expect(response.id).toEqual(document._id.toString());
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
                const mongoDBService = new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
                const id = new mongoose.Types.ObjectId();
                
                await expect(mongoDBService.deleteEntry(id.toString())).rejects.toThrow(Error);
            })
        })
    });
});