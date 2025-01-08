import {redirect} from '@shopify/remix-oxygen';
import {requireAuth} from '~/utils/auth-guard.js';

import Input from '~/components/Input.jsx';
import {useState} from 'react';
import ButtonComponent from '~/components/Button.jsx';

export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const {context} = args;

  const user = await requireAuth(context, true);
  return {context};
}

export async function action({request, context}) {
  const formData = await request.formData();
  const payload = {
    email: "formData.get('email')",
    password: formData.get('password'),
  };
  console.log(formData.get('email') , 'email ');
  try {
    const response = await context.ClientPost(payload, 'auth/login', context);
    console.log(response, 'Response');
    const user = response.data;
    context.session.set('@User', user);
    const cookie = await context.session.commit();
    return redirect('/', {
      headers: {
        'Set-Cookie': cookie,
      },
    });
  } catch (e) {
    return null;
  }
}

const LoginIndex = () => {
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
  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const form = e.target;
    form.submit(); // Let the form submit programmatically to Remix action
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSubmit} method="post" className="space-y-6">
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
          <ButtonComponent type="submit" className="w-full" text={'Login'} />
        </form>
      </div>
    </div>
  );
};

export default LoginIndex;
