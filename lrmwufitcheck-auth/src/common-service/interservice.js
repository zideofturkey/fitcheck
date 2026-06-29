const { sendRestRequest, createM2MToken, md5 } = require("common");

/**
 * Inter-service communication helper
 * Provides functions to call other services' Business APIs and Edge Controllers using M2M tokens
 */

const InterService = {
  /**
   * Call auth service - getUser API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthGetUser(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/users/:userId";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - updateUser API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthUpdateUser(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/users/:userId";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - updateProfile API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthUpdateProfile(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/profile";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - createUser API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthCreateUser(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/users";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "POST",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "POST",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - deleteUser API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthDeleteUser(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/users/:userId";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "DELETE",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "DELETE",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - archiveProfile API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthArchiveProfile(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/archiveprofile";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "DELETE",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "DELETE",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - listUsers API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthListUsers(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/users";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - searchUsers API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthSearchUsers(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/searchusers";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - updateUserRole API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthUpdateUserRole(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/userrole/:userId";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - updateUserPassword API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthUpdateUserPassword(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/userpassword";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - updateUserPasswordByAdmin API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthUpdateUserPasswordByAdmin(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/userpasswordbyadmin/:userId";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - getBriefUser API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthGetBriefUser(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/briefuser/:userId";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - streamTest API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthStreamTest(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/streamtest/:userId";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - getUserAvatarsFile API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthGetUserAvatarsFile(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/useravatarsfiles/:userAvatarsFileId";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - listUserAvatarsFiles API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthListUserAvatarsFiles(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/useravatarsfiles";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - deleteUserAvatarsFile API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthDeleteUserAvatarsFile(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/useravatarsfiles/:userAvatarsFileId";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "DELETE",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "DELETE",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - _fetchListUserAvatarsFile API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthFetchListUserAvatarsFile(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/_fetchlistuseravatarsfile";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - m2mCreateUser edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthM2mCreateUser(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/user/create";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "POST",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "POST",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - m2mBulkCreateUser edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthM2mBulkCreateUser(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/user/bulk-create";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "POST",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "POST",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - m2mUpdateUserById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthM2mUpdateUserById(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/user/update/:id";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - m2mDeleteUserById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthM2mDeleteUserById(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/user/delete/:id";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "DELETE",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "DELETE",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - m2mUpdateUserByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthM2mUpdateUserByQuery(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/user/update-by-query";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - m2mDeleteUserByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthM2mDeleteUserByQuery(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/user/delete-by-query";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "DELETE",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "DELETE",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - m2mUpdateUserByIdList edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthM2mUpdateUserByIdList(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/user/update-by-id-list";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - m2mCreateUserAvatarsFile edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthM2mCreateUserAvatarsFile(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/useravatarsfile/create";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "POST",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "POST",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - m2mBulkCreateUserAvatarsFile edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthM2mBulkCreateUserAvatarsFile(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/useravatarsfile/bulk-create";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "POST",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "POST",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - m2mUpdateUserAvatarsFileById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthM2mUpdateUserAvatarsFileById(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/useravatarsfile/update/:id";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - m2mDeleteUserAvatarsFileById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthM2mDeleteUserAvatarsFileById(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/useravatarsfile/delete/:id";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "DELETE",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "DELETE",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - m2mUpdateUserAvatarsFileByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthM2mUpdateUserAvatarsFileByQuery(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/useravatarsfile/update-by-query";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - m2mDeleteUserAvatarsFileByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthM2mDeleteUserAvatarsFileByQuery(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/useravatarsfile/delete-by-query";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "DELETE",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "DELETE",
      options.serializer || null,
    );
  },

  /**
   * Call auth service - m2mUpdateUserAvatarsFileByIdList edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAuthM2mUpdateUserAvatarsFileByIdList(params = {}, options = {}) {
    const serviceUrl = process.env.AUTH_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for auth. Please set AUTH_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/useravatarsfile/update-by-id-list";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - getAgentOverride API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubGetAgentOverride(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/agentoverride/:sys_agentOverrideId";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - listAgentOverrides API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubListAgentOverrides(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/agentoverrides";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - createAgentOverride API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubCreateAgentOverride(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/agentoverride";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "POST",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "POST",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - updateAgentOverride API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubUpdateAgentOverride(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/agentoverride/:sys_agentOverrideId";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - deleteAgentOverride API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubDeleteAgentOverride(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/agentoverride/:sys_agentOverrideId";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "DELETE",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "DELETE",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - listToolCatalog API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubListToolCatalog(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/toolcatalog";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - getToolCatalogEntry API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubGetToolCatalogEntry(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/toolcatalogentry/:sys_toolCatalogId";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - listAgentExecutions API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubListAgentExecutions(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/agentexecutions";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - getAgentExecution API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubGetAgentExecution(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") +
      "/v1/agentexecution/:sys_agentExecutionId";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - _fetchListSys_agentOverride API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubFetchListSysagentOverride(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/_fetchlistsys_agentoverride";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - _fetchListSys_agentExecution API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubFetchListSysagentExecution(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/_fetchlistsys_agentexecution";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - _fetchListSys_toolCatalog API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubFetchListSystoolCatalog(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/_fetchlistsys_toolcatalog";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "GET",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the API
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "GET",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mCreateSys_agentOverride edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mCreateSysagentOverride(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_agentoverride/create";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "POST",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "POST",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mBulkCreateSys_agentOverride edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mBulkCreateSysagentOverride(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_agentoverride/bulk-create";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "POST",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "POST",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mUpdateSys_agentOverrideById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mUpdateSysagentOverrideById(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_agentoverride/update/:id";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mDeleteSys_agentOverrideById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mDeleteSysagentOverrideById(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_agentoverride/delete/:id";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "DELETE",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "DELETE",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mUpdateSys_agentOverrideByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mUpdateSysagentOverrideByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_agentoverride/update-by-query";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mDeleteSys_agentOverrideByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mDeleteSysagentOverrideByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_agentoverride/delete-by-query";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "DELETE",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "DELETE",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mUpdateSys_agentOverrideByIdList edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mUpdateSysagentOverrideByIdList(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") +
      "/m2m/sys_agentoverride/update-by-id-list";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mCreateSys_agentExecution edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mCreateSysagentExecution(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_agentexecution/create";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "POST",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "POST",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mBulkCreateSys_agentExecution edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mBulkCreateSysagentExecution(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_agentexecution/bulk-create";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "POST",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "POST",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mUpdateSys_agentExecutionById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mUpdateSysagentExecutionById(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_agentexecution/update/:id";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mDeleteSys_agentExecutionById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mDeleteSysagentExecutionById(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_agentexecution/delete/:id";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "DELETE",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "DELETE",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mUpdateSys_agentExecutionByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mUpdateSysagentExecutionByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_agentexecution/update-by-query";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mDeleteSys_agentExecutionByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mDeleteSysagentExecutionByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_agentexecution/delete-by-query";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "DELETE",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "DELETE",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mUpdateSys_agentExecutionByIdList edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mUpdateSysagentExecutionByIdList(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") +
      "/m2m/sys_agentexecution/update-by-id-list";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mCreateSys_toolCatalog edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mCreateSystoolCatalog(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/sys_toolcatalog/create";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "POST",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "POST",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mBulkCreateSys_toolCatalog edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mBulkCreateSystoolCatalog(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_toolcatalog/bulk-create";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "POST",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "POST",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mUpdateSys_toolCatalogById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mUpdateSystoolCatalogById(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_toolcatalog/update/:id";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mDeleteSys_toolCatalogById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mDeleteSystoolCatalogById(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_toolcatalog/delete/:id";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "DELETE",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "DELETE",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mUpdateSys_toolCatalogByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mUpdateSystoolCatalogByQuery(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_toolcatalog/update-by-query";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mDeleteSys_toolCatalogByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mDeleteSystoolCatalogByQuery(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_toolcatalog/delete-by-query";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "DELETE",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "DELETE",
      options.serializer || null,
    );
  },

  /**
   * Call agentHub service - m2mUpdateSys_toolCatalogByIdList edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callAgentHubM2mUpdateSystoolCatalogByIdList(params = {}, options = {}) {
    const serviceUrl = process.env.AGENTHUB_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for agentHub. Please set AGENTHUB_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/sys_toolcatalog/update-by-id-list";

    // Replace path parameters if provided in params
    if (params.pathParams) {
      for (const [key, value] of Object.entries(params.pathParams)) {
        fullUrl = fullUrl.replace(`:${key}`, encodeURIComponent(value));
        fullUrl = fullUrl.replace(`{${key}}`, encodeURIComponent(value));
      }
    }

    // Prepare request payload for M2M token hash
    const requestPayload = {
      url: fullUrl,
      method: "PATCH",
      body: params.body || null,
      query: params.query || null,
    };
    const requestHash = md5(JSON.stringify(requestPayload));

    // Create M2M token (skipped in test mode)
    const m2mToken = await createM2MToken(
      { sender: `${process.env.SERVICE_SHORT_NAME || "service"}-service` },
      { requestPayloadHash: requestHash, expiresIn: "15m" },
    );

    // Prepare headers with M2M token (only if created, not in test mode).
    // When the caller passed `options.userBearer` (from an
    // InterserviceCallAction with forwardCallerToken:true), forward
    // the caller's session token as `Authorization: Bearer <token>`
    // so the downstream service's auth middleware picks it up and
    // runs the call under the user's identity. M2M rides alongside
    // for server-to-server trust; downstream auth typically prefers
    // the user bearer when both are present.
    const headers = {
      ...(m2mToken ? { "x-m2m-token": m2mToken } : {}),
      ...(options.userBearer
        ? { authorization: `Bearer ${options.userBearer}` }
        : {}),
      ...(options.headers || {}),
    };

    // Call the edge controller
    return await sendRestRequest(
      fullUrl,
      null, // bearer (not used, M2M token is in headers)
      headers,
      options.cookies || null,
      params.body || null,
      params.query || null,
      "PATCH",
      options.serializer || null,
    );
  },
};

module.exports = InterService;
