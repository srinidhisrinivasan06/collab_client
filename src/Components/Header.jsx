import React from 'react'
import { Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const Header = () => {
  return (
    <div>
        <header className="font-mono flex rounded-b-2xl justify-around bg-blue-200 text-black p-5">
            <div>
                 <h1>
                    SyncSpace
                 </h1>
            </div>
            <div className="flex items-center gap-10">
              <ul className="flex list-none gap-10 m-0 p-0">
                  <li className="transition duration-5s ease-in-out rounded-2xl hover:text-2xl hover:text-blue-700">
                    <Link to="/">Home</Link>
                  </li>
                  <li className="transition duration-5s ease-in-out hover:text-2xl hover:text-blue-700">
                    <Link to="/login">Login</Link>
                  </li>
                  <li className="transition duration-5s ease-in-out hover:text-2xl hover:text-blue-700">
                    <Link to="/signup">Signup</Link>
                  </li>
                  <li className="transition duration-5s ease-in-out hover:text-2xl hover:text-blue-700">
                    <Link to="/dashboard">Dashboard</Link>
                  </li>
              </ul>
              <ThemeToggle />
            </div>
        </header>
    </div>
  )
}

export default Header