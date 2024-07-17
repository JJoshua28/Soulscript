import moment from "moment";

const offsetDateByHours= (offsetHours: number) => {
    const now = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
    return new Date(now.getTime() - offsetHours * 60 * 60 * 1000);
}

export default offsetDateByHours;