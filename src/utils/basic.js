export const stringify = (obj) => JSON.stringify(obj);
export const parse = (string) => JSON.parse(obj);
export const getUnixTimeStamp = (date = new Date) => Math.floor(date.getTime() / 1000);