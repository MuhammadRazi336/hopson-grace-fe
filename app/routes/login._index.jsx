import { useFetcher } from "@remix-run/react";
import { defer, json, redirect } from "@shopify/remix-oxygen";
import { requireAuth } from "~/utils/auth-guard.js";

import  Button  from "~/components/Button.jsx";
import Input from "~/components/Input.jsx";
import { useRef, useState } from "react";
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const { context} = args

  const user = await requireAuth(context,true);
  return null;
}

export async function action({ request, context }) {
  const body = await request.json();
  const { payload } = body;
  try {
    const response = await context.client(payload, "auth/login", request);
    const bearerToken = response.data?.accessToken;
    context.session.set("user_token", bearerToken);

    const cookie = await context.session.commit();
    return redirect("/", {
      headers: {
        "Set-Cookie": cookie
      }
    });
  } catch (e) {
    console.log(e);
  }

}

const LoginIndex = () => {
  const fetcher = useFetcher(); // For triggering server actions
  const formData = useState({
    email: "subhan@mailinator.com",
    password: "",

  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Directly modifying the ref object to store new value
    formData[name] = value;
  };
  const handleRegisterPost = async () => {
    const payload = {
      email: formData.email,
      password: formData.password
    };
    fetcher.submit(
      { payload }, // Send data as key-value pairs
      {
        method: "post",
        encType: "application/json"
      }
    );
  };
  return (<div>
    <div className="grid grid-cols-2 gap-4">
      <Input
        label="Email"
        name="email"
        value={formData?.email}
        onChange={handleInputChange}
      />
      <Input
        label="Password"
        name="password"
        type={"password"}
        value={formData?.password}
        onChange={handleInputChange}
      />
    </div>
    <Button onClick={handleRegisterPost} text={"Login"} />
  </div>);
};


export default LoginIndex;

