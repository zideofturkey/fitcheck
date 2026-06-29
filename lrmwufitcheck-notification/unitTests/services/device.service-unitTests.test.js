const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const httpStatus = require("http-status");

describe("Device Service", () => {
  let sandbox;
  let DeviceTokenStub;
  let ApiErrorStub;
  let service;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Stubs
    DeviceTokenStub = {
      findOne: sandbox.stub(),
      create: sandbox.stub(),
    };

    ApiErrorStub = sandbox.stub();

    service = proxyquire("../../src/services/device.service", {
      "../models": {
        db: { deviceToken: DeviceTokenStub },
      },
      "../utils/ApiError": ApiErrorStub,
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("saveDevice", () => {
    it("should save a new device when not existing", async () => {
      const body = {
        userId: "U1",
        deviceId: "D1",
        token: "AAAA",
      };

      DeviceTokenStub.findOne.resolves(null);

      const createdRecord = { id: 5, ...body };
      DeviceTokenStub.create.resolves(createdRecord);

      const result = await service.saveDevice(body);

      expect(DeviceTokenStub.findOne.calledOnce).to.be.true;
      expect(DeviceTokenStub.findOne.firstCall.args[0]).to.deep.equal({
        where: { userId: "U1", deviceId: "D1" },
      });

      expect(DeviceTokenStub.create.calledOnceWith(body)).to.be.true;
      expect(result).to.deep.equal(createdRecord);
    });

    it("should throw ApiError if device already exists", async () => {
      const body = {
        userId: "U1",
        deviceId: "D1",
      };

      DeviceTokenStub.findOne.resolves({ id: 99 });

      const fakeApiError = new Error("BAD");
      ApiErrorStub.returns(fakeApiError);

      try {
        await service.saveDevice(body);
        throw new Error("Should have thrown");
      } catch (err) {
        expect(ApiErrorStub.calledOnce).to.be.true;

        const args = ApiErrorStub.firstCall.args;
        expect(args[0]).to.equal(httpStatus.BAD_REQUEST);
        expect(args[1]).to.equal("Device already registered");

        expect(err).to.equal(fakeApiError);
      }
    });
  });

  describe("removeDevice", () => {
    it("should remove device if exists", async () => {
      const destroyStub = sandbox.stub();
      const mockDevice = { destroy: destroyStub };

      DeviceTokenStub.findOne.resolves(mockDevice);

      await service.removeDevice("U1", "D1");

      expect(DeviceTokenStub.findOne.calledOnce).to.be.true;
      expect(DeviceTokenStub.findOne.firstCall.args[0]).to.deep.equal({
        where: { userId: "U1", deviceId: "D1" },
      });

      expect(destroyStub.calledOnce).to.be.true;
    });

    it("should throw ApiError if device not found", async () => {
      DeviceTokenStub.findOne.resolves(null);

      const fakeApiError = new Error("NOT_FOUND");
      ApiErrorStub.returns(fakeApiError);

      try {
        await service.removeDevice("U1", "D1");
        throw new Error("Should have thrown");
      } catch (err) {
        expect(ApiErrorStub.calledOnce).to.be.true;

        const args = ApiErrorStub.firstCall.args;
        expect(args[0]).to.equal(httpStatus.NOT_FOUND);
        expect(args[1]).to.equal("Device not found");

        expect(err).to.equal(fakeApiError);
      }
    });
  });
});
