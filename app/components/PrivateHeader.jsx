import { NavLink } from "@remix-run/react";

export function PrivateHeader() {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
      {/* Logo */}
      <div className="font-bold text-xl">
        <NavLink to="/" className="text-black">
          THE REGISTRY LOGO
        </NavLink>
      </div>

      {/* Icons and Search Bar */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search"
            className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black">
            🔍
          </button>
        </div>

        {/* Icons */}
        <NavLink to="/profile" className="text-xl hover:text-blue-500">
          <span role="img" aria-label="Profile Icon">👤</span>
        </NavLink>
        <NavLink to="/notifications" className="text-xl hover:text-blue-500">
          <span role="img" aria-label="Notifications Icon">🔔</span>
        </NavLink>
        <NavLink to="/help" className="text-xl hover:text-blue-500">
          <span role="img" aria-label="Help Icon">❓</span>
        </NavLink>
      </div>
    </header>
  );
}
