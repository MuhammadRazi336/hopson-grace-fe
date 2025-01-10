import {NavLink} from '@remix-run/react';

export function Header() {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
      {/* Logo */}
      <div className="font-bold text-xl">
        <NavLink to="/" className="text-black">
          THE REGISTRY LOGO
        </NavLink>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1">
        <ul className="flex justify-center gap-8">
          <li>
            <NavLink
              to="/how-it-works"
              className="text-black hover:text-blue-500"
            >
              How it Works
            </NavLink>
          </li>
          <li>
            <NavLink to="/products" className="text-black hover:text-blue-500">
              Products
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/wedding-stories"
              className="text-black hover:text-blue-500"
            >
              Wedding Stories
            </NavLink>
          </li>
          <li>
            <NavLink to="/link4" className="text-black hover:text-blue-500">
              Link 4
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Icons and CTA */}
      <div className="flex items-center gap-4">
        {/* User Icon */}
        <NavLink to="/login" className="text-xl hover:text-blue-500">
          <span role="img" aria-label="User Icon">
            👤
          </span>
        </NavLink>
        <button className="text-xl hover:text-blue-500"></button>

        {/* Search Icon */}
        <button className="text-xl hover:text-blue-500">
          <span role="img" aria-label="Search Icon">
            🔍
          </span>
        </button>

        {/* CTA Button */}
        <NavLink
          to="/register"
          className="px-4 py-2 border border-black rounded hover:bg-gray-100"
        >
          Start a Registry
        </NavLink>
      </div>
    </header>
  );
}
