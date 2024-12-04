import {
  redirect
} from "@shopify/remix-oxygen";

export async function requireAuth(request, context) {
  const token = context.session.get("user_token");
  if (!token) {
    throw redirect("/login");
  }

  return token;
}
