// hydrogenContextManager.js
let hydrogenContextPromise = null;

export function setHydrogenContext(promise) {
  hydrogenContextPromise = promise;
}

export async function getHydrogenContext() {
  if (!hydrogenContextPromise) {
    throw new Error('HydrogenContext has not been initialized');
  }
  return hydrogenContextPromise;
}
