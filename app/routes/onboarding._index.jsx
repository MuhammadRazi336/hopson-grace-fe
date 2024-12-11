import { useEffect, useRef, useState } from "react";
import { useLoaderData, useFetcher } from "@remix-run/react";

import Heading from "~/components/Heading.jsx";
import Input from "~/components/Input.jsx";
import Button from "~/components/Button.jsx";
import Stepper from "~/components/Stepper.jsx";
import CustomSelect from "~/components/CustomSelect.jsx";
import { redirect, json } from "@shopify/remix-oxygen";
import DatePicker from "~/components/Datepicker.jsx";
import moment from "moment";
import { useHydrated } from "~/utils/helpers.js";
import Onboarding from "~/.client/Onboarding.jsx";
import { createClient } from "~/lib/client.js";
import { requireAuth } from "~/utils/auth-guard.js";

// export async function action({ request, context }) {
//   const body = await request.json();
//   try {
//     const { payload } = body;
//     let signup = payload.signupPayload;
//     let registry = payload.registryPayload;
//     const signupRes = await context.ClientPost(signup);
//     const bearerToken = signupRes.data.accessToken;
//     context.session.set('user_token', bearerToken);
//     const cookie = await context.session.commit();
//     new Response('Set-Cookie', {
//       headers: cookie,
//     });
//     const registryRes = context.ClientPost(registry);
//     console.log(registryRes)
//     return redirect("/" );
//     // return json({ data: signupResponse.data, requestType });
//   } catch (error) {
//     return json({ data: error });
//   }
// }

export async function loader({request, context}) {
  const user = await requireAuth(context);
  return {user};
}
const OnboardingIndex = () => {
  const hydrated = useHydrated();
  return <div>{hydrated && <Onboarding />}</div>;
};

export default OnboardingIndex;
