import {redirect} from '@remix-run/server-runtime';

export async function action({request, context}) {
  try {
    // Clear all session data
    context.session.unset('@User');
    context.session.unset('@Registry');
    context.session.unset('@token');
    context.session.unset('@Token');
    
    // Destroy the session completely
    await context.session.destroy();

    return redirect('/login', {
      headers: {
        'Set-Cookie': await context.session.commit(),
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    return new Response('Internal Server Error', {status: 500});
  }
}
