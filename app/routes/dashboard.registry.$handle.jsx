import {useLoaderData, useSubmit, redirect} from '@remix-run/react';
import {useState} from 'react';
import ButtonComponent from '~/components/Button';
import ImageUpload from '~/components/ImageUpload';

export async function loader({request, context, params}) {
  if (!params.handle || params.handle === '[object Object]') {
    return {data: {}};
  }
  const res = await context.ClientGet(`events/${params.handle}`, context);
  return {data: res?.data || {}};
}
export async function action({request, context}) {
  console.log('Action function called');
  const formData = await request.formData();
  const file = formData.get('file');
  const payload = JSON.parse(formData.get('payload'));
  console.log('Payload received:', payload);
  try {
    // Create FormData for the request
    const formDataToSend = new FormData();

    // If we have a file, append it
    if (file) {
      console.log('Image file found, appending to FormData');
      formDataToSend.append('file', file);
    }
    
    // Append the payload
    formDataToSend.append('payload', JSON.stringify(payload));

    // Log what we're sending
    for (let [key, value] of formDataToSend.entries()) {
      console.log(
        'Request FormData entry:',
        key,
        value instanceof File ? value.name : value,
      );
    }

    // Send the update request with both file and payload
    console.log('Sending update request...');
    const response = await context.ClientPut(
      formDataToSend,
      `events/${payload.id}`,
      context,
    );
    
    console.log('Update response:', response);
    if (response?.code === 200) {
      return redirect(`/dashboard/registry`);
    } else {
      return {error: response?.message || 'Failed to update profile'};
    }
  } catch (error) {
    console.error('Error in action:', error);
    return {error: error.message};
  }
}

export default function Index() {
  const {data} = useLoaderData();
  const submit = useSubmit();
  const [eventState, setEventState] = useState(() => {
    // Initialize state with data from the loader
    const initialState = {
      coupleName: data.coupleName || '',
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

    // Create FormData for file upload
    const formData = new FormData();
    
    // If we have an image file, append it first
    if (eventState.image?.file) {
      console.log('Appending file to FormData');
      formData.append('file', eventState.image.file);
    }

    // Prepare the payload with all event data
    const payload = {
      eventDate: eventState.weddingDate,
      noOfGuest: Number(eventState.noOfGuest),
      eventTypeId: eventState.eventTypeId,
      registryId: Number(data.registryId),
      coupleName: eventState.coupleName,
      hashtags: eventState.hashtag,
      weddingTime: eventState.weddingTime,
      location: eventState.location,
      city: eventState.city,
      province: eventState.province,
      welcomeMessage: eventState.welcomeMessage,
      id: Number(eventState.id),
    };
    
    // Add image data if available (without the file)
    if (eventState.image) {
      payload.image = {
        originalName: eventState.image.originalName,
        fileName: eventState.image.fileName,
        mimeType: eventState.image.mimeType,
        size: eventState.image.size,
      };
    }

    console.log('Appending payload to FormData');
    formData.append('payload', JSON.stringify(payload));

    // Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log(
        'FormData entry:',
        key,
        value instanceof File ? value.name : value,
      );
    }
    
    // Submit the form data
    submit(formData, {
      method: 'post',
      encType: 'multipart/form-data',
    });
  };
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="shadow-lg rounded-lg p-8 w-full max-w-4xl border bg-gray-100">
        <h1 className="text-2xl font-bold mb-6">Edit Page</h1>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-8">
            <div className="flex-1">
              <div className="bg-gray-200 min-h-64 h-auto flex items-center justify-center rounded-lg">
                <ImageUpload
                  initialImage={
                    eventState.image?.fileUrl || data.image?.fileUrl
                  }
                  onImageChange={(imgData) => {
                    setEventState((prev) => ({
                      ...prev,
                      image: {
                        originalName: imgData.originalName,
                        fileName: imgData.fileName,
                        fileUrl: URL.createObjectURL(imgData.file),
                        mimeType: imgData.mimeType,
                        size: imgData.size,
                        file: imgData.file,
                      },
                    }));
                  }}
                />
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
