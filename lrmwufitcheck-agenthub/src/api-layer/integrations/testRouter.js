const express = require("express");
const router = express.Router();

const { HttpServerError, NotFoundError, HttpError } = require("common");

const { getIntegrationClient, testProvider } = require("./index.js");

router.get("/testconnect/:provider", async (req, res, next) => {
  const provider = req.params.provider;

  if (!provider) {
    return next(new BadRequestError("Provider should be given."));
  }

  try {
    const client = await getIntegrationClient(provider);

    if (!client) {
      return next(new NotFoundError("Provider is not found"));
    }

    const connectResult = await client._init();

    await client._close();

    res.status(200).send({ result: connectResult });
  } catch (err) {
    return next(
      err instanceof HttpError
        ? err
        : new HttpServerError(
            `Integration Connect Test Failed: ${err.toString()}`,
          ),
    );
  }
});

router.get("/testall/:provider", async (req, res, next) => {
  const provider = req.params.provider;

  if (!provider) {
    return next(new BadRequestError("Provider should be given."));
  }

  try {
    const client = await getIntegrationClient(provider);

    if (!client) {
      return next(new NotFoundError("Provider is not found"));
    }
    await client._close();

    const testResult = await testProvider(provider);

    res.status(200).send({ result: testResult });
  } catch (err) {
    return next(
      err instanceof HttpError
        ? err
        : new HttpServerError(`Integration All Test Failed: ${err.toString()}`),
    );
  }
});

module.exports = router;
