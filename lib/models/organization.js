const mongoose = require('mongoose');
const utils = require('../utils');

const Schema = mongoose.Schema;

const organizationSchema = new Schema({
  publicId: {
    type: String,
    require: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }]
}, { timestamps: true });

organizationSchema.statics.createNew = function (name, user, cb) {
  organizationModel.create({
    name: name,
    owner: user,
    creator: user,
    members: [user],
    publicId: utils.uidGen(25)
  }, cb);
};

organizationSchema.methods.invite = function (user) {
  this.members.push(user);
  return this.save();
};

organizationSchema.methods.kick = function (user) {
  this.members.splice(this.members.indexOf(user), 1);
  return this.save();
};

const organizationModel = mongoose.model('Organization', organizationSchema);

module.exports = organizationModel;
