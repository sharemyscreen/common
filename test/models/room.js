'use strict';

const expect = require('chai').expect;
const smsCommon = require('../../');
const roomFixture = require('../fixtures/models/room.json');
const utils = require('../../lib/utils');

let user;
let user2;
let room;
let org;

describe('Testing Room model', () => {
  before(done => {
    smsCommon.userModel.createPassword(
      roomFixture.user.email,
      roomFixture.user.password,
      roomFixture.user.firstName,
      roomFixture.user.lastName,
      (err, cUser) => {
        if (err) {
          return done(err);
        }

        user = cUser;
        smsCommon.userModel.createPassword(
          roomFixture.user2.email,
          roomFixture.user2.password,
          roomFixture.user2.firstName,
          roomFixture.user2.lastName,
          (err, cUser) => {
            if (err) {
              return done(err);
            }
            user2 = cUser;
            smsCommon.organizationModel.create({
              name: roomFixture.organization,
              owner: user,
              creator: user,
              members: [ user ],
              rooms: [],
              publicId: utils.uidGen(25)
            }, (err, cOrg) => {
              if (err) {
                done(err);
              }
              org = cOrg;
              done();
            });
          });
      });
  });

  it('createNew()', done => {
    smsCommon.roomModel.createNew(roomFixture.room.name, org, user, true, (err, cRoom) => {
      if (err) {
        return done(err);
      }
      expect(cRoom.publicId.length).to.equal(25);
      expect(cRoom.name).to.equal(roomFixture.room.name);
      expect(cRoom.creator._id).to.equal(user._id);
      expect(cRoom.owner._id).to.equal(user._id);
      expect(cRoom.members).to.have.lengthOf(1);
      expect(cRoom.members[0]._id).to.equal(user._id);
      room = cRoom;
      done();
    });
  });

  it('getAll()', done => {
    smsCommon.roomModel.getAll((err, fRooms) => {
      if (err) {
        return done(err);
      }
      expect(fRooms).to.be.an('array');
      done();
    });
  });

  it('getByIdFull()', done => {
    smsCommon.roomModel.getByIdFull(room._id, (err, fRoom) => {
      if (err) {
        return done(err);
      }
      expect(fRoom).to.not.be.undefined;
      expect(fRoom.creator.publicId).to.not.be.undefined;
      expect(fRoom.owner.publicId).to.not.be.undefined;
      expect(fRoom.members).to.have.lengthOf(1);
      expect(fRoom.members[0].publicId).to.equal(user.publicId);
      done();
    });
  });

  it('getByPublicId()', done => {
    smsCommon.roomModel.getByPublicId(room.publicId, (err, fRoom) => {
      if (err) {
        return done(err);
      }
      expect(fRoom).to.not.be.null;
      expect(fRoom._id).to.eql(room._id);
      expect(fRoom.creator.publicId).to.be.undefined;
      done();
    });
  });

  it('getByPublicIdFull()', done => {
    smsCommon.roomModel.getByPublicIdFull(room.publicId, (err, fRoom) => {
      if (err) {
        return done(err);
      }
      expect(fRoom).to.not.be.null;
      expect(fRoom._id).to.eql(room._id);
      expect(fRoom.creator.publicId).to.equal(user.publicId);
      done();
    });
  });

  it('inviteUser()', done => {
    room.inviteUser(user2, err => {
      if (err) {
        return done(err);
      }
      expect(room.members).to.have.lengthOf(2);
      expect(room.members[0]._id).to.equal(user._id);
      expect(room.members[1]._id).to.equal(user2._id);
      done();
    });
  });

  it('kickUser()', done => {
    room.kickUser(user2, function (err) {
      if (err) {
        return done(err);
      }
      expect(room.members).to.have.lengthOf(1);
      expect(room.members[0]._id).to.equal(user._id);
      done();
    });
  });

  it('safePrint()', () => {
    const ret = room.safePrint();
    expect(ret._id).to.be.undefined;
    expect(ret.__v).to.be.undefined;
    expect(ret.updateAt).to.be.undefined;
    expect(ret.private).to.be.undefined;
    expect(ret.members[0]._id).to.be.undefined;
  });

  it('safePrint()', (done) => {
    smsCommon.roomModel.getByPublicId(room.publicId, function (err, fRoom) {
      if (err) {
        done(err);
      }
      const ret = fRoom.safePrint();
      expect(ret._id).to.be.undefined;
      expect(ret.__v).to.be.undefined;
      expect(ret.updateAt).to.be.undefined;
      expect(ret.isPrivate).to.be.undefined;
      expect(ret.members).to.be.undefined;
      done();
    });
  });

  it('destroy()', function (done) {
    room.destroy(function (err) {
      if (err) {
        done(err);
      } else {
        smsCommon.roomModel.getByPublicId(room.publicId, function (err, fRoom) {
          if (err) {
            done(err);
          } else {
            expect(fRoom).to.be.null;
            done();
          }
        });
      }
    });
  });
});
