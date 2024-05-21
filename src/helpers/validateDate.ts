import moment from "moment";

export const validDate = (date: string | Date): boolean => {
    const momentDate = moment(date, moment.ISO_8601, true);
    return momentDate.isValid() && momentDate.isSameOrBefore(moment());
};
