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
   * Call invitationCenter service - createInviteLink API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterCreateInviteLink(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/invite-links";

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
   * Call invitationCenter service - activateInviteLink API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterActivateInviteLink(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/invite-links/:inviteLinkId/activate";

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
   * Call invitationCenter service - revokeInviteLink API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterRevokeInviteLink(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/invite-links/:inviteLinkId/revoke";

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
   * Call invitationCenter service - deliverInviteEmail API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterDeliverInviteEmail(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/invite-links/:inviteLinkId/deliver";

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
   * Call invitationCenter service - validateInviteCode API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterValidateInviteCode(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/invite-links/validate";

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
   * Call invitationCenter service - consumeInviteLink API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterConsumeInviteLink(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/invite-links/:inviteLinkId/consume";

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
   * Call invitationCenter service - getInviteLinkByCode API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterGetInviteLinkByCode(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/invite-links/by-code/:inviteCode";

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
   * Call invitationCenter service - getInviteLink API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterGetInviteLink(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/invite-links/:inviteLinkId";

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
   * Call invitationCenter service - listInviteLinks API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterListInviteLinks(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/invite-links";

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
   * Call invitationCenter service - listInviteAudits API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterListInviteAudits(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/invite-audits";

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
   * Call invitationCenter service - _fetchListInviteLink API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterFetchListInviteLink(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/_fetchlistinvitelink";

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
   * Call invitationCenter service - _fetchListInviteAudit API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterFetchListInviteAudit(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/_fetchlistinviteaudit";

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
   * Call invitationCenter service - m2mCreateInviteLink edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterM2mCreateInviteLink(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/invitelink/create";

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
   * Call invitationCenter service - m2mBulkCreateInviteLink edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterM2mBulkCreateInviteLink(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/invitelink/bulk-create";

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
   * Call invitationCenter service - m2mUpdateInviteLinkById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterM2mUpdateInviteLinkById(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/invitelink/update/:id";

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
   * Call invitationCenter service - m2mDeleteInviteLinkById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterM2mDeleteInviteLinkById(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/invitelink/delete/:id";

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
   * Call invitationCenter service - m2mUpdateInviteLinkByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterM2mUpdateInviteLinkByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/invitelink/update-by-query";

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
   * Call invitationCenter service - m2mDeleteInviteLinkByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterM2mDeleteInviteLinkByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/invitelink/delete-by-query";

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
   * Call invitationCenter service - m2mUpdateInviteLinkByIdList edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterM2mUpdateInviteLinkByIdList(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/invitelink/update-by-id-list";

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
   * Call invitationCenter service - m2mCreateInviteAudit edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterM2mCreateInviteAudit(params = {}, options = {}) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/inviteaudit/create";

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
   * Call invitationCenter service - m2mBulkCreateInviteAudit edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterM2mBulkCreateInviteAudit(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/inviteaudit/bulk-create";

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
   * Call invitationCenter service - m2mUpdateInviteAuditById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterM2mUpdateInviteAuditById(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/inviteaudit/update/:id";

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
   * Call invitationCenter service - m2mDeleteInviteAuditById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterM2mDeleteInviteAuditById(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/inviteaudit/delete/:id";

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
   * Call invitationCenter service - m2mUpdateInviteAuditByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterM2mUpdateInviteAuditByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/inviteaudit/update-by-query";

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
   * Call invitationCenter service - m2mDeleteInviteAuditByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterM2mDeleteInviteAuditByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/inviteaudit/delete-by-query";

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
   * Call invitationCenter service - m2mUpdateInviteAuditByIdList edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callInvitationCenterM2mUpdateInviteAuditByIdList(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.INVITATIONCENTER_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for invitationCenter. Please set INVITATIONCENTER_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/inviteaudit/update-by-id-list";

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
   * Call nutritionLibrary service - setMacroTarget API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibrarySetMacroTarget(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/macro-targets";

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
   * Call nutritionLibrary service - getMyMacroTarget API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryGetMyMacroTarget(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/macro-targets/me";

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
   * Call nutritionLibrary service - createFoodItem API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryCreateFoodItem(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/food-items";

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
   * Call nutritionLibrary service - getFoodItem API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryGetFoodItem(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/food-items/:foodItemId";

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
   * Call nutritionLibrary service - listFoodItems API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryListFoodItems(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/food-items";

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
   * Call nutritionLibrary service - updateFoodItem API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryUpdateFoodItem(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/food-items/:foodItemId";

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
   * Call nutritionLibrary service - deleteFoodItem API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryDeleteFoodItem(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/food-items/:foodItemId";

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
   * Call nutritionLibrary service - createPresetMeal API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryCreatePresetMeal(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/preset-meals";

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
   * Call nutritionLibrary service - getPresetMeal API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryGetPresetMeal(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/preset-meals/:presetMealId";

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
   * Call nutritionLibrary service - listPresetMeals API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryListPresetMeals(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/preset-meals";

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
   * Call nutritionLibrary service - updatePresetMeal API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryUpdatePresetMeal(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/preset-meals/:presetMealId";

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
   * Call nutritionLibrary service - deletePresetMeal API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryDeletePresetMeal(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/preset-meals/:presetMealId";

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
   * Call nutritionLibrary service - addPresetLine API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryAddPresetLine(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/preset-meals/:presetMealId/lines";

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
   * Call nutritionLibrary service - listPresetLines API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryListPresetLines(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/preset-meals/:presetMealId/lines";

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
   * Call nutritionLibrary service - deletePresetLine API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryDeletePresetLine(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") +
      "/v1/preset-meals/:presetMealId/lines/:presetLineId";

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
   * Call nutritionLibrary service - getPresetMealForLogging API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryGetPresetMealForLogging(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") +
      "/v1/preset-meals/:presetMealId/for-logging";

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
   * Call nutritionLibrary service - getFoodItemForLogging API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryGetFoodItemForLogging(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/food-items/:foodItemId/for-logging";

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
   * Call nutritionLibrary service - getMyMacroTargetForLogging API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryGetMyMacroTargetForLogging(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/v1/macro-targets/me/for-logging";

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
   * Call nutritionLibrary service - _fetchListMacroTarget API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryFetchListMacroTarget(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/_fetchlistmacrotarget";

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
   * Call nutritionLibrary service - _fetchListFoodItem API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryFetchListFoodItem(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/_fetchlistfooditem";

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
   * Call nutritionLibrary service - _fetchListPresetMeal API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryFetchListPresetMeal(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/_fetchlistpresetmeal";

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
   * Call nutritionLibrary service - _fetchListPresetLine API
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryFetchListPresetLine(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/v1/_fetchlistpresetline";

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
   * Call nutritionLibrary service - m2mCreateMacroTarget edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mCreateMacroTarget(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/macrotarget/create";

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
   * Call nutritionLibrary service - m2mBulkCreateMacroTarget edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mBulkCreateMacroTarget(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/macrotarget/bulk-create";

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
   * Call nutritionLibrary service - m2mUpdateMacroTargetById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mUpdateMacroTargetById(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/macrotarget/update/:id";

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
   * Call nutritionLibrary service - m2mDeleteMacroTargetById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mDeleteMacroTargetById(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/macrotarget/delete/:id";

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
   * Call nutritionLibrary service - m2mUpdateMacroTargetByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mUpdateMacroTargetByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/macrotarget/update-by-query";

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
   * Call nutritionLibrary service - m2mDeleteMacroTargetByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mDeleteMacroTargetByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/macrotarget/delete-by-query";

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
   * Call nutritionLibrary service - m2mUpdateMacroTargetByIdList edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mUpdateMacroTargetByIdList(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/macrotarget/update-by-id-list";

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
   * Call nutritionLibrary service - m2mCreateFoodItem edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mCreateFoodItem(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/fooditem/create";

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
   * Call nutritionLibrary service - m2mBulkCreateFoodItem edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mBulkCreateFoodItem(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/fooditem/bulk-create";

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
   * Call nutritionLibrary service - m2mUpdateFoodItemById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mUpdateFoodItemById(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/fooditem/update/:id";

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
   * Call nutritionLibrary service - m2mDeleteFoodItemById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mDeleteFoodItemById(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/fooditem/delete/:id";

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
   * Call nutritionLibrary service - m2mUpdateFoodItemByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mUpdateFoodItemByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/fooditem/update-by-query";

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
   * Call nutritionLibrary service - m2mDeleteFoodItemByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mDeleteFoodItemByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/fooditem/delete-by-query";

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
   * Call nutritionLibrary service - m2mUpdateFoodItemByIdList edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mUpdateFoodItemByIdList(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/fooditem/update-by-id-list";

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
   * Call nutritionLibrary service - m2mCreatePresetMeal edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mCreatePresetMeal(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/presetmeal/create";

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
   * Call nutritionLibrary service - m2mBulkCreatePresetMeal edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mBulkCreatePresetMeal(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/presetmeal/bulk-create";

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
   * Call nutritionLibrary service - m2mUpdatePresetMealById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mUpdatePresetMealById(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/presetmeal/update/:id";

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
   * Call nutritionLibrary service - m2mDeletePresetMealById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mDeletePresetMealById(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/presetmeal/delete/:id";

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
   * Call nutritionLibrary service - m2mUpdatePresetMealByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mUpdatePresetMealByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/presetmeal/update-by-query";

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
   * Call nutritionLibrary service - m2mDeletePresetMealByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mDeletePresetMealByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/presetmeal/delete-by-query";

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
   * Call nutritionLibrary service - m2mUpdatePresetMealByIdList edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mUpdatePresetMealByIdList(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/presetmeal/update-by-id-list";

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
   * Call nutritionLibrary service - m2mCreatePresetLine edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mCreatePresetLine(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/presetline/create";

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
   * Call nutritionLibrary service - m2mBulkCreatePresetLine edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mBulkCreatePresetLine(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/presetline/bulk-create";

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
   * Call nutritionLibrary service - m2mUpdatePresetLineById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mUpdatePresetLineById(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/presetline/update/:id";

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
   * Call nutritionLibrary service - m2mDeletePresetLineById edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mDeletePresetLineById(params = {}, options = {}) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl = serviceUrl.replace(/\/$/, "") + "/m2m/presetline/delete/:id";

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
   * Call nutritionLibrary service - m2mUpdatePresetLineByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mUpdatePresetLineByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/presetline/update-by-query";

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
   * Call nutritionLibrary service - m2mDeletePresetLineByQuery edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mDeletePresetLineByQuery(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/presetline/delete-by-query";

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
   * Call nutritionLibrary service - m2mUpdatePresetLineByIdList edge controller
   * @param {Object} params - Request parameters (body, query, path params)
   * @param {Object} options - Additional options (headers, cookies, serializer)
   * @returns {Promise<Object>} Response data
   */
  async callNutritionLibraryM2mUpdatePresetLineByIdList(
    params = {},
    options = {},
  ) {
    const serviceUrl = process.env.NUTRITIONLIBRARY_SERVICE_URL;
    if (!serviceUrl) {
      throw new Error(
        `Service URL not found for nutritionLibrary. Please set NUTRITIONLIBRARY_SERVICE_URL environment variable.`,
      );
    }

    // Build full URL with route path
    let fullUrl =
      serviceUrl.replace(/\/$/, "") + "/m2m/presetline/update-by-id-list";

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
