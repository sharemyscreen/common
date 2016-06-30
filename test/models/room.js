'use strict';

const expect = require('chai').expect;
const smsCommon = require('../../');
const roomFixture = require('../fixtures/models/room.json');

let user;
let user2;
let user3;
let room;

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
            smsCommon.userModel.createPassword(
              roomFixture.user3.email,
              roomFixture.user3.password,
              roomFixture.user3.firstName,
              roomFixture.user3.lastName,
              (err, cUser) => {
                if (err) {
                  return done(err);
                }

                user3 = cUser;
                done();
              });
          });
      });
  });

  it('createNew()', done => {
    smsCommon.roomModel.createNew(roomFixture.room.name, user, [user2], (err, cRoom) => {
      if (err) {
        return done(err);
      }
      expect(cRoom.publicId.length).to.equal(25);
      expect(cRoom.name).to.equal(roomFixture.room.name);
      expect(cRoom.creator._id).to.equal(user._id);
      expect(cRoom.owner._id).to.equal(user._id);
      expect(cRoom.members.length).to.equal(2);
      expect(cRoom.members[0]._id).to.equal(user._id);
      expect(cRoom.members[1]._id).to.equal(user2._id);
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
      expect(fRooms).to.have.lengthOf(1);
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
      done();
    });
  });

  it('inviteUser()', done => {
    room.inviteUser(user3, err => {
      if (err) {
        return done(err);
      }
      expect(room.members).to.have.lengthOf(3);
      expect(room.members[0]._id).to.equal(user._id);
      expect(room.members[1]._id).to.equal(user2._id);
      expect(room.members[2]._id).to.equal(user3._id);
      done();
    });
  });

  it('kickUser()', done => {
    room.kickUser(user2, function (err) {
      if (err) {
        return done(err);
      }
      expect(room.members).to.have.lengthOf(2);
      expect(room.members[0]._id).to.equal(user._id);
      expect(room.members[1]._id).to.equal(user3._id);
      done();
    });
  });
});
