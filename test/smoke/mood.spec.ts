import request from "supertest"
import moment from "moment";

import { MoodEntry, NewMoodEntry } from "../../src/types/entries";

import app from "../../src/config/server";
import mongooseMemoryDB from "../services/mongoDB/config";
import {createNewMoodEntry} from "../../test/data/helpers/moodEntry";
import { httpMoodEntryExpectation } from "../assertions/moodEntry";
import waitForExpect from "wait-for-expect";
import CustomMoodErrors, { HttpErrorCode } from "../../src/types/error";
import mongoose from "mongoose";


describe("Smoke tests", () => {
    beforeAll ( async () => await mongooseMemoryDB.setupTestEnvironment() );
    let moodEntry: MoodEntry;
    describe("POST /api/mood/add-entry", () => {
        const URL = "/api/mood/add-entry"
        describe("Positive Tests", () => {
            it("should add a mood entry", async () => {
                const entry: NewMoodEntry = createNewMoodEntry();
                const response = await request(app)
                    .post(URL)
                    .send(entry)
                    .expect(200);
    
                expect(response.body).toEqual(expect.objectContaining(httpMoodEntryExpectation));
                moodEntry = response.body;
            });
        });
        describe("Negative Tests", () => {
            it.each`
                requestData
                ${{datetime: "test", mood: "happy"}}
                ${{mood: ""}}
            `(`should throw because of invalid request body: $requestData`, async ({ requestData }) => {
                const response = await request(app)
                    .post(URL)
                    .send(requestData)
                    .expect(HttpErrorCode.BAD_REQUEST);
    
                expect(response).toHaveProperty("text", expect.any(String))
            });
        })
    })
    describe("GET /api/mood/get-entry-by-date", () => {
        const URL = "/api/mood/get-entry-by-date"
        describe("Positive Tests", () => {
            it("should retrieve a mood entry with today's date", async () => {
                const date = (new Date()).toISOString()
                const response = await request(app)
                .get(URL)
                .send({
                    datetime: date
                })
                .expect(200)
    
                expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining(httpMoodEntryExpectation)]));
                expect(response.body).toEqual(expect.arrayContaining([moodEntry]));
            });
            it("should return an empty array if no entries exist with that date", async () => {
                const date = (new Date("2020")).toISOString();
                const response = await request(app)
                .get(URL)
                .send({
                    datetime: date
                })
                .expect(204);
    
                expect(response.body).toEqual(expect.arrayContaining([]));
                expect(response.body).toEqual(expect.arrayContaining([]));
            })
        });
        describe("Negative Tests", () => {
            it.each`
                requestData
                ${""}
                ${{ datetime: "" }}
                ${{ datetime: moment().add(1, "week").toISOString() }}
            `(`should throw because of invalid request body: $requestData`, async ({ requestData }) => {
                const response = await request(app)
                    .get(URL)
                    .send(requestData)
                    .expect(HttpErrorCode.BAD_REQUEST);
    
                expect(response).toHaveProperty("text", expect.any(String))
            });
        })

    })
    describe("PUT api/mood/update-entry", () => {
        const URL = "/api/mood/update-entry";
        describe("Positive Tests", () => {
            it(`should update the mood entry with by ID`, async () => {
            const {id} = moodEntry
         
            const tags = ["life, philosophy"];
            const mood = "unsure" 
            const response  = await request(app)
            .put(URL)
            .send({id, update: {
                tags,
                mood
            }})
            .expect(200);

            expect(response.body.id).toEqual(id);
            expect(response.body.tags).toEqual(tags);
            expect(response.body.mood).toEqual(mood);
            expect(response.body).toEqual(expect.objectContaining(httpMoodEntryExpectation));
            });
        });
        describe("Negative Tests", () => {
            it.each`
                requestData
                ${{ id: new mongoose.Types.ObjectId() }}
                ${{ }}
                ${{ update: {} }}
                ${{ update: {}, id: new mongoose.Types.ObjectId() }}
                ${{ update: "" }}
                ${{ update: "", id: new mongoose.Types.ObjectId() }}
                ${{ update: { datetime: "Invalid date"}, id: moodEntry?.id }}
            `(`should throw because of invalid request body: $requestData`, async ({ requestData }) => {
                const response = await request(app)
                    .put(URL)
                    .send(requestData)
                    .expect(HttpErrorCode.BAD_REQUEST);
    
                expect(response).toHaveProperty("text", expect.any(String))
            });
            it("should throw 404 when attempting a valid update for an ID that does not exist", async () => {
                const updateRequest = {
                    id: new mongoose.Types.ObjectId(),
                    update: {
                        mood: "happy"
                    }
                } as any
                const response = await request(app)
                    .put(URL)
                    .send(updateRequest)
                    .expect(HttpErrorCode.NOT_FOUND);
    
                expect(response).toHaveProperty("text", expect.any(String))
            })
        })

    }) 
    describe("DEL /api/mood/remove-entry", () => {
        const URL = "/api/mood/remove-entry";
        describe("Positive Tests", () => {
            it("should remove the mood entry by id", async () => {
                const {id} = moodEntry;
    
                const response = await request(app)
                .del(URL)
                .send({id})
                .expect(200);
    
                expect(response.body.id).toEqual(id);
                expect(response.body.datetime).toEqual(moodEntry.datetime);
    
                expect(response.body).toEqual(expect.objectContaining(httpMoodEntryExpectation));
    
                await waitForExpect(async () => {
                    const foundDocument = await request(app)
                    .get("/api/mood/get-entry-by-date")
                    .send({datetime: moodEntry.datetime})
                    .expect(204)
                });
    
    
    
            });
        });
        describe("Negative Tests", () => {
            it("should throw 404 when attempting a valid delete an entry with an ID that does not exist", async () => {
                const updateRequest = {
                    id: new mongoose.Types.ObjectId(),
                } as any
                const response = await request(app)
                    .del(URL)
                    .send(updateRequest)
                    .expect(HttpErrorCode.NOT_FOUND);
    
                expect(response).toHaveProperty("text", expect.any(String))
            });
        })
    })
    afterAll(async () => await mongooseMemoryDB.tearDownTestEnvironment() );
})