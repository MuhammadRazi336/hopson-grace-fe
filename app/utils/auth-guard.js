import {
  redirect
} from "@shopify/remix-oxygen";

export async function requireAuth(context, isLogin = false) {
  const token = context?.session?.get("user_token");
  if (token && isLogin) {
    throw redirect("/");
  }
  return token;
}
