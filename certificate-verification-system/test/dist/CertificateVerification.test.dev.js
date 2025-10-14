"use strict";

var _chai = _interopRequireDefault(require("chai"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var CertificateVerification = artifacts.require("CertificateVerification");

contract("CertificateVerification", function (accounts) {
  var instance; // Choose a few accounts from Ganache

  var owner = accounts[0];
  var nonOwner = accounts[1]; // You might use this later for testing restrictions
  // Use a dummy certificate data

  var studentName = "Alice";
  var course = "Computer Science";
  var institution = "University of Blockchain";
  var issueDate = 1672531200; // Example UNIX timestamp

  before(function _callee() {
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(CertificateVerification.deployed());

          case 2:
            instance = _context.sent;

          case 3:
          case "end":
            return _context.stop();
        }
      }
    });
  });
  describe("Deployment", function () {
    it("should deploy the contract and have a valid address", function _callee2() {
      return regeneratorRuntime.async(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              expect(instance.address).to.not.be.empty;
              expect(instance.address).to.match(/^0x[a-fA-F0-9]{40}$/);

            case 2:
            case "end":
              return _context2.stop();
          }
        }
      });
    });
  });
  describe("Issuing a Certificate", function () {
    var certHash;
    it("should issue a certificate successfully", function _callee3() {
      var tx;
      return regeneratorRuntime.async(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return regeneratorRuntime.awrap(instance.issueCertificate(studentName, course, institution, issueDate, {
                from: owner
              }));

            case 2:
              tx = _context3.sent;
              // Extract the certificate hash from the event logs (assuming the event is emitted)
              certHash = tx.logs[0].args.certHash;
              expect(certHash).to.exist;
              console.log("Issued certificate hash:", certHash);

            case 6:
            case "end":
              return _context3.stop();
          }
        }
      });
    });
    it("should not allow issuing the same certificate twice", function _callee4() {
      return regeneratorRuntime.async(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              _context4.next = 3;
              return regeneratorRuntime.awrap(instance.issueCertificate(studentName, course, institution, issueDate, {
                from: owner
              }));

            case 3:
              assert.fail("Re-issuing the same certificate did not throw an error");
              _context4.next = 9;
              break;

            case 6:
              _context4.prev = 6;
              _context4.t0 = _context4["catch"](0);
              expect(_context4.t0.message).to.include("Certificate already exists");

            case 9:
            case "end":
              return _context4.stop();
          }
        }
      }, null, null, [[0, 6]]);
    });
    describe("Verifying a Certificate", function () {
      it("should verify a certificate and return correct details", function _callee5() {
        var result;
        return regeneratorRuntime.async(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return regeneratorRuntime.awrap(instance.verifyCertificate(certHash));

              case 2:
                result = _context5.sent;
                // result is a tuple: [isValid, studentName, course, institution, issueDate]
                expect(result[0]).to.be["true"];
                expect(result[1]).to.equal(studentName);
                expect(result[2]).to.equal(course);
                expect(result[3]).to.equal(institution);
                expect(result[4].toNumber()).to.equal(issueDate);

              case 8:
              case "end":
                return _context5.stop();
            }
          }
        });
      });
      it("should fail to verify a non-existent certificate", function _callee6() {
        var fakeHash;
        return regeneratorRuntime.async(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                // Use a random hash (or a hash that we know wasn't issued)
                fakeHash = web3.utils.soliditySha3("fakeCertificate");
                _context6.prev = 1;
                _context6.next = 4;
                return regeneratorRuntime.awrap(instance.verifyCertificate(fakeHash));

              case 4:
                assert.fail("Verifying a non-existent certificate did not throw an error");
                _context6.next = 10;
                break;

              case 7:
                _context6.prev = 7;
                _context6.t0 = _context6["catch"](1);
                expect(_context6.t0.message).to.include("Certificate not found");

              case 10:
              case "end":
                return _context6.stop();
            }
          }
        }, null, null, [[1, 7]]);
      });
    });
    describe("Revoking a Certificate", function () {
      it("should revoke a certificate successfully", function _callee7() {
        var tx, result;
        return regeneratorRuntime.async(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _context7.next = 2;
                return regeneratorRuntime.awrap(instance.revokeCertificate(certHash, {
                  from: owner
                }));

              case 2:
                tx = _context7.sent;
                _context7.next = 5;
                return regeneratorRuntime.awrap(instance.verifyCertificate(certHash));

              case 5:
                result = _context7.sent;
                expect(result[0]).to.be["false"];

              case 7:
              case "end":
                return _context7.stop();
            }
          }
        });
      });
      it("should not revoke an already revoked certificate", function _callee8() {
        return regeneratorRuntime.async(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _context8.prev = 0;
                _context8.next = 3;
                return regeneratorRuntime.awrap(instance.revokeCertificate(certHash, {
                  from: owner
                }));

              case 3:
                assert.fail("Revoking an already revoked certificate did not throw an error");
                _context8.next = 9;
                break;

              case 6:
                _context8.prev = 6;
                _context8.t0 = _context8["catch"](0);
                expect(_context8.t0.message).to.include("Certificate does not exist or is already revoked");

              case 9:
              case "end":
                return _context8.stop();
            }
          }
        }, null, null, [[0, 6]]);
      });
    });
  });
});