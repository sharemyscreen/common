const mongoose = require('mongoose');
const utils = require('../utils');

const Schema = mongoose.Schema;

const accessTokenSchema = new Schema({
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

accessTokenSchema.virtual('duration').get(function () { return 3600; });
accessTokenSchema.virtual('length').get(function () { return 256; });
accessTokenSchema.virtual('type').get(function () { return 'bearer'; });

accessTokenSchema.statics.createNew = function (client, user, cb) {
  accessTokenModel.create({
    client: client,
    user: user,
    token: utils.uidGen(256),
    expirationDate: new Date(new Date().getTime() + 3600 * 1000)
  }, cb);
};

accessTokenSchema.statics.createFix = function (client, user, token, cb) {
  accessTokenModel.create({
    client: client,
    user: user,
    token: token,
    expirationDate: new Date(new Date().getTime() + 3600 * 1000)
  }, cb);
};

accessTokenSchema.statics.getByToken = function (token, cb) {
  accessTokenModel.findOne({
    token: token,
    expirationDate: { $gt: new Date() }
  }).populate('user client').exec(cb);
};

accessTokenSchema.statics.getByClientToken = function (client, token, cb) {
  accessTokenModel.findOne({
    client: client,
    token: token,
    expirationDate: { $gt: new Date() }
  }, cb);
};

const accessTokenModel = mongoose.model('AccessToken', accessTokenSchema);

module.exports = accessTokenModel;
