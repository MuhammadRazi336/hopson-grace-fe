import {redirect} from '@shopify/remix-oxygen';
import {requireAuth} from '~/utils/auth-guard.js';
import {useActionData, useFetcher, useSubmit} from '@remix-run/react';
import {toast} from 'react-toastify';

import Input from '~/components/Input.jsx';
import {useState} from 'react';
import ButtonComponent from '~/components/Button.jsx';
import {jsonWithError} from 'remix-toast';

export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const {context} = args;

  const user = await requireAuth(context, true);
  return {context};
}

export async function action({request, context}) {
  const body = await request.json();
  const {payload} = body;
  try {
    const response = await context.ClientPost(payload, 'auth/login', context);
    if (response?.code == 200) {
      const user = response.data;
      context.session.set('@User', user);
      const cookie = await context.session.commit();
      return redirect('/', {
        headers: {
          'Set-Cookie': cookie,
        },
      });
    } else {
      return {...response};
    }
  } catch (e) {
    return {...e};
  }
}

const LoginIndex = () => {
  const submit = useSubmit();
  const actionData = useActionData();
  console.log(actionData, 'ActionData');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e?.preventDefault();
    const payload = {
      email: formData.email,
      password: formData.password,
    };
    submit({payload}, {method: 'post', encType: 'application/json'});
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="mb-4">
            <Input
              type="email"
              required={true}
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>
          <div className="mb-6">
            <Input
              required={true}
              type="password"
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          <div
            style={{
              color: actionData?.statusCode >= 400 ? 'red' : 'inherit',
            }}
          >
            {actionData?.statusCode >= 400 && Array.isArray(actionData?.message)
              ? actionData?.message[0]
              : actionData?.message}
          </div>
          <ButtonComponent type="submit" className="w-full" text={'Login'} />
        </form>
      </div>
    </div>
  );
};

export default LoginIndex;
