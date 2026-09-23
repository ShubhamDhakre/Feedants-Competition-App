const { test, describe } = require('node:test');
const assert = require('node:assert');
const Competition = require('../src/models/Competition');

describe('Competition Lifecycle (State Machine)', () => {
  const baseDates = () => {
    const now = Date.now();
    return {
      title: 'Design Challenge',
      category: 'Design',
      type: 'Individual',
      description: 'Test competition for state machine',
      prizePool: '₹50,000',
      entryFee: 0,
      capacity: 10,
      registeredCount: 0,
      judge: { name: 'Expert Judge' },
      registrationStart: new Date(now + 1 * 86400000), // tomorrow
      registrationEnd: new Date(now + 3 * 86400000),
      submissionStart: new Date(now + 4 * 86400000),
      submissionEnd: new Date(now + 7 * 86400000),
      resultDate: new Date(now + 10 * 86400000),
    };
  };

  test('Status is UPCOMING before registrationStart', () => {
    const comp = new Competition(baseDates());
    assert.strictEqual(comp.computeStatus(), 'UPCOMING');
  });

  test('Status is REGISTRATION_OPEN during registration window when spots are available', () => {
    const dates = baseDates();
    const now = Date.now();
    dates.registrationStart = new Date(now - 1 * 86400000); // started yesterday
    dates.registrationEnd = new Date(now + 2 * 86400000);  // ends in 2 days
    dates.registeredCount = 5;
    dates.capacity = 10;

    const comp = new Competition(dates);
    assert.strictEqual(comp.computeStatus(), 'REGISTRATION_OPEN');
  });

  test('Status is REGISTRATION_CLOSED during registration window if capacity is full', () => {
    const dates = baseDates();
    const now = Date.now();
    dates.registrationStart = new Date(now - 1 * 86400000);
    dates.registrationEnd = new Date(now + 2 * 86400000);
    dates.registeredCount = 10;
    dates.capacity = 10;

    const comp = new Competition(dates);
    assert.strictEqual(comp.computeStatus(), 'REGISTRATION_CLOSED');
  });

  test('Status is REGISTRATION_CLOSED between registrationEnd and submissionStart', () => {
    const dates = baseDates();
    const now = Date.now();
    dates.registrationStart = new Date(now - 5 * 86400000);
    dates.registrationEnd = new Date(now - 2 * 86400000);
    dates.submissionStart = new Date(now + 1 * 86400000);

    const comp = new Competition(dates);
    assert.strictEqual(comp.computeStatus(), 'REGISTRATION_CLOSED');
  });

  test('Status is SUBMISSION_OPEN during submission window', () => {
    const dates = baseDates();
    const now = Date.now();
    dates.registrationStart = new Date(now - 10 * 86400000);
    dates.registrationEnd = new Date(now - 5 * 86400000);
    dates.submissionStart = new Date(now - 1 * 86400000); // started yesterday
    dates.submissionEnd = new Date(now + 3 * 86400000);   // ends in 3 days

    const comp = new Competition(dates);
    assert.strictEqual(comp.computeStatus(), 'SUBMISSION_OPEN');
  });

  test('Status is SUBMISSION_CLOSED between submissionEnd and resultDate', () => {
    const dates = baseDates();
    const now = Date.now();
    dates.registrationStart = new Date(now - 15 * 86400000);
    dates.registrationEnd = new Date(now - 10 * 86400000);
    dates.submissionStart = new Date(now - 8 * 86400000);
    dates.submissionEnd = new Date(now - 2 * 86400000);
    dates.resultDate = new Date(now + 5 * 86400000);

    const comp = new Competition(dates);
    assert.strictEqual(comp.computeStatus(), 'SUBMISSION_CLOSED');
  });

  test('Status is RESULT_DECLARED after resultDate', () => {
    const dates = baseDates();
    const now = Date.now();
    dates.registrationStart = new Date(now - 20 * 86400000);
    dates.registrationEnd = new Date(now - 15 * 86400000);
    dates.submissionStart = new Date(now - 12 * 86400000);
    dates.submissionEnd = new Date(now - 5 * 86400000);
    dates.resultDate = new Date(now - 1 * 86400000); // yesterday

    const comp = new Competition(dates);
    assert.strictEqual(comp.computeStatus(), 'RESULT_DECLARED');
  });

  test('Manual CANCELLED override takes precedence over dates', () => {
    const dates = baseDates();
    const now = Date.now();
    dates.registrationStart = new Date(now - 1 * 86400000);
    dates.registrationEnd = new Date(now + 5 * 86400000);
    dates.status = 'CANCELLED';

    const comp = new Competition(dates);
    assert.strictEqual(comp.computeStatus(), 'CANCELLED');
  });

  test('Manual RESULT_DECLARED override takes precedence over dates', () => {
    const dates = baseDates();
    dates.status = 'RESULT_DECLARED';

    const comp = new Competition(dates);
    assert.strictEqual(comp.computeStatus(), 'RESULT_DECLARED');
  });
});
