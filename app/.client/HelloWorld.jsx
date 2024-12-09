import { useEffect } from "react";
import Auth from "~/Services/Auth.js";
import { redirect } from "@shopify/remix-oxygen";
import { useNavigate } from "@remix-run/react";

const HelloWorld = ({}) => {

  const navigate = useNavigate()
  const LoginEffect = async () => {
    const payload = {
      email:'subhan@mailinator.com',
      password:"12345678"
    }
    const data = await Auth.Login(payload);
    if (data) {
      navigate("dashboard")
    }
    console.log(data , "My data")
  }
  return (
    <div>Hello World from Client</div>
  )
};
export default HelloWorld;
