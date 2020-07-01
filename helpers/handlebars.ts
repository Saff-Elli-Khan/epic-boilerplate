import moment from "moment";

export default {
    time: (format: string): string => {
        return moment().format(format);
    }
};