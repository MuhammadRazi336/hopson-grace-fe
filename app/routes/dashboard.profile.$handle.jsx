import CustomSelect from '~/components/CustomSelect.jsx';
import ButtonComponent from '~/components/Button.jsx';
import RegistryProduct from '~/components/RegistryProduct.jsx';
import {useState} from 'react';
import {useFetcher, useLoaderData} from '@remix-run/react';
import {defer, redirect} from '@shopify/remix-oxygen';
import CategoryTile from '~/components/CategoryTile.jsx';
import {requireAuth} from '~/utils/auth-guard.js';
import {extractShopifyId} from '~/utils/helpers.js';

export async function loader({request, context, params}) {
  console.log(params, 'Parameter');
  return null;
}

const GiftDetail = () => {
  return (
    <div className="max-w-4xl mx-auto min-h-svh m-2 p-4 bg-white-100 rounded-lg">
      im here in detail screensad
    </div>
  );
};

export default GiftDetail;
