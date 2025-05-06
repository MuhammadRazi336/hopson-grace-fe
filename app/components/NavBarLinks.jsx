import { NavLink } from "@remix-run/react";

const NavBarLinks = () => {
return (
<div className="navbar">
    {/* Navigation Menu */}
    <nav className="flex-1">
        <ul className="flex justify-center gap-8 py-5">
            <li>
                <NavLink to="/how-it-works" className="text-black hover:text-blue-500 font-[800] text-[18px] uppercase tracking-[1px]">
                    How it Works
                </NavLink>
            </li>
            <li>
                <NavLink to="/products" className="text-black hover:text-blue-500 font-[800] text-[18px] uppercase tracking-[1px]">
                    Products
                </NavLink>
            </li>
            <li>
                <NavLink to="/wedding-stories" className="text-black hover:text-blue-500 font-[800] text-[18px] uppercase tracking-[1px]">
                    Wedding Stories
                </NavLink>
            </li>
            <li>
                <NavLink to="/link4" className="text-black hover:text-blue-500 font-[800] text-[18px] uppercase tracking-[1px]">
                    Link 4
                </NavLink>
            </li>
        </ul>
    </nav>
</div>
);
}

export default NavBarLinks;