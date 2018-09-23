import * as moment from 'moment';

export function secondsSinceMidnight(time: moment.Moment) {
    return time.diff(moment().startOf("day")) / 1000.0;
}