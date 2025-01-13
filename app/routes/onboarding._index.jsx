import {useHydrated} from '~/utils/helpers.js';
import Onboarding from '~/.client/Onboarding.jsx';
import {requireAuth} from '~/utils/auth-guard.js';
import {redirect} from '@shopify/remix-oxygen';

export async function loader({request, context}) {
  const user = await requireAuth(context);
  if (user) {
    return {user, context};
  }
  return redirect('/');
}

const OnboardingIndex = () => {
  const hydrated = useHydrated();
  return <div>{hydrated && <Onboarding />}</div>;
};

export default OnboardingIndex;
