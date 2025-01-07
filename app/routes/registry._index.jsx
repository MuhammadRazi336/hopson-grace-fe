import {defer, json} from '@shopify/remix-oxygen';

import {requireAuth} from '~/utils/auth-guard.js';
import {Outlet} from '@remix-run/react';

export const meta = () => {
  return [{title: 'Hydrogen | Home'}];
};

/**
 * @param {LoaderFunctionArgs} args
 */

export default function App() {
  return (
    <>
      <div>osadoajdao</div>
      <Outlet />
    </>
  );
}
