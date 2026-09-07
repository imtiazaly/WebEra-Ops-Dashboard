import React from "react";
import { NavLink, Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container-fluid px-4">
        <Link className="navbar-brand fw-bold fs-4" to="/">
          WebEra <span>Ops</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? "active" : ""}`
                }
                to="/"
              >
                <i className="bi bi-speedometer2 me-1"></i> Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? "active" : ""}`
                }
                to="/leads"
              >
                <i className="bi bi-people me-1"></i> Leads
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? "active" : ""}`
                }
                to="/projects"
              >
                <i className="bi bi-kanban me-1"></i> Projects
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? "active" : ""}`
                }
                to="/invoices"
              >
                <i className="bi bi-receipt me-1"></i> Invoices
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                className={({ isActive }) =>
                  `nav-link px-3 ${isActive ? "active" : ""}`
                }
                to="/settings"
              >
                <i className="bi bi-gear me-1"></i> Settings
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
