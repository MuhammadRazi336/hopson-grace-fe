import {
  useActionData,
  useLoaderData,
  useSubmit,
  useFetcher,
  redirect,
} from '@remix-run/react';
import {useEffect, useState, useRef} from 'react';
import ButtonComponent from '~/components/Button';
import { Footer } from '~/components/Footer';
import NotificationCard from '~/components/NotificationCard';
import RegistryStatusCard from '~/components/RegistryStatusCard';

export async function loader({request, context, params}) {
  if (!params.handle || params.handle === '[object Object]') {
    return {data: {}};
  }
  const user = context.session.get('@User');
  const registry = context.session.get('@Registry');


  const [eventRes, userRes, shippingRes] = await Promise.all([
    context.ClientGet(`events/${params.handle}`, context),
    context.ClientGet(`users/${user.user.id}`, context),
    context.ClientGet(`users/shippingAddress/${user.user.id}`, context),
  ]);

  const userData = userRes?.data || {};
  const shippingData = shippingRes?.data || {};

  // Combine shipping data into the main user object for easier state management

  return {data: eventRes?.data || {}, userData: userData || {}, shippingData: shippingData || {}, registry: registry || {}, user};
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
          body.hashtags = String(value)
            .split(',')
            .map((tag) => tag.trim());
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
  const {data, userData, shippingData, registry, user} = useLoaderData();
  const [editForm, setEditForm] = useState(false);

  // Consolidated state for the entire form
  const [formState, setFormState] = useState({
    // Event Details
    coupleName:
      data.coupleName ||
      `${userData.user.firstName} & ${userData.user.fianceFirstName}`,
    hashtag: data.hashtags?.join(', ') || '',
    weddingDate: data.eventDate?.split('T')[0] || '',
    weddingTime: data.weddingTime || '',
    venue: data.location || '',
    location: data.city || '',
    noOfGuests: data.noOfGuest || 0,
    welcomeMessage: data.welcomeMessage || '',
    // User Details
    yourFirstName: userData.user.firstName || '',
    yourLastName: userData.user.lastName || '',
    fianceFirstName: userData.user.fianceFirstName || '',
    fianceLastName: userData.user.fianceLastName || '',
    // Shipping Details (assuming these are stored on the user object)
    shippingAddress: shippingData.address || '',
    shippingPhone: shippingData.phoneNumber || '',
    shippingPostalCode: shippingData.postalCode || '',
    shippingCity: shippingData.city || '',
    shippingProvince: shippingData.province || '',
    shippingCountry: shippingData.country || '',
    // IDs
    eventId: data.id,
    userId: userData.user.id,
    image: data.image,
  });

  const [newImageFile, setNewImageFile] = useState(null);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormState((prevState) => ({...prevState, [name]: value}));
  };

  const handleImageChange = (file) => {
    if (file) {
      setNewImageFile(file);
      setFormState((prevState) => ({
        ...prevState,
        image: {...prevState.image, fileUrl: URL.createObjectURL(file)},
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Event Payload
    const eventPayload = {
      id: formState.eventId,
      coupleName: formState.coupleName,
      hashtags: formState.hashtag.split(',').map((s) => s.trim()),
      eventDate: formState.weddingDate,
      weddingTime: formState.weddingTime,
      location: formState.venue, // venue field is location in db
      city: formState.location, // location field is city in db
      noOfGuest: Number(formState.noOfGuests),
      welcomeMessage: formState.welcomeMessage,
      name: formState.coupleName,
    };

    // 2. User Payload
    const userPayload = {
      id: formState.userId,
      firstName: formState.yourFirstName,
      lastName: formState.yourLastName,
      fianceFirstName: formState.fianceFirstName,
      fianceLastName: formState.fianceLastName,
    };

    // 3. Shipping Payload
    const shippingPayload = {
      id: shippingData.id,
      address: formState.shippingAddress,
      phoneNumber: formState.shippingPhone,
      postalCode: formState.shippingPostalCode,
      city: formState.shippingCity,
      province: formState.shippingProvince,
      country: formState.shippingCountry,
    };

    try {
      const apiCalls = [];

      // API Call for Event Data
      if (newImageFile) {
        const eventFormData = new FormData();
        eventFormData.append('file', newImageFile);
        for (const [key, value] of Object.entries(eventPayload)) {
          eventFormData.append(
            key,
            Array.isArray(value) ? JSON.stringify(value) : value,
          );
        }
        apiCalls.push(
          fetch(`https://dev-hopsongrace.codup.io/api/events/${formState.eventId}`, {
            method: 'PUT',
            body: eventFormData,
          }),
        );
      } else {
        apiCalls.push(
          fetch(`https://dev-hopsongrace.codup.io/api/events/${formState.eventId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(eventPayload),
          }),
        );
      }

      // API Call for User Data
      apiCalls.push(
        fetch(`https://dev-hopsongrace.codup.io/api/users/${formState.userId}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(userPayload),
        }),
      );

      // API Call for Shipping Data
      apiCalls.push(
        fetch(
          `https://dev-hopsongrace.codup.io/api/users/shippingAddress/${shippingData.id}`,
          {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(shippingPayload),
          },
        ),
      );

      const responses = await Promise.all(apiCalls);

      const hasError = responses.some((res) => !res.ok);

      if (hasError) {
        // Find the first error to display
        const errorResponse = responses.find((res) => !res.ok);
        const errorData = await errorResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to update with status ${errorResponse.status}`,
        );
      }

      alert('All details updated successfully!');
      setEditForm(false); // Switch back to view mode
      // Optionally, you can redirect or refresh data here.
      window.location.reload();
    } catch (error) {
      alert(`An error occurred: ${error.message}`);
    }
  };

  return (
    <>
      <div className="mx-auto pt-[80px]">
        <div className="flex xl:flex-nowrap flex-wrap gap-4 flex-shrink-0 pb-16">
          <div className="w-full xl:w-9/12 flex flex-col gap-y-4 items-center pb-8">
            <h2 className="mt-0 ivyora lg:text-3xl xl:text-4xl 2xl:text-[48px] text-[24px] prata text-center lg:leading-[60px] font-normal mb-1">
              <span className="prata uppercase">My registry</span> details
            </h2>
            <img
              src="/assets/Images/profile-view-page-bdr.png"
              alt="Couple"
              className="max-w-[630px] h-auto mx-auto"
            />

            <div className="bg-[#446184] max-w-4xl mx-12 mt-10 text-white w-full min-h-[500px]">
              {editForm ? (
                <EditForm
                  state={formState}
                  onStateChange={handleChange}
                  onImageChange={handleImageChange}
                />
              ) : (
                <ViewForm state={formState} />
              )}
            </div>

            <div className="flex max-w-4xl w-full justify-end">
              {editForm ? (
                <button
                  onClick={handleSubmit}
                  className="uppercase text-[#223247] border border-[#223247] cursor-pointer font-bold text-lg mt-5 px-12 py-2 bg-white"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setEditForm(true)}
                  className="uppercase text-[#223247] border-b border-[#223247] cursor-pointer font-bold text-lg mt-5 block"
                >
                  Edit my info
                </button>
              )}
            </div>
          </div>
          <div className="w-full xl:w-3/12 flex flex-col gap-y-4">
            <div>
              <NotificationCard />
            </div>
            <div>
              <RegistryStatusCard status={registry?.status} registryId={registry?.id} token={user?.accessToken}/>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

function EditForm({state, onStateChange, onImageChange}) {
  return (
    <form className="grid grid-cols-2 gap-x-8 gap-y-4 p-8 bg-[#375a7f] text-white">
      {/* Image Upload */}
      <div className="col-span-2 flex flex-col items-center border border-gray-400 p-4 rounded-md">
        <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center overflow-hidden mb-4">
          {state.image?.fileUrl ? (
            <img
              src={state.image.fileUrl}
              alt="Preview"
              className="max-h-48 object-contain"
            />
          ) : (
            <span className="text-gray-500">Upload New Photo</span>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          className="text-sm"
          onChange={(e) => onImageChange(e.target.files[0])}
        />
      </div>

      {/* User and Fiancé Details */}
      <div>
        <label className="block font-medium mb-1 text-base" htmlFor="yourFirstName">
          YOUR FIRST NAME*
        </label>
        <input
          type="text"
          id="yourFirstName"
          name="yourFirstName"
          value={state.yourFirstName}
          onChange={onStateChange}
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <label className="block font-medium mb-1 text-base" htmlFor="yourLastName">
          YOUR LAST NAME*
        </label>
        <input
          type="text"
          id="yourLastName"
          name="yourLastName"
          value={state.yourLastName}
          onChange={onStateChange}
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <label className="block font-medium mb-1 text-base" htmlFor="fianceFirstName">
          YOUR FIANCÉ'S FIRST NAME*
        </label>
        <input
          type="text"
          id="fianceFirstName"
          name="fianceFirstName"
          value={state.fianceFirstName}
          onChange={onStateChange}
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <label className="block font-medium mb-1 text-base" htmlFor="fianceLastName">
          YOUR FIANCÉ'S LAST NAME*
        </label>
        <input
          type="text"
          id="fianceLastName"
          name="fianceLastName"
          value={state.fianceLastName}
          onChange={onStateChange}
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>

      {/* Event Details */}
      <div>
        <label className="block font-medium mb-1 text-base" htmlFor="weddingDate">
          WEDDING DATE*
        </label>
        <input
          type="date"
          id="weddingDate"
          name="weddingDate"
          value={state.weddingDate}
          onChange={onStateChange}
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <label className="block font-medium mb-1 text-base" htmlFor="venue">
          WEDDING VENUE
        </label>
        <input
          type="text"
          id="venue"
          name="venue"
          value={state.venue}
          onChange={onStateChange}
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-medium mb-1 text-base" htmlFor="location">
            WEDDING LOCATION
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={state.location}
            onChange={onStateChange}
            className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
          />
        </div>
        <div>
          <label className="block font-medium mb-1 text-base" htmlFor="noOfGuests">
            NO. OF GUESTS
          </label>
          <input
            type="number"
            id="noOfGuests"
            name="noOfGuests"
            value={state.noOfGuests}
            onChange={onStateChange}
            className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
          />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-1 text-base" htmlFor="hashtag">
          WEDDING HASHTAG
        </label>
        <input
          type="text"
          id="hashtag"
          name="hashtag"
          value={state.hashtag}
          onChange={onStateChange}
          placeholder="e.g., #HannaAndMax"
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>

      {/* Shipping Address */}
      <div className="col-span-2 font-medium mb-2 mt-10">
        YOUR SHIPPING ADDRESS
      </div>
      <div>
        <input
          type="text"
          name="shippingAddress"
          value={state.shippingAddress}
          onChange={onStateChange}
          placeholder="Address*"
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <input
          type="text"
          name="shippingPhone"
          value={state.shippingPhone}
          onChange={onStateChange}
          placeholder="Phone Number*"
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <input
          type="text"
          name="shippingPostalCode"
          value={state.shippingPostalCode}
          onChange={onStateChange}
          placeholder="Postal Code*"
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <input
          type="text"
          name="shippingCity"
          value={state.shippingCity}
          onChange={onStateChange}
          placeholder="City*"
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <input
          type="text"
          name="shippingProvince"
          value={state.shippingProvince}
          onChange={onStateChange}
          placeholder="Province/State*"
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <input
          type="text"
          name="shippingCountry"
          value={state.shippingCountry}
          onChange={onStateChange}
          placeholder="Country*"
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
    </form>
  );
}

function ViewForm({state}) {
  return (
    <div className="grid grid-cols-2">
      <div className="p-8 flex flex-col gap-6">
        <div>
          <div className="text-xs tracking-widest mb-1">YOU</div>
          <div className="text-lg ">
            {state.yourFirstName} {state.yourLastName}
          </div>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-1">YOUR FIANCÉ</div>
          <div className="text-lg ">
            {state.fianceFirstName} {state.fianceLastName}
          </div>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-1">
            YOUR SHIPPING ADDRESS
          </div>
          <div className="text-lg whitespace-pre-line">
            {`${state.shippingAddress || '-'}\n${
              state.shippingCity || ''
            }, ${state.shippingProvince || ''}\n${
              state.shippingPostalCode || ''
            }\n${state.shippingCountry || ''}`}
          </div>
        </div>
      </div>
      <div className="p-8 flex flex-col gap-6">
        <div>
          <div className="text-xs tracking-widest mb-1">WEDDING DATE</div>
          <div className="text-lg ">{state.weddingDate}</div>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-1">WEDDING VENUE</div>
          <div className="text-lg ">{state.venue || '-'}</div>
        </div>
        <div className="flex flex-row gap-x-4">
          <div>
            <div className="text-xs tracking-widest mb-1">
              WEDDING LOCATION (CITY)
            </div>
            <div className="text-lg ">{state.location || '-'}</div>
          </div>
          <div>
            <div className="text-xs tracking-widest mb-1">NO. OF GUESTS</div>
            <div className="text-lg ">{state.noOfGuests || '0'}</div>
          </div>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-1">WEDDING HASHTAG</div>
          <div className="text-lg ">{state.hashtag || '-'}</div>
        </div>
      </div>
    </div>
  );
}