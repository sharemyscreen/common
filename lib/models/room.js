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

roomSchema.statics.createNew = function (name, creator, invitedUsers, cb) {
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
  this.save(cb);
};

roomSchema.methods.kickUser = function (user, cb) {
  this.members.pull(user._id);
  this.save(cb);
};

roomSchema.methods.close = function () {
  // TODO: Implement room shutdown
};

roomSchema.methods.safePrint = function () {
  var members = [];
  this.members.forEach(function (member) {
    members.push(member.safePrintMember());
  });

  let ret = this.toObject();
  delete ret._id;
  delete ret.__v;
  delete ret.updatedAt;
  ret.members = members;
  ret.owner = this.owner.safePrintMember();
  ret.creator = this.creator.safePrintMember();
  return ret;
};

const roomModel = mongoose.model('Room', roomSchema);

module.exports = roomModel;
