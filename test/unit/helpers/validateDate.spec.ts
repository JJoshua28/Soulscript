import moment from "moment"

import { validDate } from "../../../src/helpers/validateDate"

describe("Validate Date", () => {
    const currentDate = new Date(moment().startOf("day").toISOString())
    it.each`
    date                                           | result
    ${"2020-11-21"}                                | ${true}
    ${"2000-04-01"}                                | ${true}
    ${"1990-01-30"}                                | ${true}
    ${moment().add(1, "day").format("YYYY-MM-DD")} | ${false} 
    ${moment()}                                    | ${true} 
    ${"2030-01-30"}                                | ${false}
    ${"3023-01-30"}                                | ${false}
    ${currentDate}                                 | ${true}
    ${currentDate.toISOString()}                   | ${true}
    
    `("should return $result when validate date $date", ({date, result})=>{
        expect(validDate(date)).toEqual(result)
    })
})