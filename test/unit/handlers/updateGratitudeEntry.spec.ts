import { Request } from "express"
import mongoose from "mongoose"

import handleUpdateGratitudeEntry from '../../../src/handlers/updateGratitudeEntry';

describe("Update gratitude entry", () => {
    it.each`
    update                          | id
    ${{subject: "Lorum Ipsum"}}     | ${""}
    ${{}}                           | ${new mongoose.Types.ObjectId()}
    ${""}                           | ${new mongoose.Types.ObjectId()}
    ${{}}                           | ${""}
    ${{ content: "" }}                  | ${new mongoose.Types.ObjectId()}
    ${{ content: [] }}                  | ${new mongoose.Types.ObjectId()}
    `("should throw an error when $update and or $id are passed as arguments", async ({id, update})=> {
        const request = ({body:  {update, id}} as Request)
        await expect(handleUpdateGratitudeEntry(request)).rejects.toThrow(Error);
    }, 12000)

})