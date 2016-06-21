const smsCommon = require('../../');
const expect = require('chai').expect;
const accessTokenFixture = require('../fixtures/models/access-token.json');

var user;
var client;

describe('Testing access_token model', function () {
  before(function (done) {
    smsCommon.userModel.createNewPassword(accessTokenFixture.user.email,
      accessTokenFixture.user.password,
      accessTokenFixture.user.firstName,
      accessTokenFixture.user.lastName,
      function (err, cUser) {
        if (err) {
          done(err);
        } else {
          smsCommon.clientModel.createNew(accessTokenFixture.client.name,
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

  it('Should generated an access token', function (done) {
    smsCommon.accessTokenModel.createNew(client,
      user,
      accessTokenFixture.token.scopes,
      function (err, token) {
        if (err) {
          done(err);
        } else {
          expect(token.token.length).to.equal(256);
          expect(token.user._id).to.equal(user._id);
          expect(token.client._id).to.equal(client._id);
          done();
        }
      });
  });
});
