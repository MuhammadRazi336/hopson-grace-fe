import { useActionData, useSubmit } from "@remix-run/react";
import { useState } from "react";
import ButtonComponent from "~/components/Button";
import Input from "~/components/Input";
import { redirect } from "@remix-run/server-runtime";

export async function loader(args) {
    const {context} = args;
    return {context};
}

export async function action({request, context}) {
    const body = await request.json();
    const {payload} = body;

    try{
        const response = await context.ClientPost(payload, 'auth/forget-password', context);
        if(response?.code == 200){
            alert('Email sent successfully');
        }
        else{
            return {...response};
        }
    } catch (error) {
    }
    return redirect('/forgotpassword');
}

const ForgotPassword = () => {
    const submit = useSubmit();
    const actionData = useActionData();
    const [formData, setFormData] = useState({
        email: '',
    })

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            email: formData.email,
        };
        submit({payload}, {method: 'post', encType: 'application/json'});
    }

    return(
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Enter your email to reset your password</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-4">
              <Input
                type="email"
                required={true}
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div
              style={{
                color: actionData?.statusCode >= 400 ? 'red' : 'inherit',
              }}
            >
              {actionData?.statusCode >= 400 && Array.isArray(actionData?.message)
                ? actionData?.message[0]
                : actionData?.message}
            </div>
            <ButtonComponent type="submit" className="w-full" text={'Enter'} />
          </form>
        </div>
      </div>
    )
}

export default ForgotPassword;