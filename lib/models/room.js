'use strict';

const mongoose = require('mongoose');
const utils = require('../utils');

const Schema = mongoose.Schema;

const roomSchema = new Schema({
  publicId: {
    type: String,
    required: true,
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

// Object Methods

roomSchema.statics.createNew = (name, creator, invitedUsers, cb) => {
  roomModel.create({
    name: name,
    owner: creator,
    creator: creator,
    members: [creator, ...invitedUsers],
    publicId: utils.uidGen(25)
  }, cb);
};

roomSchema.statics.getAll = cb => roomModel.find({}, cb);
roomSchema.statics.getByPublicId = (id, cb) => roomModel.findOne({publicId: id}, cb);

// Instance Methods

roomSchema.methods.inviteUser = function (user, cb) {
  this.members.push(user);
  return this.save(cb);
};

roomSchema.methods.kickUser = function (user, cb) {
  this.members.splice(this.members.indexOf(user), 1);
  return this.save(cb);
};

roomSchema.methods.close = function () {
  // TODO: Implement room shutdown
};

const roomModel = mongoose.model('Room', roomSchema);

module.exports = roomModel;
