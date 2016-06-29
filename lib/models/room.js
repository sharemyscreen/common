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
  organization: {
    type: Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  isPrivate: {
    type: Boolean,
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

roomSchema.statics.createNew = (name, org, creator, isPrivate, cb) => {
  roomModel.create({
    name: name,
    organization: org,
    owner: creator,
    creator: creator,
    isPrivate: isPrivate,
    publicId: utils.uidGen(25),
    members: [ creator ]
  }, cb);
};

roomSchema.statics.getAll = cb => roomModel.find({}, cb);
roomSchema.statics.getByIdFull = (id, cb) => roomModel.findOne({_id: id}).populate('creator owner members').exec(cb);
roomSchema.statics.getByPublicId = (id, cb) => roomModel.findOne({publicId: id}, cb);
roomSchema.statics.getByPublicIdFull = (id, cb) => roomModel.findOne({publicId: id}).populate('creator owner memebers').exec(cb);
roomSchema.statics.getByOrgUser = (org, user, cb) => roomModel.find({organization: org, members: user}, cb);

// Instance Methods

roomSchema.methods.populateMembers = function (cb) {
  this.populate('members', cb);
};

roomSchema.methods.inviteUser = function (user, cb) {
  this.members.push(user);
  return this.save(cb);
};

roomSchema.methods.kickUser = function (user, cb) {
  this.members.splice(this.members.indexOf(user), 1);
  return this.save(cb);
};

roomSchema.methods.destroy = function (cb) {
  this.remove(cb);
};

roomSchema.methods.safePrint = function () {
  var ret = this.toObject();
  var members = [];
  if (this.populated('members') !== undefined) {
    this.members.forEach(function (member) {
      members.push(member.safePrintMember());
    });
  } else {
    members = undefined;
  }
  delete ret._id;
  delete ret.__v;
  delete ret.updatedAt;
  delete ret.isPrivate;
  delete ret.organization;

  if (this.populated('owner') !== undefined) {
    ret.owner = this.owner.safePrintMember();
  }
  if (this.populated('creator') !== undefined) {
    ret.creator = this.creator.safePrintMember();
  }
  ret.members = members;
  return ret;
};

const roomModel = mongoose.model('Room', roomSchema);

module.exports = roomModel;
