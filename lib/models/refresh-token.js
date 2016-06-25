const mongoose = require('mongoose');
const utils = require('../utils');

const Schema = mongoose.Schema;

const refreshTokenSchema = new Schema({
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  token: {
    type: String,
    required: true
  },
  revoked: {
    type: Boolean,
    required: true,
    default: false
  },
  expirationDate: {
    type: Date,
    required: true
  }
});

refreshTokenSchema.virtual('duration').get(function () { return 24 * 3600; });
refreshTokenSchema.virtual('length').get(function () { return 256; });

refreshTokenSchema.statics.createNew = function (client, user, cb) {
  refreshTokenModel.create({
    client: client,
    user: user,
    token: utils.uidGen(256),
    expirationDate: new Date(new Date().getTime() + 24 * 3600 * 1000)
  }, cb);
};

refreshTokenSchema.statics.createFix = function (client, user, token, cb) {
  refreshTokenModel.create({
    client: client,
    user: user,
    token: token,
    expirationDate: new Date(new Date().getTime() + 24 * 3600 * 1000)
  }, cb);
};

refreshTokenSchema.statics.getByToken = function (token, cb) {
  refreshTokenModel.findOne({
    token: token,
    revoked: false,
    expirationDate: { $gt: new Date() }
  }, cb);
};

refreshTokenSchema.statics.getByClientToken = function (client, token, cb) {
  refreshTokenModel.findOne({
    client: client,
    token: token,
    revoked: false,
    expirationDate: { $gt: new Date() }
  }, cb);
};

refreshTokenSchema.statics.deleteTokenForUser = function (user, cb) {
  refreshTokenModel.find({ user: user }).remove(cb);
};

refreshTokenSchema.methods.revoke = function (cb) {
  this.revoked = true;
  this.save(cb);
};

const refreshTokenModel = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = refreshTokenModel;
