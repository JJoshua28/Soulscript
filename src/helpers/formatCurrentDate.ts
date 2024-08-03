import moment from "moment";

const formatCurrentDate= () => {
    const now = new Date(moment().format("YYYY-MM-DD HH:mm:ss"));
    return new Date(now.getTime());
}

export default formatCurrentDate;