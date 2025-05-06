import {NavLink} from '@remix-run/react';
import registryLogo from '../assets/images/registryLogo.png';
import searchImg from '../assets/images/search.png';
import userImg from '../assets/images/shape.png';
import TopHeader from './TopHeader';
import { Navbar } from '@material-tailwind/react';
import NavBarLinks from './NavBarLinks';

export function Header() {
return (
<div>
  <TopHeader />

  <header className="flex justify-between px-[74px] pt-11 bg-white ">

    {/* User Icon */}
    <div className='flex items-start w-[25%]'>
       {/* Search Icon */}
       <button className="text-xl hover:text-blue-500">
        <span role="img" aria-label="Search Icon">
        <img src={searchImg} alt="Search Icon" className="" />
        </span>
      </button>
      
      <NavLink to="/login" className="text-xl hover:text-blue-500 pl-[44px]">
        <span role="img" aria-label="User Icon">
          <img src={userImg} alt="User Icon" className="" />
        </span>
      </NavLink>
      <button className="text-xl hover:text-blue-500"></button>
    </div>


    {/* Logo */}
    <div className="font-bold text-xl">
      <NavLink to="/" className="text-black">
        <img src={registryLogo} alt="Registry Logo" className="" />
      </NavLink>
    </div>



    {/* Icons and CTA */}
    <div className='flex items-start'>

    <div className="flex items-center gap-4">
      {/* link Button */}
      <NavLink to="#" className="px-4 py-2 text-[17px] text-[#1F1D1B] font-[800] uppercase tracking-[2px]">
        FIND A COUPLE
      </NavLink>
      {/* CTA Button */}
      <NavLink to="/register" className="py-5 px-2 text-[17px] bg-[#446184] text-white hover:opacity-90 uppercase font-[800] text-white w-[225px] text-center">
      CREATE A REGISTRY
      </NavLink>
    </div>
    </div>
  </header>

  <div className="mt-8">
    <NavBarLinks />
  </div>
</div>

);
}