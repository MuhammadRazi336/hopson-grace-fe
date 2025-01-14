import {useLoaderData} from '@remix-run/react';
import {useEffect, useState} from 'react';
import ImageUpload from '~/components/ImageUpload';

export async function loader({request, context}) {
  const registry = context?.session?.get('@Registry');
  const res = await context.ClientGet(`registries/${registry[0].id}`, context);
  return {data: res?.data || {}};
}

const index = () => {
  const {data} = useLoaderData();
  const [eventState, setEventState] = useState({
    coupleName: '',
    hashtag: '',
    weddingDate: '',
    weddingTime: '',
    location: '',
    city: '',
    province: '',
    noOfGuest: '',
    welcomeMessage: '',
    image: '',
  });
  useEffect(() => {
    if (data?.events?.length) {
      setEventState({
        ...eventState,
        image: data.events[0].image,
        weddingDate: data.events[0].eventDate,
        weddingTime: data.events[0].weddingTime,
        hashtag: data.events[0].hashtag,
        coupleName: data.events[0].coupleName,
        location: data.events[0].location,
        city: data.events[0].city,
        noOfGuest: data.events[0].noOfGuest,
        welcomeMessage: data.events[0].welcomeMessage,
        province: data.events[0].province,
      });
    }
  }, [data]);
  const handleChange = (e) => {
    const {name, value} = e.target;
    // Update the corresponding state value dynamically based on the input field's name
    setEventState({
      ...eventState,
      [name]: value,
    });
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="shadow-lg rounded-lg p-8 w-full max-w-4xl border bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Edit Page</h1>
        <div className="flex gap-8">
          <div className="flex-1">
            <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">
              <ImageUpload
                onImageChange={(img) => {
                  setEventState({
                    ...eventState,
                    image: img,
                  });
                }}
                initialImage={eventState.image}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block font-medium mb-1" htmlFor="coupleName">
                  Couple Name
                </label>
                <input
                  name="coupleName"
                  id="coupleName"
                  value={eventState.coupleName}
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  onChange={handleChange} // Update state on change
                />
              </div>
              <div className="col-span-2">
                <label className="block font-medium mb-1" htmlFor="hashtag">
                  Hashtag
                </label>
                <input
                  name="hashtag"
                  id="hashtag"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  value={eventState.hashtag}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block font-medium mb-1" htmlFor="weddingDate">
                  Wedding Date
                </label>
                <input
                  value={eventState.weddingDate}
                  id="weddingDate"
                  name="weddingDate"
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  onChange={handleChange} // Update state on change
                />
              </div>
              <div>
                <label className="block font-medium mb-1" htmlFor="weddingTime">
                  Wedding Time
                </label>
                <input
                  id="weddingTime"
                  type="time"
                  name="weddingTime"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  onChange={handleChange}
                  value={eventState.weddingTime}
                />
              </div>
              <div className="col-span-2">
                <label className="block font-medium mb-1" htmlFor="location">
                  Location
                </label>
                <input
                  name="location"
                  id="location"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  onChange={handleChange}
                  value={eventState.location}
                />
              </div>
              <div>
                <label className="block font-medium mb-1" htmlFor="city">
                  City
                </label>
                <input
                  name="city"
                  id="city"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  onChange={handleChange}
                  value={eventState.city}
                />
              </div>
              <div>
                <label className="block font-medium mb-1" htmlFor="province">
                  Province
                </label>
                <input
                  name="province"
                  id="province"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  onChange={handleChange}
                  value={eventState.province}
                />
              </div>
              <div className="col-span-2">
                <label className="block font-medium mb-1" htmlFor="noOfGuest">
                  Number of Guests
                </label>
                <input
                  name="noOfGuest"
                  id="noOfGuest"
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  onChange={handleChange}
                  value={eventState.noOfGuest}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block font-medium mb-1" htmlFor="welcomeMessage">
            Welcome Message
          </label>
          <textarea
            name="welcomeMessage"
            id="welcomeMessage"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-28"
            onChange={handleChange}
            value={eventState.welcomeMessage}
          ></textarea>
        </div>

        <div className="flex gap-4 mt-6">
          <button className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg">
            Change Page Style
          </button>
          <button className="bg-black text-white px-6 py-2 rounded-lg">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default index;
