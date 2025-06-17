import {
  useActionData,
  useLoaderData,
  useSubmit,
  useFetcher,
  redirect,
} from '@remix-run/react';
import {useEffect, useState, useRef} from 'react';
import ButtonComponent from '~/components/Button';

export async function loader({request, context, params}) {
  if (!params.handle || params.handle === '[object Object]') {
    return {data: {}};
  }
  const res = await context.ClientGet(`events/${params.handle}`, context);
  const user = context.session.get('@User')
  const userData = await context.ClientGet(`users/${user.user.id}`, context);

  return {data: res?.data || {}, userData: userData?.data || {}};
}
export async function action({request, context}) {
  const contentType = request.headers.get('content-type') || '';
  let body, file;

  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    body = {};
    for (let [key, value] of formData.entries()) {
      if (key === 'file') {
        file = value;
      } else if (key === 'hashtags') {
        try {
          body.hashtags = JSON.parse(value);
        } catch {
          body.hashtags = String(value).split(',').map((tag) => tag.trim());
        }
      } else if (!isNaN(Number(value)) && value !== '') {
        body[key] = Number(value);
      } else {
        body[key] = value;
      }
    }
    // Add file to body for backend compatibility
    if (file) {
      body.file = file;
    }
    try {
      const response = await context.ClientPut(
        body,
        `events/${body.id}`,
        context,
      );
      if (response?.code === 200) {
        return redirect(`/dashboard/registry`);
      } else {
        return {error: response?.message || 'Failed to update profile'};
      }
    } catch (error) {
      return {error: error.message};
    }
  } else {
    // Handle JSON as before
    const {payload} = await request.json();
    try {
      const response = await context.ClientPut(
        payload,
        `events/${payload.id}`,
        context,
      );
      if (response?.code === 200) {
        return redirect(`/dashboard/registry`);
      } else {
        return {error: response?.message || 'Failed to update profile'};
      }
    } catch (error) {
      return {error: error.message};
    }
  }
}

export default function Index() {
  const {data, userData} = useLoaderData();
  const submit = useSubmit();
  const [eventState, setEventState] = useState(() => {
    // Initialize state with data from the loader
    const initialState = {
      coupleName: `${userData.user.firstName} & ${userData.user.fianceFirstName}` || '',
      hashtag: data.hashtags || [],
      weddingDate: data.eventDate || '',
      weddingTime: data.weddingTime || '',
      location: data.location || '',
      city: data.city || '',
      province: data.province || '',
      noOfGuest: Number(data.noOfGuest) || 0,
      welcomeMessage: data.welcomeMessage || '',
      id: Number(data.id) || 0,
      eventTypeId: Number(data.eventTypeId) || 0,
    };

    // Add image data if it exists
    if (data.image) {
      initialState.image = {
        originalName: data.image.originalName || '',
        fileName: data.image.fileName || '',
        fileUrl: data.image.fileUrl || '',
        mimeType: data.image.mimeType || '',
        size: data.image.size || 0,
      };
    }

    return initialState;
  });
  // Track if a new image file is selected
  const [newImageFile, setNewImageFile] = useState(null);

  // Handle image change (accepts a file directly)
  const handleImageChange = (imgFile) => {
    if (!imgFile) return;
    setNewImageFile(imgFile);
    // Do NOT update eventState.image here!
  };

  const handleChange = (e) => {
    const {name, value} = e.target;
    // Update the corresponding state value dynamically based on the input field's name
    setEventState((prevState) => ({
      ...prevState,
      [name]:
        name === 'hashtag' ? value.split(',').map((tag) => tag.trim()) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    // Ensure hashtags is a JSON string for backend
    let hashtagsValue = eventState.hashtag;
    if (!Array.isArray(hashtagsValue)) {
      try {
        hashtagsValue = JSON.parse(hashtagsValue);
      } catch {
        hashtagsValue = String(hashtagsValue).split(',').map((tag) => tag.trim());
      }
    }
    const payload = {
      eventDate: eventState.weddingDate,
      noOfGuest: Number(eventState.noOfGuest),
      eventTypeId: Number(eventState.eventTypeId),
      registryId: Number(data.registryId),
      coupleName: eventState.coupleName,
      hashtags: hashtagsValue,
      weddingTime: eventState.weddingTime,
      location: eventState.location,
      city: eventState.city,
      province: eventState.province,
      welcomeMessage: eventState.welcomeMessage,
      id: Number(eventState.id),
      name: eventState.coupleName,
    };

    if (newImageFile) {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('file', newImageFile);
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'image') return; // Do NOT append image
        if (key === 'hashtags') {
          formData.append('hashtags', JSON.stringify(value));
        } else if (typeof value === 'number' || typeof value === 'string') {
          formData.append(key, String(value));
        }
      });

      // Use fetch to your backend API endpoint
      const response = await fetch(`http://localhost:3040/api/events/${eventState.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        window.location.href = '/dashboard/registry';
      } else {
        const error = await response.json().catch(() => ({}));
        alert(error.message || 'Failed to update event');
      }
    } else {
      // No new image, send as JSON
      const response = await fetch(`http://localhost:3040/api/events/${eventState.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        window.location.href = '/dashboard/registry';
      } else {
        const error = await response.json().catch(() => ({}));
        alert(error.message || 'Failed to update event');
      }
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="shadow-lg rounded-lg p-8 w-full max-w-4xl border bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Edit Page</h1>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-8">
            <div className="flex-1">
              <div className="border rounded-md p-4 flex flex-col items-center">
                <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                  {newImageFile ? (
                    <img src={URL.createObjectURL(newImageFile)} alt="Preview" className="max-h-48 object-contain" />
                  ) : eventState.image?.fileUrl ? (
                    <img src={eventState.image.fileUrl} alt="Current" className="max-h-48 object-contain" />
                  ) : (
                    <span className="text-gray-500">Upload New Photo (Max 5MB)</span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-4"
                  onChange={e => handleImageChange(e.target.files[0])}
                />
                <p className="text-sm text-gray-500 mt-2">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label
                    className="block font-medium mb-1"
                    htmlFor="coupleName"
                  >
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
                    value={eventState.hashtag.join(', ')}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label
                    className="block font-medium mb-1"
                    htmlFor="weddingDate"
                  >
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
                  <label
                    className="block font-medium mb-1"
                    htmlFor="weddingTime"
                  >
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
            <ButtonComponent
              text="save"
              type="submit"
              className="bg-black text-white px-6 py-2 rounded-lg"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
