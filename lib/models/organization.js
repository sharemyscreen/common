const mongoose = require('mongoose');
const utils = require('../utils');
const roomModel = require('./room');

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
  }],
  rooms: [{
    type: Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  }]
}, { timestamps: true });

organizationSchema.statics.createNew = function (name, user, cb) {
  organizationModel.create({
    name: name,
    owner: user,
    creator: user,
    members: [ user ],
    rooms: [],
    publicId: utils.uidGen(25)
  }, function (err, cOrg) {
    if (err) {
      cb(err);
    } else {
      roomModel.createNew('General', cOrg._id, user, false, function (err, cRoom) {
        if (err) {
          cb(err);
        } else {
          user.integrateOrganization(cOrg, function (err) {
            if (err) {
              cb(err);
            } else {
              cOrg.rooms.push(cRoom);
              cOrg.save(function (err) {
                if (err) {
                  cb(err);
                } else {
                  cOrg.rooms[0] = cRoom;
                  cb(null, cOrg);
                }
              });
            }
          });
        }
      });
    }
  });
};

organizationSchema.statics.getAll = function (cb) {
  organizationModel.find({}, cb);
};

organizationSchema.statics.getByIdFull = function (id, cb) {
  organizationModel.findOne({_id: id})
    .populate('owner creator members rooms')
    .exec(function (err, fOrg) {
      if (err) {
        cb(err);
      } else {
        fOrg.rooms.forEach(function (room, i) {
          room.populateMembers(function (err) {
            if (err) {
              cb(err);
            } else if (i === fOrg.rooms.length - 1) {
              cb(null, fOrg);
            }
          });
        });
      }
    });
};

organizationSchema.statics.getByPublicId = function (id, cb) {
  organizationModel.findOne({publicId: id})
    .populate({
      path: 'rooms owner creator members',
      populate: {
        path: 'members'
      }
    })
    .exec(cb);
};

organizationSchema.statics.getByPublicIdFull = function (id, cb) {
  organizationModel.findOne({publicId: id})
    .populate('owner creator members rooms')
    .exec(function (err, fOrg) {
      if (err) {
        cb(err);
      } else {
        fOrg.rooms.forEach(function (room, i) {
          room.populateMembers(function (err) {
            if (err) {
              cb(err);
            } else if (i === fOrg.rooms.length - 1) {
              cb(null, fOrg);
            }
          });
        });
      }
    });
};

organizationSchema.statics.getById = function (id, cb) {
  organizationModel.findOne({ _id: id })
    .populate({
      path: 'rooms owner creator members',
      populate: {
        path: 'members'
      }
    })
    .exec(cb);
};

organizationSchema.methods.safePrint = function (user) {
  var members = [];
  if (this.populated('members') !== undefined) {
    this.members.forEach(function (member) {
      members.push(member.safePrintMember());
    });
  } else {
    members = undefined;
  }

  var owner = this.populated('owner') ? this.owner.safePrintMember() : undefined;

  var creator = this.populated('creator') ? this.creator.safePrintMember() : undefined;

  var rooms = [];
  if (this.populated('rooms') !== undefined) {
    this.rooms.forEach(function (room) {
      if (!room.isPrivate || room.members.indexOf(user) !== -1) {
        rooms.push(room.safePrint());
      }
    });
  } else {
    rooms = undefined;
  }

  var ret = this.toObject();
  delete ret._id;
  delete ret.__v;
  delete ret.updatedAt;
  ret.members = members;
  ret.owner = owner;
  ret.creator = creator;
  ret.rooms = rooms;
  return ret;
};

organizationSchema.methods.createRoom = function (name, user, isPrivate, cb) {
  const org = this;
  roomModel.createNew(name, org, user, isPrivate, function (err, cRoom) {
    if (err) {
      cb(err);
    } else {
      org.rooms.push(cRoom);
      org.save(function (err) {
        if (err) {
          cb(err);
        } else {
          cb(null, cRoom);
        }
      });
    }
  });
};

organizationSchema.methods.deleteRoom = function (room, cb) {
  this.rooms.splice(this.rooms.indexOf(room), 1);
  this.save(function (err) {
    if (err) {
      cb(err);
    } else {
      room.destroy(cb);
    }
  });
};

organizationSchema.methods.populateMembers = function (cb) {
  this.populate('members owner creator', cb);
};

organizationSchema.methods.populateRooms = function (cb) {
  const org = this;
  org.populate('members owner creator rooms', function (err) {
    if (err) {
      cb(err);
    } else if (org.rooms.length === 0) {
      cb(null);
    } else {
      org.getRooms(cb);
    }
  });
};

organizationSchema.methods.getRooms = function (cb) {
  const org = this;
  this.rooms.forEach(function (room, i) {
    room.populateMembers(function (err) {
      if (err) {
        cb(err);
      } else if (i === org.rooms.length - 1) {
        cb(null);
      }
    });
  });
};

organizationSchema.methods.inviteUser = function (user, cb) {
  const org = this;
  user.integrateOrganization(org, function (err) {
    if (err) {
      cb(err);
    } else {
      org.members.push(user);
      org.save(function (err) {
        if (err) {
          cb(err);
        } else {
          org.rooms[0].inviteUser(user, cb);
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
      roomModel.getByOrgUser(org, user, function (err, fRooms) {
        if (err) {
          cb(err);
        } else if (fRooms.length > 0) {
          fRooms.forEach(function (room, i) {
            room.kickUser(user, function (err) {
              if (err) {
                cb(err);
              } else if (i === fRooms.length - 1) {
                org.members.splice(org.members.indexOf(user), 1);
                org.save(cb);
              }
            });
          });
        } else {
          org.members.splice(org.members.indexOf(user), 1);
          org.save(cb);
        }
      });
    }
  });
};

organizationSchema.methods.destroy = function (cb) {
  const org = this;
  org.members.forEach(function (member, i) {
    member.leaveOrganization(this, function (err) {
      if (err) {
        cb(err);
      } else if (i === org.members.length - 1) {
        org.rooms.forEach(function (room, i) {
          room.destroy(function (err) {
            if (err) {
              cb(err);
            } else if (i === org.rooms.length - 1) {
              org.remove(cb);
            }
          });
        });
      }
    });
  });
};

const organizationModel = mongoose.model('Organization', organizationSchema);

module.exports = organizationModel;
