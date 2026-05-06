export const FINALIZATION_PENDING_STORAGE_KEY = 'checkoutFinalizationPending_v1';

const BACKOFF_SCHEDULE_MS = [1000, 2000, 4000, 8000, 15000, 15000];

export function getFinalizeBackoffMs(attemptNumber) {
  return (
    BACKOFF_SCHEDULE_MS[Math.max(0, attemptNumber - 1)] ||
    BACKOFF_SCHEDULE_MS[BACKOFF_SCHEDULE_MS.length - 1]
  );
}

export function classifyFinalizeFailure({status, error}) {
  if (status === 429) {
    return 'retryable_rate_limited';
  }
  if (status >= 500) {
    return 'retryable_server';
  }
  if (status >= 400 && status < 500) {
    const msg = String(error || '').toLowerCase();
    if (
      msg.includes('validation') ||
      msg.includes('invalid') ||
      msg.includes('unauthorized') ||
      msg.includes('forbidden') ||
      msg.includes('missing required') ||
      msg.includes('registry is already closed') ||
      msg.includes('registry_closed')
    ) {
      return 'terminal_client';
    }
    return 'ambiguous_client';
  }
  return 'retryable_network';
}

export function shouldRetryFinalize({category, attemptNumber, maxAttempts}) {
  if (attemptNumber >= maxAttempts) {
    return false;
  }
  if (category === 'terminal_client') {
    return false;
  }
  if (category === 'ambiguous_client') {
    return attemptNumber < Math.min(maxAttempts, 2);
  }
  return true;
}

export function isFinalizeSuccessResponse(result) {
  if (!result) return false;
  if (result.ok && result.data?.success) return true;
  if (result.ok && result.data?.data?.checkoutNumber) return true;

  const details = String(result.error || '').toLowerCase();
  if (result.status === 409 || result.status === 422) {
    if (
      details.includes('already') ||
      details.includes('exists') ||
      details.includes('duplicate')
    ) {
      return true;
    }
  }
  return false;
}

export function savePendingFinalization(state) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      FINALIZATION_PENDING_STORAGE_KEY,
      JSON.stringify({
        ...state,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    /* ignore localStorage failures */
  }
}

export function clearPendingFinalization() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(FINALIZATION_PENDING_STORAGE_KEY);
  } catch {
    /* ignore localStorage failures */
  }
}

export function loadPendingFinalization() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FINALIZATION_PENDING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function finalizeWithRetry({
  attemptFinalize,
  payload,
  paypalOrderId,
  maxAttempts = 6,
  onEvent = () => {},
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
}) {
  let lastFailure = null;
  for (let attemptNumber = 1; attemptNumber <= maxAttempts; attemptNumber += 1) {
    onEvent('finalize_attempt_started', {
      attemptNumber,
      paypalOrderId,
      registryId: payload?.registryId,
      email: payload?.email,
      timestamp: new Date().toISOString(),
    });

    const result = await attemptFinalize({payload, paypalOrderId, attemptNumber});
    if (isFinalizeSuccessResponse(result)) {
      onEvent('finalize_succeeded', {
        attemptNumber,
        paypalOrderId,
        registryId: payload?.registryId,
        email: payload?.email,
        timestamp: new Date().toISOString(),
      });
      return {success: true, result, attemptNumber};
    }

    const category = classifyFinalizeFailure({
      status: result?.status || 0,
      error: result?.error,
    });
    lastFailure = {result, category, attemptNumber};
    onEvent('finalize_attempt_failed', {
      attemptNumber,
      status: result?.status || null,
      category,
      paypalOrderId,
      registryId: payload?.registryId,
      email: payload?.email,
      timestamp: new Date().toISOString(),
    });

    if (!shouldRetryFinalize({category, attemptNumber, maxAttempts})) {
      break;
    }

    await sleep(getFinalizeBackoffMs(attemptNumber));
  }

  onEvent('finalize_exhausted', {
    attempts: lastFailure?.attemptNumber || maxAttempts,
    status: lastFailure?.result?.status || null,
    category: lastFailure?.category || 'unknown',
    paypalOrderId,
    registryId: payload?.registryId,
    email: payload?.email,
    timestamp: new Date().toISOString(),
  });

  return {success: false, lastFailure};
}
