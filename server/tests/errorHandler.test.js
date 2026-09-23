const { test, describe } = require('node:test');
const assert = require('node:assert');
const { errorHandler } = require('../src/middleware/errorHandler');

describe('Centralized Error Handler Middleware', () => {
  const createMockRes = () => {
    const res = {
      statusCode: null,
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      },
    };
    return res;
  };

  test('Handles MongoDB duplicate key error (11000) as 409 Conflict', () => {
    const err = new Error('E11000 duplicate key');
    err.code = 11000;
    const req = {};
    const res = createMockRes();
    const next = () => {};

    errorHandler(err, req, res, next);

    assert.strictEqual(res.statusCode, 409);
    assert.strictEqual(res.jsonData.success, false);
    assert.strictEqual(res.jsonData.code, 'DUPLICATE_ENTRY');
  });

  test('Handles CastError as 400 Bad Request', () => {
    const err = new Error('Invalid ObjectId');
    err.name = 'CastError';
    const req = {};
    const res = createMockRes();
    const next = () => {};

    errorHandler(err, req, res, next);

    assert.strictEqual(res.statusCode, 400);
    assert.strictEqual(res.jsonData.success, false);
    assert.strictEqual(res.jsonData.code, 'INVALID_ID');
  });

  test('Handles JsonWebTokenError as 401 Unauthorized', () => {
    const err = new Error('invalid signature');
    err.name = 'JsonWebTokenError';
    const req = {};
    const res = createMockRes();
    const next = () => {};

    errorHandler(err, req, res, next);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.jsonData.success, false);
    assert.strictEqual(res.jsonData.code, 'INVALID_TOKEN');
  });

  test('Handles TokenExpiredError as 401 Unauthorized', () => {
    const err = new Error('jwt expired');
    err.name = 'TokenExpiredError';
    const req = {};
    const res = createMockRes();
    const next = () => {};

    errorHandler(err, req, res, next);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.jsonData.success, false);
    assert.strictEqual(res.jsonData.code, 'TOKEN_EXPIRED');
  });

  test('Handles unexpected errors safely without exposing internal stacks', () => {
    const err = new Error('Database connection dropped unexpectedly');
    const req = {};
    const res = createMockRes();
    const next = () => {};

    errorHandler(err, req, res, next);

    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.jsonData.success, false);
    assert.strictEqual(res.jsonData.stack, undefined);
  });
});
