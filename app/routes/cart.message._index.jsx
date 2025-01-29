import {redirect} from '@remix-run/server-runtime';
import {useState} from 'react';
import ButtonComponent from '~/components/Button';

export async function action({request, context}) {
  const formData = new URLSearchParams(await request.formData());
  const message = formData.get('message');

  try {
    context?.session?.set('message', message);
  } catch (error) {
    console.error('Error setting session message:', error);
  }

  return redirect('/cart/checkout');
}

const Message = () => {
  const [message, setMessage] = useState('');
  const maxLength = 1000;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Send a Message</h1>
        <form className="space-y-4" method="post">
          <div>
            <label htmlFor="message" className="block text-lg font-medium mb-2">
              Your Message <span className="text-black">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows="6"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Type your message here..."
              maxLength={maxLength}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500">
            Characters Remaining: {maxLength - message.length}/{maxLength}
          </div>
          <ButtonComponent
            text="Proceed to Checkout"
            type="submit"
            className="w-full"
          />
        </form>
      </div>
    </div>
  );
};

export default Message;
