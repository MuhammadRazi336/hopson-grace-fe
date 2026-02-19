import {redirect} from '@shopify/remix-oxygen';

/**
 * Helper function to clear session and redirect to login
 */
export async function clearSessionAndRedirect(context) {
  // Clear all session data
  context.session.unset('@User');
  context.session.unset('@Registry');
  context.session.unset('@token');
  context.session.unset('@Token');
  
  // Destroy the session completely
  await context.session.destroy();
  
  return redirect('/login?session_expired=1', {
    headers: {
      'Set-Cookie': await context.session.commit(),
    },
  });
}

export async function requireAuth(context, isLogin = false) {
  const user = context?.session?.get('@User');
  
  // If user exists but isLogin is true, redirect to home
  if (user && isLogin) {
    throw redirect('/');
  }
  
  // If no user and not on login page, session may be expired
  if (!user && !isLogin) {
    // Check if we're already on login page to avoid redirect loop
    // This will be handled by individual routes
    return null;
  }
  
  return user;
}
