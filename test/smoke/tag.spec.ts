import request from "supertest"
import mongoose from "mongoose";

import type { Tag } from "../../src/types/tags";

import app from "../../src/config/server";
import mongooseMemoryDB from "../services/mongoDB/config";
import { existingTagExpectation } from "../assertions/tags";
import CustomErrors from "../../src/types/error";

describe("Tag smoke tests", () => {
    beforeAll ( async () => await mongooseMemoryDB.setupTestEnvironment() );
    let globalTag: Tag;
    describe("POST /api/tag/add", () => {
        const url = "/api/tag/add"
        const requestBody =  {
            name: "test",
            description: "testing testing testing",
        };
        describe("Positive Tests", () => {
            it("should add and return a tag", async () => {

                const response = await request(app)
                    .post(url)
                    .send(requestBody)
                    .expect(200);
                
                expect(response.body).toEqual(existingTagExpectation);
                globalTag = response.body as Tag;
            });
            
        });
        describe("Negative Tests", () => {
            it("should throw an error if the tag already exists", async () => {
                const response =await request(app)
                    .post(url)
                    .send(requestBody)
                    .expect(400);
                expect(response.text).toContain(CustomErrors.INVALID_TAG_EXISTS);
                
            });
        });

    });
    describe("PUT /api/tag/update", () => {
        const url = "/api/tag/update";
        describe("Positive Tests", () => {
            it(`should update a tag's name by ID: ${globalTag}`, async () => {
                const {id} = globalTag;
                const requestBody =  {
                    name: "updateTag test",
                };
                const response  = await request(app)
                .put(url)
                .send({id, updates: requestBody})
                .expect(200);

                expect(response.body).toStrictEqual(expect.objectContaining(existingTagExpectation));
                expect(response.body.name).toStrictEqual(requestBody.name);
            });
            it(`should update a tag's description by ID: ${globalTag}`, async () => {
                const {id} = globalTag;
                const requestBody =  {
                    description: "updateTagDescription test",
                };
                const response  = await request(app)
                .put(url)
                .send({id, updates: requestBody})
                .expect(200);

                expect(response.body).toStrictEqual(expect.objectContaining(existingTagExpectation));
                expect(response.body.description).toStrictEqual(requestBody.description);
            });
            it(`should update a tag's name and description by ID: ${globalTag}`, async () => {
                const {id} = globalTag;
                const requestBody =  {
                    name: "updateTag name and description test",
                    description: "test to update a tasgs name and description",
                };
                const response  = await request(app)
                .put(url)
                .send({id, updates: requestBody})
                .expect(200);

                expect(response.body).toStrictEqual(expect.objectContaining(existingTagExpectation));
                expect(response.body.name).toStrictEqual(requestBody.name);
                expect(response.body.description).toStrictEqual(requestBody.description);
            });
            it("should only return a tag with the expected updated values", async () => {
                const {id} = globalTag;
                const requestBody =  {
                    test: "testing",
                    name: "test",
                    description: "test to update a tasgs name and description",
                };
                const response  = await request(app)
                .put(url)
                .send({id, updates: requestBody})
                .expect(200);

                expect(response.body).toStrictEqual(expect.objectContaining(existingTagExpectation));
                expect(response.body.name).toStrictEqual(requestBody.name);
                expect(response.body.description).toStrictEqual(requestBody.description);
                expect(response.body).not.toHaveProperty("test");
            });
        });
        describe("Negative Tests", () => {
            it("should throw an error if no tags exists with the provided ID", async () => {
                const id = new mongoose.Types.ObjectId().toString();
                const requestBody =  {
                    name: "updateTag name and description test",
                    description: "test to update a tasgs name and description",
                };
                const response  = await request(app)
                .put(url)
                .send({id, updates: requestBody})
                .expect(404);
                
                expect(response.text).toContain(CustomErrors.VOID_TAG);
            });
            it("should throw an error if a tag already exists with the name in the update", async () => {
                const {id} = globalTag;
                const requestBody =  {
                    name: "test",
                };
                const response  = await request(app)
                .put(url)
                .send({id, updates: requestBody})
                .expect(400);
                
                expect(response.text).toContain(CustomErrors.INVALID_TAG_EXISTS);
            });
        });
    });
    describe("GET /api/tag/get-all", () => {
        const url = "/api/tag/get-all";
        it("should return all tags", async () => {

            const response = await request(app)
                .get(url)
                .expect(200);
            
            expect(response.body).toEqual(expect.arrayContaining([existingTagExpectation]));
        });
        it("should return an empty array if no tags exist", async () => {
            await mongooseMemoryDB.tearDownTestEnvironment();
            await mongooseMemoryDB.setupTestEnvironment();
            const response = await request(app)
                .get(url)
                .expect(204);
            expect(response.body).toEqual(expect.arrayContaining([]));
        });
    });
    afterAll(async () => await mongooseMemoryDB.tearDownTestEnvironment());
})