export function getResult(isBuy, openPrice, closePrice) {
    return isBuy ? closePrice >= openPrice : closePrice <= openPrice;
  }
  export function getPips(isBuy, openPrice, closePrice, digit) {
    var result = new Intl.NumberFormat("en", { maximumFractionDigits: digit });
    const abs = isBuy ? closePrice - openPrice : openPrice - closePrice;
    return result.format(Math.ceil((abs * Math.pow(10, digit))) / 10);
  }
  
  export function getTokenFromHeaders(headers) {
    if (!headers || !headers.authorization) return;
    var parted = headers.authorization.split(' ');
    if (parted.length === 2) return parted[1];
  };
  export function waitFor(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), seconds * 1000);
    });
  }