const smsCommon = require('../../');
const should = require('should');
const clientFixture = require("../fixtures/models/client.json");


describe("Testing Client model", function () {

	it("Should create a client", function (done) {

		smsCommon.Client.createNew(clientFixture.name, function (err, cClient) {
			if (err) {
				done(err);
			}
			else {

				cClient.name.should.equal(clientFixture.name);

				cClient.key.should.not.be.null();

				cClient.secret.should.not.be.null();

				cClient.trusted.should.equal(false);

				done();
			}

		});
	});
});
