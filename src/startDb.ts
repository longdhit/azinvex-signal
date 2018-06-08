import { connect } from 'mongoose';
require('mongoose').Promise = global.Promise;
const databaseUri = 'mongodb://azinvex:Bzz3bu7x@ds161164.mlab.com:61164/azsignal';


connect(databaseUri)
  .catch(() => console.log('Cannot connect database'));
