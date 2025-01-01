import { useFetcher } from "@remix-run/react";
import {  redirect } from "@shopify/remix-oxygen";
import { requireAuth } from "~/utils/auth-guard.js";

import Input from "~/components/Input.jsx";
import {  useState } from "react";
import ButtonComponent from "~/components/Button.jsx";


export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const { context } = args;

  const user = await requireAuth(context, true);
  return { context };
}

export async function action({ request, context }) {
  const body = await request.json();
  const { payload } = body;
  try {
    const response = await context.ClientPost(payload, "auth/login", context, {
      pending: "Loading...",
      success: "User Sign in successfully!",
      error: "Failed to Sign in user."
    });
    console.log(response,"Response")
    const user = response.data;
    context.session.set("@User", user);
    const cookie = await context.session.commit();
    return redirect("/", {
      headers: {
        "Set-Cookie": cookie
      }
    });
  } catch (e) {
    return null;
  }
}

const LoginIndex = () => {
  const fetcher = useFetcher();
  const formData = useState({
    email: "subhan@mailinator.com",
    password: ""
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Directly modifying the ref object to store new value
    formData[name] = value;
  };
  const handleLogin = async () => {
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
  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <div className="mb-4">
          <Input label="Email"
                 name="email"
                 value={formData?.email}
                 onChange={handleInputChange} />
        </div>
        <div className="mb-6">
          <Input label="Password"
                 name="password"
                 value={formData?.password}
                 onChange={handleInputChange} />
        </div>
        <ButtonComponent
          onClick={handleLogin}
          className="w-full"
          text={"Login"}
        />
      </div>
    </div>
  );
};


export default LoginIndex;

