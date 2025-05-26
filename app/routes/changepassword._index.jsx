import { useActionData, useSubmit } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";
import { useState } from "react";
import ButtonComponent from "~/components/Button";
import Input from "~/components/Input";

export async function loader(args) {
    const {context} = args;
    return {context};
}

export async function action({request, context}) {
    const body = await request.json();
    const {payload} = body;

    try{
        const response = await context.ClientPost(payload, 'auth/change-password', context);
        if(response?.code == 200){
            return redirect('/login');
        }
        else{
            return {...response};
        }
    } catch (error) {
    }
    return null;
}

const ChangePassword = () => {
    const submit = useSubmit();
    const actionData = useActionData();
    const [formData, setFormData] = useState({
        passwordToken: '',
        password: '',
        confirmPassword: '',
    })

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = {
            passwordToken: formData.passwordToken,
            password: formData.password,
            confirmPassword: formData.confirmPassword,
        }
        submit({payload}, {method: 'post', encType: 'application/json'})
    }

    return(
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Change Password</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-4">
              <Input
                type="text"
                required={true}
                label="Reset Token"
                name="passwordToken"
                value={formData.passwordToken}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <Input
                type="password"
                required={true}
                label="New Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-4">
              <Input
                type="password"
                required={true}
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
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

export default ChangePassword;