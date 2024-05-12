import moment from "moment";
import { Request } from "express";
import handleGetMoodEntryByDate from '../../../src/handlers/getMoodEntryByDate';
import GetMoodEntryByDateUseCase from '../../../src/use cases/getMoodEntryByDateUseCase';
import { validDate } from "../../../src/helpers/validateDate";
import { createMoodEntry } from "../../data/helpers/moodEntry";

jest.mock("../../../src/helpers/validateDate");

const mockValidDate = validDate as jest.MockedFunction<typeof validDate>;

describe("Get Mood entry  by date helper", () => {
    describe("Positive Tests", () =>{
        beforeAll(()=>{
            mockValidDate.mockReturnValue(true);
        })
        afterEach( async()=>{
            await jest.clearAllMocks();
        })
        
        it.each`
        date            | entry
        ${"2020-01-01"} | ${[createMoodEntry({datetime: new Date("2020-01-01")}), createMoodEntry({datetime: new Date("2020-01-01"), subject: "test"})]}
        ${"2021-05-06"} | ${[createMoodEntry({datetime: new Date("2021-05-06")})]}
        ${"2022-08-12"} | ${[createMoodEntry({datetime: new Date("2022-08-12")}), createMoodEntry({datetime: new Date("2022-08-12"), quote: "its a test thing"})]}
        ${"2023-11-26"} | ${[createMoodEntry({datetime: new Date("2023-11-26")})]}
        `("should get a mood entry with date $date", async ({date, entry})=> {
            
            const request = ({body:  {datetime: date}} as Request)
            
            
            const executeSpy = jest.spyOn(GetMoodEntryByDateUseCase.prototype, 'execute');
            executeSpy.mockResolvedValue(entry);
            
            const response = await handleGetMoodEntryByDate(request);
            
            expect(executeSpy).toHaveBeenCalledWith(new Date(date));
            expect(response).toEqual(expect.arrayContaining(entry));
            expect(response[0]).toHaveProperty("datetime", new Date(date));
            expect(response[0]).toHaveProperty("type", ["mood"]);
        });
    })
    describe("Negative Tests", ()=> {
        beforeAll(()=>{
            mockValidDate.mockReturnValue(false);
        })
        it.each`
        date
        ${moment().add(1, "day")}
        ${"3023-01-01"}
        ${moment().add(1, "month")}
        ${moment().add(1, "year")}
        `("should throw and error with when invalid date $date is passed", async ({date}) =>{
            const request = ({body:  {datetime: date}} as any as Request)
            
            await expect(handleGetMoodEntryByDate(request)).rejects.toThrow(Error);

        })
    })
})