import {Link, redirect, useActionData, useSubmit} from '@remix-run/react';
import {useState} from 'react';
import ButtonComponent from '~/components/Button';
import Input from '~/components/Input';

export async function action({request, context}) {
  try {
    const body = await request.json();
    const {payload} = body;

    const response = await context.ClientPost(payload, `greetings`, context);

    if (response?.code === 200) {
      return redirect('/sendthanks/toguest');
    } else {
      return {error: response?.message || 'Failed to send message'};
    }
  } catch (error) {
    return {success: false, error: error.message};
  }
}

const ThankYou = () => {
  const actionData = useActionData();
  const submit = useSubmit();

  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message:
      'Thank you for your generosity and for celebrating this milestone moment with us. It means so much!',
  });

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      to: formData.to,
      subject: formData.subject,
      message: formData.message,
    };
    submit({payload}, {method: 'post', encType: 'application/json'});
  };

  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="w-7xl max-w-lg bg-gray-200 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Send Thanks</h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="to"
              className="block text-sm font-medium text-gray-700"
            >
              To
            </label>
            <Input
              className="bg-white"
              name="to"
              value={formData.to}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Subject
            </label>
            <Input
              className="bg-white"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
            />
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700"
            >
              Message
            </label>
            <textarea
              id="message"
              rows="6"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="mt-1 block w-full bg-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            ></textarea>
          </div>

          <div className="flex justify-end">
            <ButtonComponent text="Send" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThankYou;
