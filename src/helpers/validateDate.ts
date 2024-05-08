import moment from "moment";

export const validDate =  (date: string): boolean => {
    const momentDate = moment(date);
    return momentDate.isValid() && momentDate.isSameOrBefore(moment());
}