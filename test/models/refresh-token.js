const smsCommon = require('../../');
const expect = require('chai').expect;
const refreshTokenFixture = require('../fixtures/models/refresh-token.json');

var user;
var client;

describe('Testing refresh_token model', function () {
  before(function (done) {
    smsCommon.userModel.createNewPassword(refreshTokenFixture.user.email,
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

  it('Should generated a refresh token', function (done) {
    smsCommon.refreshTokenModel.createNew(client,
      user,
      refreshTokenFixture.token.scopes,
      function (err, cToken) {
        if (err) {
          done(err);
        } else {
          expect(cToken.token.length).to.equal(256);
          expect(cToken.user._id).to.equal(user._id);
          expect(cToken.client._id).to.equal(client._id);
          done();
        }
      });
  });
});
