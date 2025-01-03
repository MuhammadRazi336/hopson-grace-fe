import { useEffect } from 'react';
import ButtonComponent from '~/components/Button.jsx';

export default function MessageCheckout() {
  let message = ''; // Regular variable to hold the message
  const maxCharacters = 1000;

  const handleChange = (e) => {
    message = e.target.value; // Update the message
    document.getElementById('charCount').innerText = `Characters Remaining: ${
      maxCharacters - message.length
    }`;
  };

  useEffect(() => {
    // Initialize character count on mount
    document.getElementById(
      'charCount'
    ).innerText = `Characters Remaining: ${maxCharacters}`;
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center">Send a Message</h1>
      <div className="mb-4">
        <label htmlFor="message" className="block mb-2 font-semibold">
          Your Message *
        </label>
        <textarea
          id="message"
          onChange={handleChange}
          maxLength={maxCharacters}
          placeholder="Type your message here..."
          className="w-full h-40 p-2 border border-gray-300 rounded resize-none"
        />
        <p id="charCount" className="mt-2 text-gray-600">
          Characters Remaining: {maxCharacters}
        </p>
      </div>
      <div className="text-center">
        <p className="mb-4 text-gray-700">
          Gifts will be delivered directly to the couple
        </p>
        <ButtonComponent
          text="Proceed to Checkout"
          onClick={() => (window.location.href = '/checkout')}
          className="w-full bg-blue-600 text-white hover:bg-blue-500 transition"
        />
      </div>
    </div>
  );
}
