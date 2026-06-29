const { expect } = require("chai");
const sinon = require("sinon");
const proxyquire = require("proxyquire");
const httpStatus = require("http-status");

describe("Notification Service", () => {
  let sandbox;
  let NotificationStub;
  let DeviceTokenStub;
  let ApiErrorStub;
  let paginationStub;
  let loadTemplateStub;
  let sendSmsStub;
  let sendEmailStub;
  let sendPushStub;
  let service;

  const loadService = () => {
    delete require.cache[
      require.resolve("../../src/services/notification.service")
    ];

    return proxyquire("../../src/services/notification.service", {
      "../models": {
        db: {
          notification: NotificationStub,
          deviceToken: DeviceTokenStub,
        },
      },
      "../utils": {
        pagination: paginationStub,
        loadTemplate: loadTemplateStub,
      },
      "../utils/ApiError": ApiErrorStub,
      "../publishers": {
        sendSmsNotification: sendSmsStub,
        sendEmailNotification: sendEmailStub,
        sendPushNotification: sendPushStub,
      },
    });
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    NotificationStub = {
      findAll: sandbox.stub(),
      create: sandbox.stub(),
      update: sandbox.stub(),
    };

    DeviceTokenStub = {
      findAll: sandbox.stub(),
    };

    paginationStub = sandbox.stub();
    loadTemplateStub = sandbox.stub();

    ApiErrorStub = sandbox.stub();

    sendSmsStub = sandbox.stub();
    sendEmailStub = sandbox.stub();
    sendPushStub = sandbox.stub();

    process.env.STORED_NOTICE = "true";
    service = loadService();
  });

  afterEach(() => sandbox.restore());

  describe("getNotifications", () => {
    it("should throw NOT_FOUND if STORED_NOTICE=false", async () => {
      process.env.STORED_NOTICE = "false";
      service = loadService();

      const fakeError = new Error("NOT_FOUND");
      ApiErrorStub.returns(fakeError);

      try {
        await service.getNotifications("U1");
        throw new Error("SHOULD_FAIL");
      } catch (err) {
        expect(ApiErrorStub.calledOnce).to.be.true;
        expect(err).to.equal(fakeError);
      }
    });

    it("should return paginated notifications", async () => {
      paginationStub.resolves({ data: ["A"], total: 1 });

      const result = await service.getNotifications("U1", "title", 1, 10);

      expect(paginationStub.calledOnce).to.be.true;
      expect(result.data).to.deep.equal(["A"]);
    });
  });

  describe("sendNotification", () => {
    it("should send SMS", async () => {
      const body = {
        types: ["sms"],
        to: "+123",
        body: "Hello",
        template: "NONE",
      };

      await service.sendNotification(body);

      expect(sendSmsStub.calledOnce).to.be.true;
      expect(sendSmsStub.firstCall.args[0]).to.deep.equal({
        to: "+123",
        message: "Hello",
      });
    });

    it("should send EMAIL with template", async () => {
      loadTemplateStub.resolves("<html></html>");

      const body = {
        types: ["email"],
        to: "a@b.com",
        body: "Body",
        title: "Hello",
        template: "welcome",
        metadata: { x: 1 },
      };

      await service.sendNotification(body);

      expect(loadTemplateStub.calledOnce).to.be.true;
      expect(sendEmailStub.calledOnce).to.be.true;

      expect(sendEmailStub.firstCall.args[0]).to.deep.equal({
        to: "a@b.com",
        subject: "Hello",
        body: "Body",
        html: "<html></html>",
      });
    });

    it("should send PUSH to all devices", async () => {
      DeviceTokenStub.findAll.resolves([
        { notificationToken: "T1" },
        { notificationToken: "T2" },
      ]);

      const body = {
        userId: "U1",
        types: ["push"],
        title: "Hi",
        body: "World",
        metadata: { a: 1 },
        template: "NONE",
      };

      await service.sendNotification(body);

      expect(DeviceTokenStub.findAll.calledOnce).to.be.true;

      expect(sendPushStub.callCount).to.equal(2);
      expect(sendPushStub.getCall(0).args[0]).to.deep.equal({
        to: "T1",
        title: "Hi",
        body: "World",
        metadata: { a: 1 },
      });
      expect(sendPushStub.getCall(1).args[0]).to.deep.equal({
        to: "T2",
        title: "Hi",
        body: "World",
        metadata: { a: 1 },
      });
    });

    it("should store notification when STORED_NOTICE=true and body.isStored=true", async () => {
      process.env.STORED_NOTICE = "true";
      service = loadService();

      const body = {
        types: ["sms"],
        to: "+123",
        body: "Hello",
        template: "NONE",
        isStored: true,
      };

      await service.sendNotification(body);

      expect(NotificationStub.create.calledOnceWith(body)).to.be.true;
    });

    it("should NOT store notification when STORED_NOTICE=false", async () => {
      process.env.STORED_NOTICE = "false";
      service = loadService();

      const body = {
        types: ["sms"],
        to: "+123",
        body: "Hello",
        template: "NONE",
        isStored: true,
      };

      await service.sendNotification(body);

      expect(NotificationStub.create.called).to.be.false;
    });
  });

  describe("seenNotifications", () => {
    it("should throw NOT_FOUND if STORED_NOTICE=false", async () => {
      process.env.STORED_NOTICE = "false";
      service = loadService();

      const fakeError = new Error("NOT_FOUND");
      ApiErrorStub.returns(fakeError);

      try {
        await service.seenNotifications("U1", [1]);
        throw new Error("SHOULD_FAIL");
      } catch (err) {
        expect(ApiErrorStub.calledOnce).to.be.true;
        expect(err).to.equal(fakeError);
      }
    });

    it("should update notifications as seen", async () => {
      process.env.STORED_NOTICE = "true";
      service = loadService();

      NotificationStub.update.resolves([2]);

      const result = await service.seenNotifications("U1", [10, 20]);

      expect(NotificationStub.update.calledOnce).to.be.true;
      expect(result).to.deep.equal([2]);
    });
  });
});
