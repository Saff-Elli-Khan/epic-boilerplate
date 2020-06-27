import moment from "moment";

export default {
    time: (format: string) => {
        return moment().format(format);
    }
};