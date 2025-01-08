import {requireAuth} from '~/utils/auth-guard.js';
import {redirect} from '@shopify/remix-oxygen';

export async function loader(args) {
  const {context, request} = args;
  // Await the critical data required to render initial state of the page
  const user = await requireAuth(context);
  if (!user) {
    return redirect('/login');
  } else if (user?.user?.isOnboard) {
    const getUser = await context.ClientGet(`users/${user.user.id}`, context);
    const sessionUser = {
      accessToken: user.accessToken,
      ...getUser,
    };
    context.session.set('@User', sessionUser);
    const cookie = await context.session.commit();
    return redirect('/onboarding', {
      headers: {
        'Set-Cookie': cookie,
      },
    });
  } else {
    return redirect('/dashboard');
  }
}

const Dashboard_index = () => {
  return <div></div>;
};

export default Dashboard_index;
