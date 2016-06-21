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
  scopes: [{
    type: String,
    required: true
  }],
  expiresIn: {
    type: Date,
    required: true
  }
});

refreshTokenSchema.virtual('duration').get(function () { return 24 * 3600; });
refreshTokenSchema.virtual('length').get(function () { return 256; });

refreshTokenSchema.statics.createNew = function (client, user, scope, cb) {
  refreshTokenModel.create({
    client: client,
    user: user,
    scopes: scope,
    token: utils.uidGen(256),
    expiresIn: new Date(new Date().getTime() + 24 * 3600 * 1000)
  }, cb);
};

const refreshTokenModel = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = refreshTokenModel;
