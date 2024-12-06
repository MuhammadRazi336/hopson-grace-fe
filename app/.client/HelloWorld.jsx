import { useEffect } from "react";
import Auth from "~/Services/Auth.js";

const HelloWorld = () => {
  useEffect(() => {
    LoginEffect()
  }, []);

  const LoginEffect = async () => {
    const payload = {
      email:'subhan@mailinator.com',
      password:"12345678"
    }
    const data = await Auth.Login(payload);
    console.log(data , "My data")
  }
  return (
    <div>Hello World from Client</div>
  )
};
export default HelloWorld;
