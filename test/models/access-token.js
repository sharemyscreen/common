const smsCommon = require('../../');
const expect = require('chai').expect;
const accessTokenFixture = require('../fixtures/models/access-token.json');

var user;
var client;
var token;

describe('Testing access_token model', function () {
  before(function (done) {
    smsCommon.userModel.createPassword(accessTokenFixture.user.email,
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

  it('createNew()', function (done) {
    smsCommon.accessTokenModel.createNew(client,
      user,
      accessTokenFixture.token.scopes,
      function (err, cToken) {
        if (err) {
          done(err);
        } else {
          expect(cToken.token.length).to.equal(256);
          expect(cToken.user._id).to.equal(user._id);
          expect(cToken.client._id).to.equal(client._id);
          token = cToken;
          done();
        }
      });
  });

  it('getToken()', function (done) {
    smsCommon.accessTokenModel.getToken(token.token, function (err, fToken) {
      if (err) {
        done(err);
      } else {
        expect(fToken).to.not.be.null;
        expect(fToken._id.toString()).to.equal(token._id.toString());
        done();
      }
    });
  });

  it('get duration', function (done) {
    expect(token.duration).to.equal(3600);
    done();
  });

  it('get lenght', function (done) {
    expect(token.length).to.equal(256);
    done();
  });

  it('get type', function (done) {
    expect(token.type).to.equal('bearer');
    done();
  });
});
