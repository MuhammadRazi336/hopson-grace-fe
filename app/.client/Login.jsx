import Input from "~/components/Input.jsx";
import { useState } from "react";
import ButtonComponent from "~/components/Button.jsx";
import Auth from "~/Services/Auth.js";

const Login = ({ session }) => {
  const formData = useState({
    email: "subhan@mailinator.com",
    password: ""
  });
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Directly modifying the ref object to store new value
    formData[name] = value;
  };

  const onLogin = async  () => {
    const payload = {
      email:formData.email,
      password:formData.password
    }
    try {
      const data = await Auth.Login(payload);
      if (data) {
        console.log(data.data ,' Data')
      }
    } catch (e) {
    console.log(e , "E")
    }
  };
  return (<div className="bg-gray-100 flex items-center justify-center min-h-screen">
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
      <div className="mb-4">
        <Input label="Email"
               name="email"
               value={formData?.email}
               onChange={handleInputChange} />
      </div>
      <div className="mb-6">
        <Input label="Password"
               name="password"
               value={formData?.password}
               onChange={handleInputChange} />
      </div>
      <ButtonComponent
        onClick={onLogin}
        className="w-full"
        text={"Login"}
      />
    </div>
  </div>);
};
export default Login;
