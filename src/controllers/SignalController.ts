import { Request, Response } from 'express';
import { Signal } from '../models/Signal';
import { Symbol } from '../models/Symbol'
import { io } from '../io/socket'
import { sendOrder, closeOrder, modifyOrder } from '../models/MQL';
import { createToken } from '../lib/jwt'
import * as delay from 'delay'
const moment = require('moment')
var lastestSignal;

export const mt4_check = async (req, res: Response) => {
  if (!lastestSignal) return res.send("-1");
  res.send(lastestSignal);
}

export const create = async (req, res: Response) => {
  let { type, stoploss, takeprofit, symbol } = req.body;
  symbol = symbol.slice(0,6).toUpperCase();
  let symbols = await Symbol.findOneAndUpdate({name:symbol},{name:symbol},{upsert: true});
  sendOrder(type, symbol, stoploss, takeprofit)
    .then(async (signal: Signal) => {
      io.emit("new-signal", signal);
      lastestSignal = `OPEN|${signal.ticket}|${type}|${symbol}|${stoploss}|${takeprofit}`;
      await delay(2000);
      res.json(signal)
    })
    .catch(error => res.status(400).send({ message: error }));
}
export const closeSignal = (req: any, res: Response) => {
  closeOrder(req.params.ticket)
  res.sendStatus(200);

}
export const modifySignal = async (req, res: Response) => {
  const { ticket } = req.params;
  const { stoploss, takeprofit } = req.body;
  modifyOrder(ticket, stoploss, takeprofit)
    .then((signal: Signal) => {
      lastestSignal =  `MODIFY|${signal.ticket}|${stoploss}|${takeprofit}`;
      io.emit("modify-signal", signal);
      res.json({ sucess: true, signal })
    })
    .catch(error => res.status(400).send({ success: false, message: error }));
}
export const closeOrderByMT = (req: Request, res: Response) => {
  const correctToken = 'Ln45CD872e#@$@DCAAS@#43';
  const { ticket, ask, bid, token } = req.body;
  if (token !== correctToken) return res.status(401).send('GO AWAY!');
  res.send("ok")
  Signal.findOne({ ticket: ticket })
      .then(async (signal: Signal) => {
          const closePrice = signal.typeSignal ? ask : bid
          const openPrice = signal.typeSignal ? bid : ask
          if (signal.startAt + 2000 < Date.now()) {
              let updated = await Signal.findByIdAndUpdate(signal._id, { closeAt: Date.now(), closePrice }) as Signal;
              updated = updated.toObject();
              updated.closeAt = Date.now();
              updated.closePrice = closePrice;
              updated.profit = parseFloat(await Signal.calProfit(ticket));
              io.emit("result-signal", updated);
              lastestSignal =  `CLOSE|${signal.ticket}`;
          } else {
              if (signal.openPrice == 0) await Signal.findByIdAndUpdate(signal._id, { openPrice }) as Signal;
          }
      }).catch(error => { return });
}
/////// VIEWS
export const pushSignal = async (req, res: Response) => {
  moment.locale('vi');
  const listSignal = await Signal.find({ closeAt: {$lte:1} }).sort({ ticket: 'desc' })
  const listSymbol = await Symbol.find({}, 'name');
  const symbolList = [];
  listSymbol.forEach((e: any) => {
    symbolList.push(`"${e.name}"`)
  });
  res.render('push_signal.ejs', { listSignal, moment, symbolList })
}

export const viewActive = async (req, res: Response) => {
  const currentTime = new Date(Date.now());
  const day = currentTime.getDate();
  const month = currentTime.getMonth();
  const year = currentTime.getFullYear();
  const date = new Date(year, month, day);
  const { token } = req.cookies;
  moment.locale('vi');
  const listAcitve = await Signal.find({ closeAt: {$lte:1} }).sort({ ticket: 'desc' })
  const listResult = await Signal.find({
    closeAt: { $gt:1 }, startAt: {
      $gte: date.getTime()
    }
  }).sort({ ticket: 'desc' })
  const signalList = listAcitve.concat(listResult);
  res.render('signal_active.ejs', { signalList, moment, token })
}

//LOGIN
export const viewLogin = async (req, res: Response) => {
  res.render('login.ejs')
}
export const signIn = async (req, res: Response) => {
  const { username, password } = req.body;
  if (username === 'cuoicuoiyeu' && password === 'Bzz3bu7x') {
      const token = await createToken({ message: 'You are fool' });
      return res.cookie('token', token).redirect('/admin');
  }
  res.redirect('/login')
}
export const viewResult = async (req, res: Response) => {
  const currentTime = new Date(Date.now());
  const day = currentTime.getDate();
  const month = currentTime.getMonth();
  const year = currentTime.getFullYear();
  const date = new Date(year, month, day);
  var preDate = new Date(date);
  preDate.setDate(date.getDate() - 1);
  const { token } = req.cookies;
  const allSignal = await Signal.find({ closeAt: { $gt:1 } });
  var won = 0, lost = 0, profit = 0;
  allSignal.forEach((e: Signal) => {
      if (e.profit >= 0) won++;
      if (e.profit < 0) lost++;
      profit += e.profit;
  })
  profit = Math.round(profit * 1000) / 1000;
  const infoUser = {
      won, lost, profit
  }
  const signalList = await Signal.find({closeAt: { $gt:1 }, startAt: {
      $gte: preDate.getTime(),
      $lt : date.getTime()
  }}).sort({ ticket: 'desc' })
  var dailyProfit = 0;
  dailyProfit = signalList.reduce(function (a, b:Signal) { return a + +b.profit; }, 0);
  dailyProfit = parseFloat(dailyProfit.toFixed(2));

  res.render('signal_result.ejs', { signalList, infoUser, moment, token, dailyProfit })
}
export const viewResultByDate = async (req, res: Response) => {
  let { day, month, year } = req.params
  const date = new Date(year, month - 1, day);
  let nextDay = new Date(date);
  nextDay.setDate(date.getDate() + 1);
  const { token } = req.cookies;
  moment.locale('vi');
  const signalList = await Signal.find({
    closeAt: { $gt:1 }, startAt: {
          $gte: date.getTime(),
          $lt: nextDay.getTime()
      }
  }).sort({ ticket: 'desc' })
  let day_profit = 0;
  day_profit = signalList.reduce(function (a, b: Signal) { return a + +b.profit; }, 0);
  day_profit = parseFloat(day_profit.toFixed(2));
  res.json({ signalList, dailyProfit: day_profit})
}