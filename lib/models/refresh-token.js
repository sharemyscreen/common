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

refreshTokenSchema.statics.getToken = function (token, cb) {
  refreshTokenModel.findOne({
    token: token,
    expirationDate: { $gt: new Date() }
  }, cb);
};

const refreshTokenModel = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = refreshTokenModel;
