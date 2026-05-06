import test from 'node:test';
import assert from 'node:assert/strict';

import {
  classifyFinalizeFailure,
  finalizeWithRetry,
  isFinalizeSuccessResponse,
} from './checkout-finalization.client.js';

const payload = {
  registryId: 268,
  email: 'guest@example.com',
};

test('capture success + finalize success first try', async () => {
  let attempts = 0;
  const result = await finalizeWithRetry({
    payload,
    paypalOrderId: 'PAYPAL_ORDER_1',
    sleep: async () => {},
    attemptFinalize: async () => {
      attempts += 1;
      return {
        ok: true,
        status: 200,
        data: {success: true, checkoutNumber: 'HG-1001'},
      };
    },
  });

  assert.equal(result.success, true);
  assert.equal(attempts, 1);
});

test('capture success + transient finalize failures then success', async () => {
  let attempts = 0;
  const result = await finalizeWithRetry({
    payload,
    paypalOrderId: 'PAYPAL_ORDER_2',
    sleep: async () => {},
    attemptFinalize: async () => {
      attempts += 1;
      if (attempts < 3) {
        return {ok: false, status: 502, error: 'upstream unavailable'};
      }
      return {
        ok: true,
        status: 200,
        data: {success: true, checkoutNumber: 'HG-1002'},
      };
    },
  });

  assert.equal(result.success, true);
  assert.equal(attempts, 3);
});

test('capture success + retries exhausted', async () => {
  let attempts = 0;
  const result = await finalizeWithRetry({
    payload,
    paypalOrderId: 'PAYPAL_ORDER_3',
    maxAttempts: 3,
    sleep: async () => {},
    attemptFinalize: async () => {
      attempts += 1;
      return {ok: false, status: 500, error: 'server down'};
    },
  });

  assert.equal(result.success, false);
  assert.equal(attempts, 3);
});

test('idempotent duplicate finalize response treated as success', async () => {
  const duplicateConflict = {
    ok: false,
    status: 409,
    error: 'duplicate paypalOrderId already exists',
  };
  assert.equal(isFinalizeSuccessResponse(duplicateConflict), true);
});

test('retries exhausted then resume later succeeds with same paypalOrderId', async () => {
  const sharedOrderId = 'PAYPAL_ORDER_4';
  let phase = 'fail';
  let attempts = 0;

  const attemptFinalize = async () => {
    attempts += 1;
    if (phase === 'fail') {
      return {ok: false, status: 502, error: 'gateway timeout'};
    }
    return {
      ok: true,
      status: 200,
      data: {success: true, checkoutNumber: 'HG-1004'},
    };
  };

  const exhausted = await finalizeWithRetry({
    payload,
    paypalOrderId: sharedOrderId,
    maxAttempts: 2,
    sleep: async () => {},
    attemptFinalize,
  });
  assert.equal(exhausted.success, false);

  phase = 'success';
  const resumed = await finalizeWithRetry({
    payload,
    paypalOrderId: sharedOrderId,
    maxAttempts: 2,
    sleep: async () => {},
    attemptFinalize,
  });
  assert.equal(resumed.success, true);
});

test('registry closed response is terminal and not retryable', () => {
  const category = classifyFinalizeFailure({
    status: 403,
    error: 'Registry is already closed',
  });
  assert.equal(category, 'terminal_client');
});
