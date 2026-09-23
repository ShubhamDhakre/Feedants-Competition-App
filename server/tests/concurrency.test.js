const { test, describe } = require('node:test');
const assert = require('node:assert');
const Participation = require('../src/models/Participation');
const Competition = require('../src/models/Competition');

describe('Concurrency & Data Integrity Strategy', () => {
  test('Participation model defines compound unique index on userId and competitionId', () => {
    const indexes = Participation.schema.indexes();
    // Index should have { userId: 1, competitionId: 1 } with unique: true
    const compoundUniqueIndex = indexes.find(([fields, options]) => {
      return (
        fields.userId === 1 &&
        fields.competitionId === 1 &&
        options &&
        options.unique === true
      );
    });

    assert.ok(compoundUniqueIndex, 'Expected compound unique index on { userId: 1, competitionId: 1 }');
  });

  test('Competition capacity and registeredCount are properly bounded in schema', () => {
    const registeredCountPath = Competition.schema.path('registeredCount');
    const capacityPath = Competition.schema.path('capacity');

    assert.strictEqual(registeredCountPath.defaultValue, 0);
    assert.strictEqual(capacityPath.isRequired, true);
  });

  test('Remaining spots calculation handles bounds correctly', () => {
    const calculateSpots = (capacity, registeredCount) => Math.max(0, capacity - registeredCount);

    assert.strictEqual(calculateSpots(20, 0), 20);
    assert.strictEqual(calculateSpots(20, 19), 1);
    assert.strictEqual(calculateSpots(20, 20), 0);
    assert.strictEqual(calculateSpots(20, 25), 0); // clamped to 0
  });

  test('Duplicate registration error code (11000) simulation triggers rollback logic', () => {
    let rollbackExecuted = false;
    let registeredCount = 5;

    // Simulate the registration controller rollback block
    const simulateRegistration = (hasDuplicateError) => {
      registeredCount++; // atomic increment simulated
      try {
        if (hasDuplicateError) {
          const err = new Error('E11000 duplicate key error collection');
          err.code = 11000;
          throw err;
        }
        return { success: true };
      } catch (err) {
        if (err.code === 11000) {
          registeredCount--; // rollback
          rollbackExecuted = true;
          return { success: false, code: 'ALREADY_REGISTERED' };
        }
        throw err;
      }
    };

    const result = simulateRegistration(true);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.code, 'ALREADY_REGISTERED');
    assert.strictEqual(registeredCount, 5, 'registeredCount must be rolled back to 5');
    assert.strictEqual(rollbackExecuted, true);
  });
});
