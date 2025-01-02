import {useCallback, useState} from 'react';
import {defer, Form, redirect, useLoaderData} from '@remix-run/react';

export async function loader({request, context}) {
  const url = new URL(request.url);
  const firstName = url.searchParams.get('firstName');
  const lastName = url.searchParams.get('lastName');
  const res = await context.ClientGet(
    `users/find-couple?firstName=${firstName}&lastName=${lastName}`,
    context,
  );
  return defer({data: res.data, name: {firstName, lastName}});
}

export default function FindCoupleForm() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const {data, name} = useLoaderData();
  return (
    <div>
      {name?.firstName ? (
        <CoupleListing data={data} />
      ) : (
        <div className="flex justify-center items-center h-screen">
          <form method="GET" className="flex flex-col gap-4 w-1/3">
            <h2 className="text-2xl font-bold">Find a Couple</h2>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Search
              by couple name and/or city.
            </p>
            <div>
              <label htmlFor="firstName" className="block font-medium mb-1">
                First Name *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={firstName}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block font-medium mb-1">
                Last Name *
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={lastName}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                required
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
function CoupleListing({data}) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Couples Listing</h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b text-center">Couple Name</th>
            <th className="py-2 px-4 border-b text-center">Image</th>
            <th className="py-2 px-4 border-b text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((couple) => (
            <tr key={couple.id}>
              <td className="py-2 px-4 border-b text-center">{couple.firstName + couple.lastName}</td>
              <td className="py-2 px-4 border-b text-center">
                <img
                  src={`path/to/coupleImage.png`}
                  alt="Couple"
                  className="w-16 h-16 mx-auto"
                />
              </td>
              <td className="py-2 px-4 border-b text-center">
                <a href={`/single/couple`}>
                  <button className="bg-blue-500 text-white px-4 py-2 rounded">
                    View Profile
                  </button>
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
