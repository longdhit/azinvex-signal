import * as zmq from 'zeromq';
import { Signal } from './Signal';
import * as uid from 'uid';
import * as delay from 'delay'
const reqSocket = zmq.socket('req');
reqSocket.connect('tcp://127.0.0.1:6666');
export function sendOrder(typeSignal, symbol, stoploss, takeprofit) {
  return new Promise(async (resolve, reject) => {
    reqSocket.on('message', async (msgInBuffer) => {
      const msg = msgInBuffer.toString();
      if (msg.includes('S') && msg.includes(rand)) {
        try {
          let [y, ticket, openPrice, u] = msg.split('|');
          const signal = new Signal({ typeSignal, symbol, stoploss, takeprofit, startAt: Date.now(), openPrice: parseFloat(openPrice), ticket: parseInt(ticket) });
          await signal.save();
          return resolve(signal);
        } catch (error) {
          return reject(error.message);
        }
      }
      else if (msg.includes('ERROR') && msg.includes(rand)) {
        const [x, error_code, y] = msg.split('|');
        reject(error_code)
      }
    })
    const rand = uid(3);
    reqSocket.send(`TRADE|OPEN|${typeSignal}|${symbol.toUpperCase()}|0|${stoploss}|${takeprofit}|${rand}`);
  });
}
export function closeOrder(ticket) {
  reqSocket.send(`TRADE|CLOSE|${ticket}`);
}
export function modifyOrder(ticket, stoploss, takeprofit) {
  return new Promise(async (resolve, reject) => {
    reqSocket.on('message', async (msgInBuffer) => {
      const msg = msgInBuffer.toString();
      if (msg.includes('UPDATED') && msg.includes(ticket)) {
        let signal = await Signal.findOneAndUpdate({ ticket }, { stoploss, takeprofit }) as Signal;
        signal = signal.toObject();
        signal.stoploss = stoploss;
        signal.takeprofit = takeprofit;
        return resolve(signal); 
      }
      else if (msg.includes('ERROR') && msg.includes(ticket)) {
        const [x, error_code, y] = msg.split('|');
        if (error_code == 4756) return reject("Invalid Stop");
        reject(error_code);
      }
    })
    reqSocket.send(`MODIFY|${stoploss}|${takeprofit}|${ticket}`);
  })
}