const smsCommon = require('../../');
const expect = require('chai').expect;
const refreshTokenFixture = require('../fixtures/models/refresh-token.json');

var user;
var client;
var token;

describe('Testing refresh_token model', function () {
  before(function (done) {
    smsCommon.userModel.createPassword(refreshTokenFixture.user.email,
      refreshTokenFixture.user.password,
      refreshTokenFixture.user.firstName,
      refreshTokenFixture.user.lastName,
      function (err, cUser) {
        if (err) {
          done(err);
        } else {
          smsCommon.clientModel.createNew(refreshTokenFixture.client.name,
            function (err, cClient) {
              if (err) {
                done(err);
              } else {
                user = cUser;
                client = cClient;
                done();
              }
            });
        }
      });
  });

  it('createNew()', function (done) {
    smsCommon.refreshTokenModel.createNew(client,
      user,
      function (err, cToken) {
        if (err) {
          done(err);
        } else {
          expect(cToken.token.length).to.equal(256);
          expect(cToken.user._id).to.equal(user._id);
          expect(cToken.client._id).to.equal(client._id);
          expect(cToken.revoked).to.be.false;
          token = cToken;
          done();
        }
      });
  });

  it('createFix()', function (done) {
    smsCommon.refreshTokenModel.createFix(client,
      user,
      refreshTokenFixture.token,
      function (err, cToken) {
        if (err) {
          done(err);
        } else {
          expect(cToken.token).to.equal(refreshTokenFixture.token);
          expect(cToken.user._id).to.eql(user._id);
          expect(cToken.client._id).to.eql(client._id);
          expect(cToken.revoked).to.be.false;
          done();
        }
      });
  });

  it('getByToken()', function (done) {
    smsCommon.refreshTokenModel.getByToken(token.token, function (err, fToken) {
      if (err) {
        done(err);
      } else {
        expect(fToken).to.not.be.null;
        expect(fToken._id).to.eql(token._id);
        done();
      }
    });
  });

  it('getByClientToken()', function (done) {
    smsCommon.refreshTokenModel.getByClientToken(client, token.token, function (err, fToken) {
      if (err) {
        done(err);
      } else {
        expect(fToken).to.not.be.null;
        expect(fToken._id).to.eql(token._id);
        done();
      }
    });
  });

  it('revoke()', function (done) {
    token.revoke(function (err) {
      if (err) {
        done(err);
      } else {
        expect(token.revoked).to.be.true;
        done();
      }
    });
  });

  it('get duration', function (done) {
    expect(token.duration).to.equal(24 * 3600);
    done();
  });

  it('get lenght', function (done) {
    expect(token.length).to.equal(256);
    done();
  });
});
