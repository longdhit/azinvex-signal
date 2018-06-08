import { Schema, model } from 'mongoose';
import { getPips } from '../lib/helpers'
const SignalSchema = new Schema({
  typeSignal: { type: Number, required: true },
  openPrice: { type: Number, default: 0, required: true },
  closePrice: { type: Number, default: 0 },
  startAt: { type: Number, default: 0 },
  closeAt: { type: Number, default: 0 },
  stoploss: { type: Number, default: 0 },
  takeprofit: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  ticket: { type: Number, required: true, unique:true },
  symbol: { type: String, trim: true, uppercase: true, required: true }
}, { versionKey: false });
const SignalModel = model('Signal', SignalSchema);
export class Signal extends SignalModel {
  typeSignal: string;
  openPrice: number;
  closePrice: number;
  stoploss: number;
  takeprofit: number;
  startAt: number;
  closeAt: number;
  profit: number;
  ticket: number;
  symbol: string;

  static async calProfit(ticket) {
    const signal = await Signal.findOne({ ticket }) as Signal;
    let symbol = signal.symbol;
    let digits = 5;
    let first = symbol;
    let last = symbol;
    first = first.slice(0,3);
    last = last.slice(3,6);
    if (first == "JPY" || last == "JPY") digits = 3;
    if (first == "XAU" || last == "XAU") digits = 3;
    if (first == "XAG" || last == "XAG") digits = 3;
    const isBuy = !signal.typeSignal;
    const calprofit = getPips(isBuy, signal.openPrice, signal.closePrice, digits)
    await Signal.findOneAndUpdate({ ticket }, { profit: calprofit });
    return calprofit
  }
}