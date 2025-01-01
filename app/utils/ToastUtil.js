import {toast} from 'react-toastify';

const showToast = ({
  type,
  message,
  options,
  promise,
  promiseHandlers,
  updateId,
}) => {
  console.log(type, 'IM her with Type');
  switch (type) {
    case 'success':
      return toast.success(message, options);
    case 'error':
      return toast.error(message, options);
    case 'info':
      return toast.info(message, options);
    case 'warning':
      return toast.warning(message, options);
    case 'loading':
      return toast.loading(message, options);
    case 'update':
      if (!updateId) {
        console.error("Update ID is required for 'update' type.");
        return;
      }
      return toast.update(updateId, options);
    case 'promise':
      if (!promise || !promiseHandlers) {
        console.log('IM Here in Promise');
        console.error(
          "Promise and promiseHandlers are required for 'promise' type.",
        );
        return;
      }
      console.log('Im here', promise);
      return toast.promise(promise, promiseHandlers, options);
    default:
      return toast(message, options);
  }
};

// Wrapper functions for easier usage
const ToastUtils = {
  success: (message, options) => showToast({type: 'success', message, options}),
  error: (message, options) => showToast({type: 'error', message, options}),
  info: (message, options) => showToast({type: 'info', message, options}),
  warning: (message, options) => showToast({type: 'warning', message, options}),
  loading: (message, options) => showToast({type: 'loading', message, options}),
  update: (updateId, options) => showToast({type: 'update', updateId, options}),
  promise: (promise, promiseHandlers, options) =>
    showToast({type: 'promise', promise, promiseHandlers, options}),
};

export default ToastUtils;
