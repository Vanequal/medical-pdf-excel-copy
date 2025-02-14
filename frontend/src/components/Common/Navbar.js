import React from "react";
import { Link } from "react-router-dom";
import { User } from 'lucide-react';
import { Grid2x2 } from 'lucide-react';
import { SquareChartGantt } from 'lucide-react';
import "../../styles/navbar.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">Medical App</Link>
            </div>
            <ul className="navbar-links">
            <li>
                    <Link to="/manual" className="navbar-icon">
                        <SquareChartGantt size={28}/>
                        <span className="navbar-tooltip">Manual</span>
                    </Link>
                </li>
                <li>
                    <Link to="/dashboard" className="navbar-icon">
                    <Grid2x2 size={28}/>
                        <span className="navbar-tooltip">Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link to="/login" className="navbar-icon">
                        <User size={28}/>
                        <span className="navbar-tooltip">Login</span>
                    </Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
