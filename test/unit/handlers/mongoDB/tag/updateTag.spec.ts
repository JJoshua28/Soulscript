import type { Request } from "express";

import handleUpdateTag from "../../../../../src/handlers/tag/updateTag"
import CustomErrors from "../../../../../src/types/error";

describe("updateTag", () => {
    describe("Negative Tests", () => {
        it("should throw an error if a tag request has no id", async () => {
            const request = {
                body: {
                    updates: {
                        name: "updateTag test"
                    }
                }
            } as Request
            await expect(handleUpdateTag(request)).rejects.toThrow(CustomErrors.INVALID_REQUEST);
        });
        it("should throw if a request has no updates", async () => {
            const request = {
                body: {
                    id: "123"
                }
            } as Request
            await expect(handleUpdateTag(request)).rejects.toThrow(CustomErrors.INVALID_REQUEST);
        });
        it("should throw an error if a tag name is not a string", async () => {
            const request = {
                body: {
                    id: "123",
                    updates: {
                        name: 123
                    }
                }
            } as Request
            await expect(handleUpdateTag(request)).rejects.toThrow(CustomErrors.INVALID_REQUEST);
        });
        it("should throw an error if a tag description is not a string", async () => {
            const request = {
                body: {
                    id: "123",
                    updates: {
                        description: 123
                    }
                }
            } as Request
            await expect(handleUpdateTag(request)).rejects.toThrow(CustomErrors.INVALID_REQUEST);
        });
        it("should throw if the request's updates has no name or description", async () => {
            const request = {
                body: {
                    id: "123",
                    updates: {
                        test: "test"
                    }
                }
            } as Request
            await expect(handleUpdateTag(request)).rejects.toThrow(CustomErrors.INVALID_REQUEST);
        });
    });
     //TODO: test if description is not created and returned by MongoDB", async () => {)
})