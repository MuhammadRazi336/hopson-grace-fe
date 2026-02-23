import {requireAuth, clearSessionAndRedirect} from '~/utils/auth-guard.js';
import {redirect} from '@shopify/remix-oxygen';
import {useLoaderData} from '@remix-run/react';

export async function loader(args) {
  const {context} = args;
  const user = await requireAuth(context);
  if (!user) {
    return redirect('/login');
  }

  try {
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
    }

    await context.ClientGet(
      `registries/by-userId/${sessionUser?.user?.id}`,
      context,
    );
    return redirect('/dashboard', {
      headers: {
        'Set-Cookie': cookie,
      },
    });
  } catch (err) {
    if (err?.isSessionExpired || err?.status === 401 || err?.status === 403) {
      return clearSessionAndRedirect(context);
    }
    throw err;
  }
}

const Dashboard_index = () => {
  const data = useLoaderData();
  return <div></div>;
};

export default Dashboard_index;
