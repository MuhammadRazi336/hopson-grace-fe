import {Link, useNavigate} from '@remix-run/react';

export default function SendThanks() {
  const navigate = useNavigate();

  return (
    <div className="text-center p-5 font-sans">
      <h2 className="text-xl font-bold">Say Thanks</h2>

      <div className="my-5 mx-auto w-11/12 max-w-lg h-52 bg-gray-300 rounded-lg"></div>

      <div className="flex flex-col mx-auto w-11/12 max-w-lg h-52 items-center gap-3">
        <div className="flex justify-between w-11/12">
          <div className="w-56 px-2 py-6 bg-gray-200 border border-gray-400 rounded hover:bg-gray-300">
            <p>Sent By Mail (Mark Complete)</p>
          </div>

          <Link to={`/sendthanks/toguest`}>
            <div className="w-56 px-2 py-9 bg-gray-200 border border-gray-400 rounded hover:bg-gray-300">
              <p>Send Thank you by Email</p>
            </div>
          </Link>
        </div>

        <Link>
          <div className="w-56 py-5 bg-gray-200 border border-gray-400 rounded hover:bg-gray-300">
            <p>Have Cardly Send a Handwritten Note</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
