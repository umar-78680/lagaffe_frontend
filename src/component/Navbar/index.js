import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import "./style.css";

function Navbar() {
 const [active, setActive] = useState("");

  return (
    <div className='navbar-container'>
      <nav className="navbar">
          <ul>
            <NavLink to="/"><li>Dashboard</li></NavLink>
            <NavLink to="/products"><li>Products</li></NavLink>
            <NavLink to="/orders"><li>Orders</li></NavLink>
            <NavLink to="/abnormal-loss"><li>Abnormal Loss</li></NavLink>
            <NavLink to="/expenses"><li>Expenses</li></NavLink>
          </ul>
        </nav>
    </div>
  )
}

export default Navbar
