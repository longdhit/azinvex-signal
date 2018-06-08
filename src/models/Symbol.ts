import { model, Schema } from 'mongoose';
const SymbolSchema = new Schema({
  name: { type: String, required: true, uppercase: true, unique: true }
}, { versionKey: false });
const SymbolModel = model('Symbol', SymbolSchema);

export class Symbol extends SymbolModel {
  name: string;
}