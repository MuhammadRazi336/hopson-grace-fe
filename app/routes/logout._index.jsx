import {redirect} from '@remix-run/server-runtime';

export async function action({request, context}) {
  try {
    context.session.unset('@User');
    context.session.unset('@Registry');

    return redirect('/login', {
      headers: {
        'Set-Cookie': '',
      },
    });
  } catch (error) {
    return new Response('Internal Server Error', {status: 500});
  }
}
