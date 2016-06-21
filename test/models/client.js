const smsCommon = require('../../');
const expect = require('chai').expect;
const clientFixture = require('../fixtures/models/client.json');

describe('Testing Client model', function () {
  it('Should create a client', function (done) {
    smsCommon.clientModel.createNew(clientFixture.name, function (err, cClient) {
      if (err) {
        done(err);
      }	else {
        expect(cClient.name).to.equal(clientFixture.name);
        expect(cClient.key).to.not.be.null;
        expect(cClient.secret).to.not.be.null;
        expect(cClient.trusted).to.be.false;
        done();
      }
    });
  });
});
