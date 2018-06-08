"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getResult(isBuy, openPrice, closePrice) {
    return isBuy ? closePrice >= openPrice : closePrice <= openPrice;
}
exports.getResult = getResult;
function getPips(isBuy, openPrice, closePrice, digit) {
    var result = new Intl.NumberFormat("en", { maximumFractionDigits: digit });
    const abs = isBuy ? closePrice - openPrice : openPrice - closePrice;
    return result.format(Math.ceil((abs * Math.pow(10, digit))) / 10);
}
exports.getPips = getPips;
function getTokenFromHeaders(headers) {
    if (!headers || !headers.authorization)
        return;
    var parted = headers.authorization.split(' ');
    if (parted.length === 2)
        return parted[1];
}
exports.getTokenFromHeaders = getTokenFromHeaders;
;
function waitFor(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), seconds * 1000);
    });
}
exports.waitFor = waitFor;
