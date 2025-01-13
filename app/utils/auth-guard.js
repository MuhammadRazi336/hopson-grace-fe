import {redirect} from '@shopify/remix-oxygen';

export async function requireAuth(context, isLogin = false) {
  const user = context?.session?.get('@User');
  if (user && isLogin) {
    throw redirect('/');
  }
  return user;
}
