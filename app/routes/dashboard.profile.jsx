const index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="shadow-lg rounded-lg p-8 w-full max-w-4xl border bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Edit Page</h1>
        <div className="flex gap-8">
          <div className="flex-1">
            <div className="bg-gray-200 h-64 flex items-center justify-center rounded-lg">
              <button className="bg-white text-gray-700 border border-gray-400 px-4 py-2 rounded-lg">
                Upload New Photo
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block font-medium mb-1" htmlFor="coupleName">
                  Couple Name
                </label>
                <input
                  id="coupleName"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-medium mb-1" htmlFor="hashtag">
                  Hashtag
                </label>
                <input
                  id="hashtag"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1" htmlFor="weddingDate">
                  Wedding Date
                </label>
                <input
                  id="weddingDate"
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1" htmlFor="weddingTime">
                  Wedding Time
                </label>
                <input
                  id="weddingTime"
                  type="time"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-medium mb-1" htmlFor="location">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1" htmlFor="city">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block font-medium mb-1" htmlFor="province">
                  Province
                </label>
                <input
                  id="province"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-medium mb-1" htmlFor="guests">
                  Number of Guests
                </label>
                <input
                  id="guests"
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
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
            id="welcomeMessage"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 h-28"
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
