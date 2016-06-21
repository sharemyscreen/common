const mongoose = require('mongoose');
const utils = require('../utils');

const Schema = mongoose.Schema;

const clientSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  key: {
    type: String,
    unique: true
  },
  secret: {
    type: String,
    unique: true
  },
  trusted: {
    type: Boolean,
    default: false
  }
}, {timestamps: true});

clientSchema.statics.createNew = function (name, cb) {
  clientModel.create({
    name: name,
    key: utils.uidGen(16),
    secret: utils.uidGen(32)
  }, cb);
};

clientSchema.statics.getAll = function (cb) {
  clientModel.find({}, cb);
};

clientSchema.statics.getByKey = function (key, cb) {
  clientModel.findOne({key: key}, cb);
};

clientSchema.statics.getByCredential = function (key, secret, cb) {
  clientModel.findOne({key: key, secret: secret}, cb);
};

clientSchema.methods.trust = function (cb) {
  this.trusted = true;
  this.save(cb);
};

const clientModel = mongoose.model('Client', clientSchema);

module.exports = clientModel;
