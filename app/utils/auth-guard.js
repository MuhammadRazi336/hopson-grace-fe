import {
  redirect
} from "@shopify/remix-oxygen";

export async function requireAuth(context, isLogin = false) {
  const token = context?.session?.get("@User");
  if (token && isLogin) {
    throw redirect("/");
  }
  return token;
}
