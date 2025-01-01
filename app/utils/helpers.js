import {useEffect, useState, useRef} from 'react';

export const useHydrated = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true); // Set to true after hydration
  }, []);

  return hydrated;
};

export const useToastSubmitPromise = (initialState) => {
  const promisefy = useRef(deferred());
  useEffect(() => {
    if (
      initialState.state === 'idle' &&
      initialState.data &&
      initialState.data.success
    ) {
      promisefy.current.resolve();
      promisefy.current = deferred(); // reset promise state for pending.
    }

    if (initialState.data && !initialState.data.success)
      promisefy.current.reject();
  }, [initialState.state, initialState.data]);

  return promisefy.current.promise;
};

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {resolve, reject, promise};
}

export function extractShopifyId(id) {
  const match = id.match(/\d+/); // Matches the first sequence of digits
  return match ? match[0] : null; // Returns the number or null if not found
}
