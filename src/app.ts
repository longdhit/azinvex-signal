import * as express from 'express';
import * as cookieParser from 'cookie-parser';
import * as SignalController from './controllers/SignalController'
import * as SymbolController from './controllers/SymbolController'
import { json, urlencoded } from 'body-parser';
import {  mustBeAdmin, cannotBeAdmin } from './controllers/middleware'

export const app = express();
export const server = require('http').Server(app);
const jsonParser = json();
const urlEncodeParser = urlencoded({ extended: false });
app.use(jsonParser);
app.use(urlEncodeParser);
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('./public'));
//Metatrader Route
app.post('/api/signal/close', SignalController.closeOrderByMT)
//Home Route
app.get('/', SignalController.viewActive);
app.get('/admin',mustBeAdmin, SignalController.pushSignal);
app.post('/admin',mustBeAdmin, SignalController.create);
app.post('/symbol',mustBeAdmin, SymbolController.create);
app.patch('/admin/:ticket',mustBeAdmin, SignalController.closeSignal)
app.put('/admin/:ticket',mustBeAdmin, SignalController.modifySignal)
app.get('/result', SignalController.viewResult);
app.get('/result/:day/:month/:year', SignalController.viewResultByDate)

app.get('/login', cannotBeAdmin, SignalController.viewLogin)
app.post('/login', cannotBeAdmin, SignalController.signIn)
app.get('/ping', function (req, res) {
  res.sendStatus(200);
})
app.get('/*', function (req, res) {
  res.sendStatus(404);
})
export default app;