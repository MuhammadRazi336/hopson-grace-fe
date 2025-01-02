// import { json } from '@remix-run/node';
// import { Form } from '@remix-run/react';
// import { useRef } from 'react';



export default function FindCoupleForm({ onSearch }) {
  const firstNameRef = null;
  const lastNameRef = null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const firstName = firstNameRef.current.value;
    const lastName = lastNameRef.current.value;
    onSearch({ firstName, lastName });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-1/3">
        <h2 className="text-2xl font-bold">Find a Couple</h2>
        <p className="text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Search by couple name and/or city.
        </p>
        <div>
          <label htmlFor="firstName" className="block font-medium mb-1">First Name *</label>
          <input
            id="firstName"
            type="text"
            ref={firstNameRef}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block font-medium mb-1">Last Name *</label>
          <input
            id="lastName"
            type="text"
            ref={lastNameRef}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
            required
          />
        </div>
        <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg">
          Search
        </button>
      </form>
    </div>
  );
}
  