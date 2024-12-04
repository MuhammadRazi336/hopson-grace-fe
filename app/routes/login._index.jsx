import { useFetcher } from "@remix-run/react";
import { redirect } from "@shopify/remix-oxygen";

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

  const handleRegisterPost = async () => {
    const payload = {
      email: "subhan@mailinator.com",
      password: "12345678"
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
    <button onClick={handleRegisterPost}>Login</button>
  </div>);
};


export default LoginIndex;

