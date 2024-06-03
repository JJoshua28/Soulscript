import { Request } from "express"
import mongoose from "mongoose"

import handleUpdateMoodEntry from '../../../../../src/handlers/entries/mood/updateMoodEntry';

describe("Update mood entry", () => {
    it.each`
    update                          | id
    ${{subject: "Lorum Ipsum"}}     | ${""}
    ${{}}                           | ${new mongoose.Types.ObjectId()}
    ${""}                           | ${new mongoose.Types.ObjectId()}
    ${{}}                           | ${""}
    `("should throw an error but $update and or $id are passed as arguments", async ({id, update})=> {
        const request = ({body:  {update, id}} as Request)
        await expect(handleUpdateMoodEntry(request)).rejects.toThrow(Error);
    }, 12000)

})