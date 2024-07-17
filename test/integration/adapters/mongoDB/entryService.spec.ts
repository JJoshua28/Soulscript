import type { Request } from "express";
import mongoose, { Types } from "mongoose";
import waitForExpect from "wait-for-expect";
import moment from "moment";

import { Entry, EntryTypes, NewEntry } from "../../../../src/types/entries";
import { defaultEntryExpectation, entryDocumentExpectation, gratitudeEntryDocumentExpectation, gratitudeEntryExpectation, } from "../../../assertions/entries" 
import type {  EntryDocument }  from "../../../../src/services/mongoDB/types/document";
import CustomErrors from "../../../../src/types/error";

import AddEntryUseCase from "../../../../src/use cases/entries/addEntry"
import { newMoodEntry } from "../../../data/moodEntry";
import MongoDBEntryService from "../../../../src/adapters/mongoDB/entryService";
import MongoDBTagService from "../../../../src/adapters/mongoDB/tagService";
import mongooseMemoryDB from "../../../services/mongoDB/config";
import entryModel from "../../../../src/services/mongoDB/models/entry";
import tagModel from "../../../../src/services/mongoDB/models/tag";
import { newGratitudeEntry } from "../../../data/gratitudeEntry";
import { seedGratitudeEntryTestData, seedJournalEntryTestData, seedMoodEntryTestData } from "../../../data/helpers/addTestEntries";
import { newJournalEntry } from "../../../data/journalEntry";
import { seedTagData } from "../../../data/helpers/seedTagData";
import offsetDateByHours from "../../../../src/helpers/offsetDate";

describe("Entries", () => {
    const tagUpdateIds:Types.ObjectId[] = [];   
    let globalMoodEntry: Entry;
    let globalGratitudeEntry: Entry;
    let globalJournalEntry: Entry;

    const todaysDate = offsetDateByHours(2);

    beforeAll(async () => {
        await mongooseMemoryDB.setupTestEnvironment();

        const tagUpdate = await seedTagData(tagModel, "tag Updates test");
        const tagUpdate1 = await seedTagData(tagModel, "testing tag updates");
        
        tagUpdateIds.push(
            new mongoose.Types.ObjectId(tagUpdate.id), 
            new mongoose.Types.ObjectId(tagUpdate1.id),
        );
        const [response] = await seedMoodEntryTestData(entryModel, [tagUpdateIds[0]]);
        globalMoodEntry = response;

        const [gratitudeEntry1, graitudeEntry2] = await seedGratitudeEntryTestData(entryModel, [tagUpdateIds[1]]);
        globalGratitudeEntry = gratitudeEntry1?.tags.length > 0? gratitudeEntry1 : graitudeEntry2;

        const [entry1, entry2] = await seedJournalEntryTestData(entryModel, [tagUpdateIds[0]]);
        globalJournalEntry = entry1?.tags.length > 0? entry1 : entry2;

        globalJournalEntry;
    });
    afterAll(async () => {
        await mongooseMemoryDB.tearDownTestEnvironment();
    });
    describe("Mood", () => {
        describe("POST /api/entries/mood/add", () => {
            const newEntry = newMoodEntry;
            describe("Positive Tests", () => {
                it.each`
                    date                                                 | message
                    ${new Date("2020")}                                  | ${"a previous custom date in 2020"}
                    ${new Date("2022-03-22")}                            | ${"a previous custom date in 2022"}
                    ${todaysDate}                                        | ${"todays date"}
                `("should add a mood entry containing a tag with $message", async ({date}) => {
                    const tagService = new MongoDBTagService(tagModel);
                    const entry = {
                         ...newEntry,
                         tags: [tagUpdateIds[0]],
                         datetime: date
                    }
    
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
        
                    const response = await addMoodUseCase.execute({ ...newEntry, tags: []});
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
                    const entry = Object.create(newEntry);
                    delete entry[propertyToDelete];
        
                    await expect(addMoodUseCase.execute(entry)).rejects.toThrow(Error);
                    
                });
                it("should throw an error when trying to add a mood entry with a tag that does not exist", async () => {
                    const tagService = new MongoDBTagService(tagModel);
                
                    const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.MOOD);
                    const addMoodUseCase = new AddEntryUseCase(entryService);
        
                    await expect(addMoodUseCase.execute({
                        ...newEntry, 
                        tags: [new mongoose.Types.ObjectId()]
                    })).rejects.toThrow(CustomErrors.INVALID_TAG);
                });
                it("should throw an error if the tag service is missing", async () => {
                    const entryService = new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
    
                    const addMoodUseCase = new AddEntryUseCase(entryService);
        
                    await expect(addMoodUseCase.execute(newEntry)).rejects.toThrow(CustomErrors.VOID_TAG_SERVICE);
                    
                });
            });
        });
        describe("GET /api/entries/mood/get-entry-by-date", ()=>{
            describe("Positive Tests", () => {
                it.each`
                    date                                                         | arrayLength 
                    ${new Date(moment().toISOString())}                          | ${4}        
                    ${new Date("2015-05-15")}                                    | ${1}        
                    ${new Date("2018-01-01")}                                    | ${0}      
                `("should find $arrayLength mood entries with date add a $message", async ({date, arrayLength}) => {
                    const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
                    const response = await mongoService.getEntryByDate(date);
                           
                    expect(response).toHaveLength(arrayLength);             
                });
                it("should return a mood entry document", async ()=>{
                    const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
                    const [response] = await mongoService.getEntryByDate(new Date(moment().toISOString()));
                    const {datetime} = response;
    
                    expect(response).toEqual(expect.objectContaining(defaultEntryExpectation));   
                    expect(datetime).toEqual(todaysDate);            
                })
                it("should return an empty array if no entries exist for that date", async ()=>{
                    const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
                    const response = await mongoService.getEntryByDate(new Date("2000-05-30"));
    
                    expect(response).toStrictEqual(expect.arrayContaining([]))
                    expect(response.length).toStrictEqual(0);
                });
            });
        });
        describe("PUT /api/entries/mood/update", ()=> {
            describe("Positive tests", ()=> {
                it.each`
                updates                                                                           | willUpdateTag
                ${{subject: "Moon River", datetime: new Date("2018-04-09"), content: "unsure" }}  | ${true}
                ${{quote: " "}}                                                                   | ${true}
                ${{content: "tired", quote: "I am the stone that the builder refused"}}           | ${true}
                ${{quote: "I am the stone that the builder refused", subject: "Lorum Ipsem" }}    | ${false}
                ${{content: "unsure"}}                                                            | ${false}
                `("should update a mood entry with data $updates", async ({updates, willUpdateTag}) => {
                    
                    const tagUpdateIdsIndex = 1;
                    
                    const entryUpdates = willUpdateTag && !updates?.tags? {
                        ...updates,
                        tags: [ tagUpdateIds[tagUpdateIdsIndex] ]
                    } : updates;  

                    const tagAssertion = [ 
                        {
                            id: tagUpdateIds[tagUpdateIdsIndex].toString(),
                            name: expect.any(String),
                            description: "",
                            createdAt: expect.any(Date),
                        }
                    ];

                    const tagService = new MongoDBTagService(tagModel);
                    const mongoService =  new MongoDBEntryService( { entryModel,tagService }, EntryTypes.MOOD);
                    
                    const response = await mongoService.updateEntry(globalMoodEntry.id, entryUpdates);
                    expect(response).toEqual(expect.objectContaining(
                        {
                            id: globalMoodEntry.id,
                            ...updates,
                            type: EntryTypes.MOOD,
                            tags: tagAssertion
                    }));
                    expect(response).not.toEqual(globalMoodEntry);

                });
                it("should update a mood entry with with an empty tag", async ()=> {
                    const mongoService =  new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
                    
                    const entryUpdates = {
                        tags: []
                    }

                    const response = await mongoService.updateEntry(globalMoodEntry.id, entryUpdates);
                    
                    expect(response).toMatchObject(
                        {
                            id: expect.any(String),
                            type: EntryTypes.MOOD,
                            tags: []
                    });
                    expect(response.tags).toHaveLength(0);
                    expect(response).not.toEqual(globalMoodEntry);
                });
                it("should update a mood entry with multiple tags", async ()=> {
                    const tagService = new MongoDBTagService(tagModel);
                    const mongoService =  new MongoDBEntryService( { entryModel,tagService }, EntryTypes.MOOD);
                    
                    const entryUpdates = {
                        tags: tagUpdateIds
                    }
                    const tagAssertion = [ 
                            {
                                id: expect.any(String),
                                name: expect.any(String),
                                description: "",
                                createdAt: expect.any(Date),


                            }
                        ];

                    const response = await mongoService.updateEntry(globalMoodEntry.id, entryUpdates);
                    expect(response).toMatchObject(
                        {
                            id: expect.any(String),
                            type: EntryTypes.MOOD,
                            tags: expect.arrayContaining(tagAssertion)
                    });
                    expect(response.tags).toHaveLength(2);
                    expect(response).not.toEqual(globalMoodEntry);

                });
            })
            describe("Negative Tests", () => {
                it("should throw an error if no documents exists for that ID", async ()=> {
                    const id = new mongoose.Types.ObjectId();
                    const update = {quote: " "};
                    const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
                    await expect(mongoService.updateEntry(id.toString(), update)).rejects.toThrow(Error)
                });
                it("should throw an error updating an entry if no tags exist with that ID provided in the update", async ()=> {
                    const update = {tags: [new mongoose.Types.ObjectId()]};

                    const tagService = new MongoDBTagService(tagModel);
                    const mongoService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.MOOD);
                    await expect(mongoService.updateEntry(globalMoodEntry.id, update)).rejects.toThrow(CustomErrors.INVALID_TAG);
                });
                it("should throw an error if the tag service is missing and attempting a tag update", async ()=> {
                    const update = {tags: [tagUpdateIds[0]]};
                    const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.MOOD);
                    await expect(mongoService.updateEntry(globalMoodEntry.id, update)).rejects.toThrow(CustomErrors.VOID_TAG_SERVICE);
                });
            });
        });
        describe("DELETE /api/entries/mood/remove", () => {
            describe("Positive Tests", ()=> {
                it("should delete an entry containing a tag with the specified ID and return that document", async () => {                
                    const mongoDBEntryService = new MongoDBEntryService({ entryModel }, EntryTypes.MOOD);
                    const response = await mongoDBEntryService.deleteEntry(globalMoodEntry.id);
                  
                    expect(response.id).toEqual(globalMoodEntry.id);
                    expect(response).toHaveProperty("type", globalMoodEntry.type);
                    expect(response).toHaveProperty("subject", expect.any(String));
                    expect(response).toHaveProperty("quote", expect.any(String));
                    expect(response.tags).toEqual(expect.arrayContaining([
                        expect.objectContaining(
                            {
                                id: globalMoodEntry.tags[0].id,
                                name: globalMoodEntry.tags[0].name,
                                createdAt: globalMoodEntry.tags[0].createdAt,
                            }
                        )
                    ]));
                    expect(response).toHaveProperty("content", expect.any(String));
                    expect(response).toHaveProperty("datetime", expect.any(Date));
                  
                    await waitForExpect(async () => {
                      const foundDocument = await entryModel.findById(globalMoodEntry.id);
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
    
    describe("Gratitude", () => {
        describe("POST /api/entries/gratitude/add", () => {
            const newEntry = newGratitudeEntry;
            describe("Positive Tests", () => {
                it.each`
                    date                                                | message
                    ${new Date("2020")}                                 | ${"a previous custom date in 2020"}
                    ${new Date("2022-03-22")}                           | ${"a previous custom date in 2022"}
                    ${todaysDate}                                       | ${"today's date"}
                `("should add a gratitude entry containing a tag with $message", async ({date}) => {
                    const tagService = new MongoDBTagService(tagModel);
                    
                    const entry = { 
                        ...newEntry,
                        tags: [tagUpdateIds[0]],
                        datetime: date
                    }
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
        
                    const response = await addMoodUseCase.execute({
                        ...newEntry,
                        tags: []
                    });
                    expect(response).toHaveProperty("type", EntryTypes.GRATITUDE);
                    expect(response).toHaveProperty("content", expect.arrayContaining([expect.any(String)]));
                    expect(response).toHaveProperty("datetime", expect.any(Date));
                    expect(response).toHaveProperty("tags", []);
                })
            });
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
                    const entry = Object.create(newEntry);
                    delete entry[propertyToDelete];
        
                    await expect(addMoodUseCase.execute(entry)).rejects.toThrow(Error);
                    
                });
                it("should throw when trying to add an entry with a tag that does not exist", async () => {
                    const tagService = new MongoDBTagService(tagModel);
                    const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.GRATITUDE);
                    
                    const addGratitudeUseCase = new AddEntryUseCase(entryService);
        
                    await expect(addGratitudeUseCase.execute({
                        ...newEntry,
                        tags: [new mongoose.Types.ObjectId()]
                    })).rejects.toThrow(CustomErrors.INVALID_TAG);
                });
                it("should throw if the tag service is missing", async () => {
                    const entryService = new MongoDBEntryService( { entryModel }, EntryTypes.GRATITUDE);
                    
                    const addGratitudeUseCase = new AddEntryUseCase(entryService);
        
                    await expect(addGratitudeUseCase.execute(newEntry)).rejects.toThrow(CustomErrors.VOID_TAG_SERVICE);
                });
            });
        });
        describe("GET /api/entries/gratitude/get-entry-by-date", ()=>{
            describe("Positive Tests", () => {
                it.each`
                    date                                                            | arrayLength 
                    ${new Date()}                                                   | ${4}        
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
                it.each`
                    updates                                                                                                        | willUpdateTag                  
                    ${{subject: "Moon River", datetime: new Date("2018-04-09"), content: ["I'm grateful because I see ghosts!"] }} | ${true}
                    ${{quote: "Lucky me, I see ghosts" }   }                                                                       | ${true}
                    ${{content: ["I'm grateful because I see ghosts!"], quote: "I am the stone that the builder refused"}}         | ${true}
                    ${{subject: "Super Villain"}}                                                                                  | ${false}
                    ${{quote: "I am the stone that the builder refused", subject: "Lorum Ipsem"}}                                  | ${false}
                `("should update a gratitude entry with data $updates", async ({updates, willUpdateTag}) => {
                    const tagUpdateIdsIndex = Math.floor(Math.random() * 1);
                    
                    const entryUpdates = willUpdateTag && !updates?.tags? {
                        ...updates,
                        tags: [ tagUpdateIds[tagUpdateIdsIndex] ]
                    } : updates; 

                    const tagAssertion = [ 
                            {
                                id: tagUpdateIds[tagUpdateIdsIndex].toString(),
                                name: expect.any(String),
                                description: "",
                                createdAt: expect.any(Date),
                            }
                        ];

                    const tagService = new MongoDBTagService(tagModel);
                    const mongoService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.GRATITUDE);
                    const response = await mongoService.updateEntry(globalGratitudeEntry.id, entryUpdates);
                    

                    expect(response.id).toEqual(globalGratitudeEntry.id);
                    expect(response).toStrictEqual(expect.objectContaining({
                        ...updates,
                        type: EntryTypes.GRATITUDE,
                        tags: tagAssertion
                    }));
                    expect(response).not.toEqual(globalGratitudeEntry);
                });
                it("should update a gratitude entry with with an empty tag", async ()=> {
                    const mongoService =  new MongoDBEntryService( { entryModel }, EntryTypes.GRATITUDE);
                    
                    const entryUpdates = {
                        tags: []
                    }

                    const response = await mongoService.updateEntry(globalGratitudeEntry.id, entryUpdates);
                   
                    expect(response).toMatchObject(
                        {
                            id: expect.any(String),
                            type: EntryTypes.GRATITUDE,
                            tags: []
                    });
                    expect(response.tags).toHaveLength(0);
                    expect(response).not.toEqual(globalGratitudeEntry);
                });
                it("should update a gratitude entry with multiple tags", async ()=> {
                    const tagService = new MongoDBTagService(tagModel);
                    const mongoService =  new MongoDBEntryService( { entryModel,tagService }, EntryTypes.GRATITUDE);
                    
                    const entryUpdates = {
                        tags: tagUpdateIds
                    }
                    const tagAssertion = [ 
                            {
                                id: expect.any(String),
                                name: expect.any(String),
                                description: "",
                                createdAt: expect.any(Date),
                            }
                        ];

                    const response = await mongoService.updateEntry(globalGratitudeEntry.id, entryUpdates);
                    expect(response).toMatchObject(
                        {
                            id: expect.any(String),
                            type: EntryTypes.GRATITUDE,
                            tags: expect.arrayContaining(tagAssertion)
                    });
                    expect(response.tags).toHaveLength(2);
                    expect(response).not.toEqual(globalGratitudeEntry);
                });
            })
            describe("Negative Tests", () => {
                it("should throw an error if no documents exists for that ID", async ()=> {
                    const id = new mongoose.Types.ObjectId();
                    const update = {quote: " "};
                    const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.GRATITUDE);
                    await expect(mongoService.updateEntry(id.toString(), update)).rejects.toThrow(Error)
                });
                it("should throw an error updating an entry if no tags exist with that ID provided in the update", async ()=> {
                    const update = {tags: [new mongoose.Types.ObjectId()]};

                    const tagService = new MongoDBTagService(tagModel);
                    const mongoService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.GRATITUDE);
                    await expect(mongoService.updateEntry(globalGratitudeEntry.id, update)).rejects.toThrow(CustomErrors.INVALID_TAG);
                });
                it("should throw an error if the tag service is missing and attempting a tag update", async ()=> {
                    const update = {tags: [tagUpdateIds[0]]};
                    const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.GRATITUDE);
                    await expect(mongoService.updateEntry(globalGratitudeEntry.id, update)).rejects.toThrow(CustomErrors.VOID_TAG_SERVICE);
                });
            });
        });
        describe("DELETE /api/entries/gratitude/remove", () => {
            describe("Positive Tests", ()=> {
                it("should delete a document with the specified ID and return that document", async () => {

                    const mongoDBEntryService = new MongoDBEntryService( { entryModel }, EntryTypes.GRATITUDE);
                    const response  = await mongoDBEntryService.deleteEntry(globalGratitudeEntry.id);
                    
                    expect(response.id).toEqual(globalGratitudeEntry.id.toString());
                    expect(response).toEqual(expect.objectContaining({
                        type: globalGratitudeEntry.type,
                        subject: expect.any(String),
                        quote: expect.any(String),
                        tags: expect.arrayContaining([expect.any(Object)]),
                        content: expect.arrayContaining([expect.any(String)]),
                        datetime: expect.any(Date) 
                    }));
                    await waitForExpect(async () => {
                        const foundDocument = await entryModel.findById(globalGratitudeEntry.id);
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
    
    describe("Journal", () => {
        const newEntry = newJournalEntry;  
        describe("POST /api/entries/journal/add", () => {
            const request = {body: ""} as Request;
            afterEach(() => {
                request.body = "";
            })
    
            describe("Positive Tests", () => {
               it.each`
                    date                      | message
                    ${new Date("2020")}       | ${"a previous custom date in 2020"}
                    ${new Date("2022-03-22")} | ${"a previous custom date in 2022"}
                    ${todaysDate}             | ${"today's date"}
                `("should add a journal entry containing a tag with $message", async ({ date }) => {
                    const tagService = new MongoDBTagService(tagModel);
                    const entry = {
                        ...newEntry,
                        tags: [tagUpdateIds[0]],
                        datetime: date
                    };
    
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
                    const entry = {
                        ...newEntry,
                        tags: []
                    }
        
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
                    ${EntryTypes.JOURNAL as const}
                    ${"type" as const}
                    ${"subject" as const}
                    ${"tags" as const}
                `("should throw an error if a journal entry does not have a $propertyToDelete property", async ({propertyToDelete}) => {
                    
                    const tagService = new MongoDBTagService(tagModel);
    
                    const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.MOOD);
                    const addMoodUseCase = new AddEntryUseCase(entryService);
                    const entry: NewEntry = {
                        ...newEntry,
                        tags: [tagUpdateIds[0]],
                    }
                    delete entry[propertyToDelete as keyof NewEntry];
        
                    await expect(addMoodUseCase.execute(entry)).rejects.toThrow(Error);
                    
                });
                it("should throw when adding a journal entry with a tag that does not exist", async () => {
                    const tagService = new MongoDBTagService(tagModel);
                    const entryService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.JOURNAL);
                    const addMoodUseCase = new AddEntryUseCase(entryService);
        
                    await expect(addMoodUseCase.execute(newEntry)).rejects.toThrow(CustomErrors.INVALID_TAG);
                });
                it("should throw if the tag service is missing when trying to add journal with a tag", async () => {
                    const entryService = new MongoDBEntryService( { entryModel }, EntryTypes.JOURNAL);
                    const addMoodUseCase = new AddEntryUseCase(entryService);
                    const entry = {
                        ...newEntry,
                        tags: [tagUpdateIds[0]],
                    }
                    await expect(addMoodUseCase.execute(entry)).rejects.toThrow(CustomErrors.VOID_TAG_SERVICE);
                });
            });
        });
        describe("GET /api/entries/journal/get-entry-by-date", ()=>{
            describe("Positive Tests", () => {
                it.each`
                    date                      | arrayLength 
                    ${todaysDate}             | ${3}        
                    ${new Date("2015-05-15")} | ${1}        
                    ${new Date("2018-01-01")} | ${0}      
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
                it.each`
                    updates                                                                                             | willUpdateTag
                    ${{subject: "Moon River", datetime: new Date("2018-04-09"), content: "Which way do I go?" }}        | ${true}
                    ${{quote: " "}}                                                                                     | ${true}   
                    ${{content: "Testin wide awake, I'm wide awake", quote: "I am the stone that the builder refused"}} | ${false}
                    ${{quote: "I am the stone that the builder refused", subject: "Lorum Ipsem"}}                       | ${false}        
                `("should update a journal entry with data $updates", async ({updates, willUpdateTag}) => {
                    const tagUpdateIdsIndex = 1;
                    
                    const entryUpdates = willUpdateTag && !updates?.tags? {
                        ...updates,
                        tags: [ tagUpdateIds[tagUpdateIdsIndex] ]
                    } : updates; 

                    const tagAssertion = [ 
                            {
                                id: tagUpdateIds[tagUpdateIdsIndex].toString(),
                                name: expect.any(String),
                                description: "",
                                createdAt: expect.any(Date),
                            }
                    ];

                    const tagService = new MongoDBTagService(tagModel);
                    const mongoService =  new MongoDBEntryService( { entryModel, tagService }, EntryTypes.JOURNAL);
                    const response = await mongoService.updateEntry(globalJournalEntry.id, entryUpdates);
                            
                    expect(response.id).toEqual(globalJournalEntry.id)
                    expect(response).toStrictEqual(expect.objectContaining({
                        ...updates,
                        type: EntryTypes.JOURNAL,
                        tags: tagAssertion
                    }));
                    expect(response).not.toEqual(globalJournalEntry);
                });
                it("should update a journal entry with with an empty tag", async ()=> {
                    const mongoService =  new MongoDBEntryService( { entryModel }, EntryTypes.JOURNAL);
                    
                    const entryUpdates = {
                        tags: []
                    }

                    const response = await mongoService.updateEntry(globalJournalEntry.id, entryUpdates);
                    
                    expect(response).toMatchObject(
                        {
                            id: expect.any(String),
                            type: EntryTypes.JOURNAL,
                            tags: []
                    });
                    expect(response.tags).toHaveLength(0);
                    expect(response).not.toEqual(globalJournalEntry);
                });
                it("should update a journal entry with multiple tags", async ()=> {
                    const tagService = new MongoDBTagService(tagModel);
                    const mongoService =  new MongoDBEntryService( { entryModel,tagService }, EntryTypes.JOURNAL);
                    
                    const entryUpdates = {
                        tags: tagUpdateIds
                    }
                    const tagAssertion = [ 
                            {
                                id: expect.any(String),
                                name: expect.any(String),
                                description: "",
                                createdAt: expect.any(Date),
                            }
                        ];

                    const response = await mongoService.updateEntry(globalJournalEntry.id, entryUpdates);
                    expect(response).toMatchObject(
                        {
                            id: expect.any(String),
                            type: EntryTypes.JOURNAL,
                            tags: expect.arrayContaining(tagAssertion)
                    });
                    expect(response.tags).toHaveLength(2);
                    expect(response).not.toEqual(globalJournalEntry);

                });
            })
            describe("Negative Tests", () => {
                it("should throw an error if no documents exists for that ID", async ()=> {
                    const id = new mongoose.Types.ObjectId();
                    const update = {quote: " "};
                    const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.JOURNAL);
                    await expect(mongoService.updateEntry(id.toString(), update)).rejects.toThrow(Error);
                });
                it("should throw an error updating an entry if no tags exist with that ID", async ()=> {
                    const update = {tags: [new mongoose.Types.ObjectId()]};

                    const tagService = new MongoDBTagService(tagModel);
                    const mongoService = new MongoDBEntryService( { entryModel, tagService }, EntryTypes.JOURNAL);
                    await expect(mongoService.updateEntry(globalJournalEntry.id, update)).rejects.toThrow(CustomErrors.INVALID_TAG);
                });
                it("should throw an error if the tag service is missing and attempting a tag update", async ()=> {
                    const update = {tags: [tagUpdateIds[0]]};
                    const mongoService = new MongoDBEntryService( { entryModel }, EntryTypes.JOURNAL);
                    await expect(mongoService.updateEntry(globalJournalEntry.id, update)).rejects.toThrow(CustomErrors.VOID_TAG_SERVICE);
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
})