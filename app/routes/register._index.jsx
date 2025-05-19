import {useRef, useState} from 'react';
import Heading from '~/components/Heading.jsx';
import Input from '~/components/Input.jsx';
import Stepper from '~/components/Stepper.jsx';
import Button from '~/components/Button.jsx';
import {useSubmit, useActionData} from '@remix-run/react';
import {redirect} from '@shopify/remix-oxygen';
import StepsAndImage from '~/components/StepsAndImage';
import arrow from "/assets/Images/arrow.png"


export async function action({request, context}) {
const body = await request.json();
const {payload} = body;
try {
const response = await context.ClientPost(payload, 'auth/signup', context);
if (response?.code === 200) {
const user = response.data;
context.session.set('@User', user);
const cookie = await context.session.commit();
return redirect('/onboarding', {
headers: {
'Set-Cookie': cookie,
},
});
} else {
return {...response};
}
} catch (e) {
return {...e};
}
}

const RegisterIndex = () => {
const submit = useSubmit();
const actionData = useActionData();
console.log(actionData, 'Action');

const [formData, setFormData] = useState({
firstName: '',
lastName: '',
fianceFirstName: '',
fianceLastName: '',
email: '',
password: '',
confirmPassword: '',
confirmEmail: '',
});

const handleInputChange = (e) => {
const {name, value} = e.target;
setFormData((prev) => ({
...prev,
[name]: value,
}));
};

const handleSignup = async (e) => {
e.preventDefault();
const payload = {
firstName: formData.firstName,
lastName: formData.lastName,
fianceFirstName: formData.fianceFirstName,
fianceLastName: formData.fianceLastName,
email: formData.email,
password: formData.password,
confirmPassword: formData.confirmPassword,
confirmEmail: formData.confirmEmail,
};
submit({payload}, {method: 'post', encType: 'application/json'});
};
return (
<div className="flex justify-center items-center min-h-screen bg-white">
  <StepsAndImage title="let's get to know each other." stepNo="1" totalSteps="9" content={ <div className="flex h-full items-center">
    {/* Stepper for progress */}

    <form className="space-y-6 max-w-full w-full mx-auto" onSubmit={handleSignup}>
      {/* Render the step content dynamically */}
      <div className="text-center mt-6">
        <Heading text="YOUR NAME?" classes="font-normal text-[22px]  m-0" />
      </div>
      <div className="grid grid-cols-2 gap-4 max-[580px]:grid-cols-1">
        <Input value={formData.firstName} onChange={handleInputChange} label="First *" name="firstName" required className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full" classNameLabel="max-[580px]:text-left" />
        <Input value={formData.lastName} onChange={handleInputChange} label="Last *" name="lastName" required className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full" classNameLabel="max-[580px]:text-left" />
      </div>
      <div className="text-center">
        <Heading text="AND YOUR FIANCÉ?" classes="font-normal text-[22px] m-0"  />
      </div>
      <div className="grid grid-cols-2 gap-4 max-[580px]:grid-cols-1">
        <Input value={formData.fianceFirstName} onChange={handleInputChange} label="First *"
          name="fianceFirstName" required className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"  classNameLabel="max-[580px]:text-left" />
        <Input value={formData.fianceLastName} onChange={handleInputChange} label="Last *"
          name="fianceLastName" required className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full" classNameLabel="max-[580px]:text-left" />
      </div>
      <div className="grid grid-cols-2 gap-4 max-[580px]:grid-cols-1">
        <Input value={formData.email} onChange={handleInputChange} placeholder="Email *" name="email" type="email" required className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full" />
        <Input value={formData.confirmEmail} onChange={handleInputChange} placeholder="Confirm Email *" name="confirmEmail" className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full"
          type="email" required />
      </div>
      {/* <div className="text-center">
        <Heading text="Create your account" className="text-center" />
      </div> */}
      <div className="grid grid-cols-2 gap-4 max-[580px]:grid-cols-1">
        <Input value={formData.password} onChange={handleInputChange} placeholder="Password *" name="password" type="password"
          required className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full" />
        <Input value={formData.confirmPassword} onChange={handleInputChange} placeholder="Confirm Password *"
          name="confirmPassword" type="password" required className="rounded-none p-5 border-[#B9B4AE] border-2 bg-white text-black w-full" />
      </div>

      {/* Back and Next buttons */}
      <div className="flex justify-end mt-4 absolute bottom-6 right-6">
        {/* Add any additional buttons if needed */}
        <button type="submit" text="Next" className="absolute right-10 bottom-2.5 flex items-center uppercase font-bold gap-2 z-10" >
          Next <img src={arrow} alt="" />
        </button>
      </div>
    </form>
    <div style={{
            color: actionData?.statusCode >= 400 ? 'red' : 'inherit',
          }}>
      {actionData?.statusCode >= 400 && actionData?.message?.length
      ? actionData?.message[0]
      : actionData?.message}
    </div>
</div>} />
{/* Main content wrapper */}
<Stepper step={1} totalSteps={8} />

</div>
);
};

export default RegisterIndex;