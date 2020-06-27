import moment from "moment";

export default {
    date: (format: string) => {
        return moment().format(format);
    }
};