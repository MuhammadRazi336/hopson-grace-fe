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

export async function loader({request, context, params}) {
  if (!params.handle || params.handle === '[object Object]') {
    return {data: {}};
  }
  const user = context.session.get('@User');
  const registry = await context.ClientGet(
    `registries/by-userId/${user.user.id}`,
    context,
  );

  const eventRes = await context.ClientGet(`events/${params.handle}`, context);
  const userRes = await context.ClientGet(`users/${user.user.id}`, context);

  let shippingRes;
  try {
    shippingRes = await context.ClientGet(`users/shippingAddress/${user.user.id}`, context);
  } catch (err) {
    shippingRes = { data: {} };
  }

  const userData = userRes?.data || {};
  let shippingData = shippingRes?.data || {};

  // If shipping address not found, create it and fetch again
  if (!shippingData || Object.keys(shippingData).length === 0) {
    const payload = {
      userId: user.user.id,
      address: '',
      phoneNumber: '',
      postalCode: '',
      city: '',
      province: '',
      country: '',
    };
    try {
      await context.ClientPost('users/shippingAddress', payload, context);
      const newShippingRes = await context.ClientGet(`users/shippingAddress/${user.user.id}`, context);
      shippingData = newShippingRes?.data || {};
    } catch (err) {
      // If POST or GET fails, use fallback
      shippingData = {
        address: '',
        phoneNumber: '',
        postalCode: '',
        city: '',
        province: '',
        country: '',
      };
    }
  }

  // After your fallback logic for shippingData
  // Ensure shippingData.id is a valid number
  if (!shippingData.id || isNaN(Number(shippingData.id))) {
    try {
      const newShippingRes = await context.ClientGet(`users/shippingAddress/${user.user.id}`, context);
      shippingData = newShippingRes?.data || shippingData;
    } catch (err) {
      // ignore, keep previous shippingData
    }
  }
  // Final check
  if (!shippingData.id || isNaN(Number(shippingData.id))) {
    shippingData.id = null;
  }

  // Combine shipping data into the main user object for easier state management

  return {data: eventRes?.data || {}, userData: userData || {}, shippingData: shippingData || {}, registry: registry?.data[0] || {}, user};
}
export async function action({request, context}) {
  try {
    const body = await request.json();
    console.log('Action received payload:', body);

    const apiCalls = [];
    const apiBaseUrl = context.env?.API_BASE_URL;

    // 1. Update Event Data
    const eventPayload = {
      id: body.id,
      coupleName: body.coupleName,
      hashtags: body.hashtags,
      eventDate: body.eventDate,
      weddingTime: body.weddingTime,
      location: body.location,
      city: body.city,
      noOfGuest: body.noOfGuest,
      welcomeMessage: body.welcomeMessage,
      name: body.coupleName,
    };

    apiCalls.push(
      context.ClientPut(eventPayload, `events/${body.id}`, context)
    );

    // 2. Update User Data
    const userPayload = {
      id: body.userId,
      firstName: body.firstName,
      lastName: body.lastName,
      fianceFirstName: body.fianceFirstName,
      fianceLastName: body.fianceLastName,
      email: body.email,
    };

    apiCalls.push(
      context.ClientPut(userPayload, `users/${body.userId}`, context)
    );

    // 3. Update/Create Shipping Address
    const shippingPayload = {
      address: body.shippingAddress,
      phoneNumber: body.shippingPhone,
      postalCode: body.shippingPostalCode,
      city: body.shippingCity,
      province: body.shippingProvince,
      country: body.shippingCountry,
    };

    if (!body.shippingId || isNaN(Number(body.shippingId))) {
      // Create new shipping address
      const createPayload = {
        userId: body.userId,
        ...shippingPayload,
      };
      apiCalls.push(
        context.ClientPost(createPayload, 'users/shippingAddress', context)
      );
    } else {
      // Update existing shipping address
      apiCalls.push(
        context.ClientPut(shippingPayload, `users/shippingAddress/${body.shippingId}`, context)
      );
    }

    // Execute all API calls
    const responses = await Promise.all(apiCalls);
    console.log('API responses:', responses);

    // Check for errors
    const hasError = responses.some(response => !response?.code || response.code !== 200);
    
    if (hasError) {
      const errorResponse = responses.find(response => !response?.code || response.code !== 200);
      console.error('API error:', errorResponse);
      return { error: errorResponse?.message || 'Failed to update profile' };
    }

    console.log('All updates successful');
    return redirect('/dashboard/registry');
    
  } catch (error) {
    console.error('Action error:', error);
    return { error: error.message || 'An unexpected error occurred' };
  }
}

export default function Index() {
  const {data, userData, shippingData, registry, user} = useLoaderData();
  const [editForm, setEditForm] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const submit = useSubmit();
  const actionData = useActionData();

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
    email: userData.user.email || '',
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
    // Additional fields needed for submission
    shippingId: shippingData.id,
  });



  // Handle action responses
  useEffect(() => {
    if (actionData) {
      if (actionData.error) {
        console.error('Form submission error:', actionData.error);
        // You can show an error message to the user here
        alert(`Error: ${actionData.error}`);
      } else {
        console.log('Form submitted successfully');
        setEditForm(false);
        setValidationErrors({});
        // Optionally refresh the page or show success message
        window.location.reload();
      }
    }
  }, [actionData]);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormState((prevState) => ({...prevState, [name]: value}));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
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

  // Validation function
  const validateForm = () => {
    const errors = {};

    // User Details Validation
    if (!formState.yourFirstName || formState.yourFirstName.trim() === '') {
      errors.yourFirstName = 'Your first name is required';
    }
    if (!formState.yourLastName || formState.yourLastName.trim() === '') {
      errors.yourLastName = 'Your last name is required';
    }
    if (!formState.fianceFirstName || formState.fianceFirstName.trim() === '') {
      errors.fianceFirstName = 'Fiancé\'s first name is required';
    }
    if (!formState.fianceLastName || formState.fianceLastName.trim() === '') {
      errors.fianceLastName = 'Fiancé\'s last name is required';
    }

    // Event Details Validation
    if (!formState.weddingDate || formState.weddingDate.trim() === '') {
      errors.weddingDate = 'Wedding date is required';
    } else {
      const selectedDate = new Date(formState.weddingDate);
      const today = new Date();
      if (selectedDate < today) {
        errors.weddingDate = 'Wedding date cannot be in the past';
      }
    }

    // Wedding venue and location are now optional - no validation needed

    if (!formState.noOfGuests || formState.noOfGuests <= 0) {
      errors.noOfGuests = 'Number of guests must be greater than 0';
    }

    // Shipping Address fields are now optional - no validation needed

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    // Prepare the payload for submission
    const payload = {
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
      // User data
      userId: formState.userId,
      firstName: formState.yourFirstName,
      lastName: formState.yourLastName,
      fianceFirstName: formState.fianceFirstName,
      fianceLastName: formState.fianceLastName,
      email: formState.email,
      // Shipping data
      shippingAddress: formState.shippingAddress,
      shippingPhone: formState.shippingPhone,
      shippingPostalCode: formState.shippingPostalCode,
      shippingCity: formState.shippingCity,
      shippingProvince: formState.shippingProvince,
      shippingCountry: formState.shippingCountry,
      shippingId: formState.shippingId
    };

    console.log('Submitting payload:', payload);
    
    // Submit the form data as JSON
    submit(payload, { 
      method: 'post',
      encType: 'application/json'
    });
  };

  return (
    <>
      <div className="mx-auto pt-[50px] lg:pt-[4.792vw] xl:pt-[4.792vw] 2xl:pt-[4.792vw]">
        <div className="flex xl:flex-nowrap flex-wrap flex-shrink-0 pb-16">
          <div className="w-full lg:w-9/12 xl:w-9/12 2xl:w-9/12 pl-[24.93vw] max-[1024px]:px-[20px] flex flex-col items-center gap-y-[1.771vw] pb-8">
            <h2 className="mt-0 !pl-0 ivyora uppercase lg:text-[2.5vw] xl:text-[2.5vw] 2xl:text-[2.5vw] text-[24px] prata text-center lg:leading-[3.333vw] xl:leading-[3.333vw] 2xl:leading-[3.333vw] font-normal mb-1">
              <span className="prata">My registry</span> details
            </h2>
            <img
              src="/assets/Images/my-details-bottom-img.png"
              alt="Couple"
              className="max-w-[630px] w-[39.219vw] h-auto mx-auto"
            />

            <div className="bg-[#446184] w-[60.104vw] max-w-full mt-[1.771vw] text-white min-h-[52.083vw] max-[1024px]:w-full">
              {editForm ? (
                <EditForm
                  state={formState}
                  onStateChange={handleChange}
                  onImageChange={handleImageChange}
                  validationErrors={validationErrors}
                />
              ) : (
                <ViewForm state={formState} />
              )}
            </div>

            <div className="flex w-[60.104vw] max-w-full justify-end max-[1024px]:w-full">
              {editForm ? (
                <button
                  onClick={handleSubmit}
                  className="uppercase text-[#223247] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] border border-[#223247] cursor-pointer font-bold text-lg w-[11.458vw] h-[4.063vw] bg-white"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setEditForm(true)}
                  className="uppercase text-[#223247] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[0.938vw] xl:leading-[0.938vw] 2xl:leading-[0.938vw] w-[max-content] border-b border-[#223247] cursor-pointer font-bold text-md block"
                >
                  Edit my info
                </button>
              )}
            </div>
          </div>
          <div className="w-full max-[1024px]:px-[20px] lg:w-3/12 xl:w-3/12 2xl:w-3/12 flex flex-col gap-y-4">
            <div>
              <NotificationCard />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

function EditForm({state, onStateChange, onImageChange, validationErrors}) {
  return (
    <form className="grid grid-cols-2 gap-x-8 gap-y-4 p-8 bg-[#375a7f] text-white">
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
          className={`outline-none text-black w-full border ${validationErrors.yourFirstName ? 'border-[#FD446F]' : 'border-gray-300'} bg-white rounded-none px-4 py-4`}
        />
        {validationErrors.yourFirstName && (
          <p className="text-[#FD446F] text-sm mt-1">{validationErrors.yourFirstName}</p>
        )}
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
          className={`outline-none text-black w-full border ${validationErrors.yourLastName ? 'border-[#FD446F]' : 'border-gray-300'} bg-white rounded-none px-4 py-4`}
        />
        {validationErrors.yourLastName && (
          <p className="text-[#FD446F] text-sm mt-1">{validationErrors.yourLastName}</p>
        )}
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
          className={`outline-none text-black w-full border ${validationErrors.fianceFirstName ? 'border-[#FD446F]' : 'border-gray-300'} bg-white rounded-none px-4 py-4`}
        />
        {validationErrors.fianceFirstName && (
          <p className="text-[#FD446F] text-sm mt-1">{validationErrors.fianceFirstName}</p>
        )}
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
          className={`outline-none text-black w-full border ${validationErrors.fianceLastName ? 'border-[#FD446F]' : 'border-gray-300'} bg-white rounded-none px-4 py-4`}
        />
        {validationErrors.fianceLastName && (
          <p className="text-[#FD446F] text-sm mt-1">{validationErrors.fianceLastName}</p>
        )}
      </div>
      <div>
        <label className="block font-medium mb-1 text-base" htmlFor="email">
          YOUR EMAIL*
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={state.email}
          onChange={onStateChange}
          disabled
          className="outline-none text-black w-full border border-gray-300 bg-gray-100 rounded-none px-4 py-4 cursor-not-allowed"
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
          className={`outline-none text-black w-full border ${validationErrors.weddingDate ? 'border-[#FD446F]' : 'border-gray-300'} bg-white rounded-none px-4 py-4`}
        />
        {validationErrors.weddingDate && (
          <p className="text-[#FD446F] text-sm mt-1">{validationErrors.weddingDate}</p>
        )}
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
            NO. OF GUESTS*
          </label>
          <input
            type="number"
            id="noOfGuests"
            name="noOfGuests"
            value={state.noOfGuests}
            onChange={onStateChange}
            min="1"
            className={`outline-none text-black w-full border ${validationErrors.noOfGuests ? 'border-[#FD446F]' : 'border-gray-300'} bg-white rounded-none px-4 py-4`}
          />
          {validationErrors.noOfGuests && (
            <p className="text-[#FD446F] text-sm mt-1">{validationErrors.noOfGuests}</p>
          )}
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
          placeholder="Address"
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <input
          type="text"
          name="shippingPhone"
          value={state.shippingPhone}
          onChange={onStateChange}
          placeholder="Phone Number"
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <input
          type="text"
          name="shippingPostalCode"
          value={state.shippingPostalCode}
          onChange={onStateChange}
          placeholder="Postal Code"
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <input
          type="text"
          name="shippingCity"
          value={state.shippingCity}
          onChange={onStateChange}
          placeholder="City"
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <input
          type="text"
          name="shippingProvince"
          value={state.shippingProvince}
          onChange={onStateChange}
          placeholder="Province/State"
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
      <div>
        <input
          type="text"
          name="shippingCountry"
          value={state.shippingCountry}
          onChange={onStateChange}
          placeholder="Country"
          className="outline-none text-black w-full border border-gray-300 bg-white rounded-none px-4 py-4"
        />
      </div>
    </form>
  );
}

function ViewForm({state}) {
  return (
    <div className="grid grid-cols-2 max-[600px]:grid-cols-1 py-[3.167vw] px-[3.948vw] gap-[4vw] max-[1024px]:p-[20px]">
      <div className="flex flex-col gap-6">
        <div>
          <div className="text-xs tracking-widest mb-[1.25vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.389vw] xl:leading-[1.389vw] 2xl:leading-[1.389vw]">YOU</div>
          <div className="text-lg leading-lg mb-[3.542vw] uppercase lg:text-[1.667vw] xl:text-[1.667vw] 2xl:text-[1.667vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw]">
            {state.yourFirstName} {state.yourLastName}
          </div>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-[1.25vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.389vw] xl:leading-[1.389vw] 2xl:leading-[1.389vw]">YOUR FIANCÉ</div>
          <div className="text-lg leading-lg mb-[3.542vw] uppercase lg:text-[1.667vw] xl:text-[1.667vw] 2xl:text-[1.667vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw]">
            {state.fianceFirstName} {state.fianceLastName}
          </div>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-[1.25vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.389vw] xl:leading-[1.389vw] 2xl:leading-[1.389vw]">YOUR EMAIL</div>
          <div className="text-lg leading-lg mb-[3.542vw] uppercase lg:text-[1.667vw] xl:text-[1.667vw] 2xl:text-[1.667vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] break-all">{state.email || '-'}</div>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-[1.25vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.389vw] xl:leading-[1.389vw] 2xl:leading-[1.389vw]">
            YOUR SHIPPING ADDRESS
          </div>
          <div className="text-lg leading-lg mb-[3.542vw] uppercase lg:text-[1.667vw] xl:text-[1.667vw] 2xl:text-[1.667vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw]">
            {`${state.shippingAddress || '-'}\n${
              state.shippingCity || ''
            }, ${state.shippingProvince || ''}\n${
              state.shippingPostalCode || ''
            }\n${state.shippingCountry || ''}`}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <div className="text-xs tracking-widest mb-[1.25vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.389vw] xl:leading-[1.389vw] 2xl:leading-[1.389vw]">WEDDING DATE</div>
          <div className="text-lg leading-lg mb-[3.542vw] lowercase lg:text-[1.667vw] xl:text-[1.667vw] 2xl:text-[1.667vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw]">{state.weddingDate}</div>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-[1.25vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.389vw] xl:leading-[1.389vw] 2xl:leading-[1.389vw]">WEDDING VENUE</div>
          <div className="text-lg leading-lg mb-[3.542vw] lowercase lg:text-[1.667vw] xl:text-[1.667vw] 2xl:text-[1.667vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw] ">{state.venue || '-'}</div>
        </div>
        <div className="flex flex-row gap-x-4">
          <div>
            <div className="text-xs tracking-widest mb-[1.25vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.389vw] xl:leading-[1.389vw] 2xl:leading-[1.389vw]">
              WEDDING LOCATION (CITY)
            </div>
            <div className="text-lg leading-lg mb-[3.542vw] lowercase lg:text-[1.667vw] xl:text-[1.667vw] 2xl:text-[1.667vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw]">{state.location || '-'}</div>
          </div>
          <div>
            <div className="text-xs tracking-widest mb-[1.25vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.389vw] xl:leading-[1.389vw] 2xl:leading-[1.389vw]">NO. OF GUESTS</div>
            <div className="text-lg leading-lg mb-[3.542vw] uppercase lg:text-[1.667vw] xl:text-[1.667vw] 2xl:text-[1.667vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw]">{state.noOfGuests || '0'}</div>
          </div>
        </div>
        <div>
          <div className="text-xs tracking-widest mb-[1.25vw] lg:text-[0.938vw] xl:text-[0.938vw] 2xl:text-[0.938vw] lg:leading-[1.389vw] xl:leading-[1.389vw] 2xl:leading-[1.389vw]">WEDDING HASHTAG</div>
          <div className="text-lg leading-lg mb-[3.542vw] uppercase lg:text-[1.667vw] xl:text-[1.667vw] 2xl:text-[1.667vw] lg:leading-[1.875vw] xl:leading-[1.875vw] 2xl:leading-[1.875vw]">{state.hashtag || '-'}</div>
        </div>
      </div>
    </div>
  );
}