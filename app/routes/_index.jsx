import {requireAuth} from '~/utils/auth-guard.js';
import {redirect} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';

export async function loader(args) {
  const {context, request} = args;
  // Await the critical data required to render initial state of the page
  const user = await requireAuth(context);
  if (!user) {
    return redirect('/login');
  } else {
    const getUser = await context.ClientGet(`users/${user?.user?.id}`, context);
    const sessionUser = {
      accessToken: user.accessToken,
      ...getUser.data,
    };
    context.session.set('@User', sessionUser);
    const cookie = await context.session.commit();

    if (sessionUser?.user?.isOnboard === false) {
      return redirect('/onboarding', {
        headers: {
          'Set-Cookie': cookie,
        },
      });
    } else {
      return redirect('/dashboard');
    }
  }
}

const Dashboard_index = () => {
  const data = useLoaderData();
  console.log(data, 'Dat');
  return <div></div>;
};

export default Dashboard_index;
