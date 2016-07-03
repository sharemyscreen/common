'use strict';

const mongoose = require('mongoose');
const roomModel = require('./room');
const utils = require('../utils');

const Schema = mongoose.Schema;

const organizationSchema = new Schema({
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
  }],
  rooms: [{
    type: Schema.Types.ObjectId,
    ref: 'Room'
  }]
}, { timestamps: true });

organizationSchema.statics.createNew = function (name, user, cb) {
  roomModel.createNew('general', user, [], (err, room) => {
    if (err) {
      return cb(err);
    }

    organizationModel.create({
      name: name,
      owner: user,
      creator: user,
      members: [user],
      rooms: [room],
      publicId: utils.uidGen(25)
    }, (err, cOrg) => {
      if (err) {
        return cb(err);
      }

      user.integrateOrganization(cOrg, err => {
        if (err) {
          return cb(err);
        }
        cb(null, cOrg);
      });
    });
  });
};

organizationSchema.statics.getAll = function (cb) {
  return organizationModel.find({}).exec(cb);
};

organizationSchema.statics.getByPublicId = function (id, cb) {
  return organizationModel.findOne({publicId: id})
  .populate('owner creator members rooms')
  .exec(function (err, fOrg) {
    if (err) {
      cb(err);
    } else if (fOrg != null) {
      fOrg.rooms.forEach(function (room, i) {
        room.populate('owner creator members', function (err) {
          if (err) {
            cb(err);
          } else if (i === fOrg.rooms.length - 1) {
            cb(null, fOrg);
          }
        });
      });
    } else {
      cb(null, fOrg);
    }
  });
};

organizationSchema.statics.getByIdDepth = function (id, cb) {
  return organizationModel.findOne({_id: id})
  .populate('owner creator members rooms')
  .exec(function (err, fOrg) {
    if (err) {
      cb(err);
    } else if (fOrg != null) {
      fOrg.rooms.forEach(function (room, i) {
        room.populate('owner creator members', function (err) {
          if (err) {
            cb(err);
          } else if (i === fOrg.rooms.length - 1) {
            cb(null, fOrg);
          }
        });
      });
    } else {
      cb(null, fOrg);
    }
  });
};

organizationSchema.methods.safePrint = function (keepMembers) {
  let members = [];
  if (keepMembers) {
    this.members.forEach(function (member) {
      members.push(member.safePrintMember());
    });
  }

  const owner = this.owner.safePrintMember();

  const creator = this.creator.safePrintMember();

  let rooms = [];
  this.rooms.forEach(function (room) {
    rooms.push(room.safePrint());
  });

  const ret = this.toObject();
  delete ret._id;
  delete ret.__v;
  delete ret.updatedAt;
  delete ret.rooms;
  ret.members = keepMembers ? members : undefined;
  ret.owner = owner;
  ret.creator = creator;
  ret.rooms = rooms;

  return ret;
};

organizationSchema.methods.inviteUser = function (user, cb) {
  const org = this;
  user.integrateOrganization(org, function (err) {
    if (err) {
      cb(err);
    } else {
      org.rooms[0].inviteUser(user, function (err) {
        if (err) {
          cb(err);
        } else {
          org.members.push(user);
          org.save(cb);
        }
      });
    }
  });
};

organizationSchema.methods.kickUser = function (user, cb) {
  const org = this;
  user.leaveOrganization(org, function (err) {
    if (err) {
      cb(err);
    } else {
      org.rooms.forEach(function (room, i) {
        room.kickUser(user, function (err) {
          if (err) {
            cb(err);
          } else if (i === org.rooms.length - 1) {
            org.members.pull(user._id);
            org.save(cb);
          }
        });
      });
    }
  });
};

organizationSchema.methods.destroy = function (cb) {
  const org = this;
  org.members.forEach(function (member, i) {
    member.leaveOrganization(org, function (err) {
      if (err) {
        cb(err);
      } else {
        if (i === org.members.length - 1) {
          org.remove(cb);
        }
      }
    });
  });
};

organizationSchema.virtual('room.default').get(() => {
  return this.rooms[0];
});

const organizationModel = mongoose.model('Organization', organizationSchema);

module.exports = organizationModel;
