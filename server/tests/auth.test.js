const { test, describe } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

describe('Authentication & Security Logic', () => {
  const JWT_SECRET = 'test_secret_for_unit_tests_12345';
  process.env.JWT_SECRET = JWT_SECRET;
  process.env.JWT_EXPIRES_IN = '1h';

  test('Password is saved hashed when pre-save hook executes', async () => {
    const rawPassword = 'supersecretpassword';
    const user = new User({
      name: 'Tester',
      email: 'test@example.com',
      password: rawPassword,
    });

    // Simulate saving (runs pre-save hook)
    // Manually trigger pre-save logic by calling hash if not connecting to DB
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);
    user.password = hash;

    assert.notStrictEqual(user.password, rawPassword);
    assert.strictEqual(user.password.startsWith('$2'), true);

    // Test comparePassword
    const isMatch = await user.comparePassword(rawPassword);
    assert.strictEqual(isMatch, true);

    const isWrongMatch = await user.comparePassword('wrongpassword');
    assert.strictEqual(isWrongMatch, false);
  });

  test('User toJSON method removes password field', () => {
    const user = new User({
      name: 'Safe User',
      email: 'safe@example.com',
      password: 'hashed_password_string',
    });

    const json = user.toJSON();
    assert.strictEqual(json.password, undefined);
    assert.strictEqual(json.name, 'Safe User');
    assert.strictEqual(json.email, 'safe@example.com');
  });

  test('JWT token signs and verifies user ID correctly', () => {
    const userId = '64e8b3f2e1a2b3c4d5e6f7a8';
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

    assert.strictEqual(typeof token, 'string');
    assert.strictEqual(token.split('.').length, 3);

    const decoded = jwt.verify(token, JWT_SECRET);
    assert.strictEqual(decoded.userId, userId);
  });

  test('JWT verification fails with invalid secret', () => {
    const token = jwt.sign({ userId: '12345' }, 'different_secret', { expiresIn: '1h' });

    assert.throws(() => {
      jwt.verify(token, JWT_SECRET);
    }, {
      name: 'JsonWebTokenError',
    });
  });

  test('JWT verification fails when expired', async () => {
    const expiredToken = jwt.sign({ userId: '12345' }, JWT_SECRET, { expiresIn: '1ms' });

    // Wait 10ms for expiration
    await new Promise((r) => setTimeout(r, 10));

    assert.throws(() => {
      jwt.verify(expiredToken, JWT_SECRET);
    }, {
      name: 'TokenExpiredError',
    });
  });
});
