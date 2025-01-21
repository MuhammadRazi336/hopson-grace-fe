import {Link, useNavigate} from '@remix-run/react';

export default function SendThanks() {
  const navigate = useNavigate();

  return (
    <div className="text-center p-5 font-sans">
      <h2 className="text-xl font-bold">Say Thanks</h2>

      {/* Placeholder for content */}
      <div className="my-5 mx-auto w-11/12 max-w-lg h-52 bg-gray-300 rounded-lg"></div>

      {/* Buttons */}
      <div className="flex flex-col mx-auto w-11/12 max-w-lg h-52 items-center gap-3">
        <div className="flex justify-between w-11/12">
          <button className="w-56 py-6 bg-gray-200 border border-gray-400 rounded hover:bg-gray-300">
            Sent By Mail
            <br />
            (Mark Complete)
          </button>

          <button
            className="w-56 py-6 bg-gray-200 border border-gray-400 rounded hover:bg-gray-300"
            onClick={() => navigate('/sendthanks/toguest')}
          >
            Send a Thank You
            <br />
            by Email
          </button>
        </div>

        <button className="w-56 py-3 bg-gray-200 border border-gray-400 rounded hover:bg-gray-300">
          Have Cardly Send
          <br />a Handwritten
          <br /> Note
        </button>
      </div>
    </div>
  );
}
