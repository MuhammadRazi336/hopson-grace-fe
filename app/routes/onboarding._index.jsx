import { useHydrated } from "~/utils/helpers.js";
import Onboarding from '~/.client/Onboarding.jsx';
import { requireAuth } from "~/utils/auth-guard.js";

export async function loader({ request, context }) {
  const user = await requireAuth(context);
  return { user, context };
}

const OnboardingIndex = () => {
  const hydrated = useHydrated();
  return <div>{hydrated && <Onboarding />}</div>;
};

export default OnboardingIndex;
