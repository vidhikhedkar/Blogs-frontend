import React, { useEffect, useState } from "react";
import logodark from "../assets/logo_dark.png";
import logo from "../assets/logo.png";

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <>
            <header
                id="navbar"
                className={`navbar ${scrolled ? "scrolled" : ""}`}
            >
                <div className="nav-inner">

                    {/* LOGO */}
                    <a
                        href="/"
                        className="logo"
                        onClick={closeMenu}
                    >
                        <img
                            src={logo}
                            alt="Venture Borehole"
                            className="logo-light"
                        />

                        <img
                            src={logodark}
                            alt="Venture Borehole"
                            className="logo-dark"
                        />
                    </a>

                    {/* NAVIGATION */}
                    <nav
                        id="navMenu"
                        className={`nav-menu ${menuOpen ? "open" : ""}`}
                    >

                        {/* HOME */}
                        <a
                            href="/"
                            onClick={closeMenu}
                        >
                            Home
                        </a>

                        {/* ABOUT */}
                        <a
                            href="/#about"
                            onClick={closeMenu}
                        >
                            About Us
                        </a>

                        {/* TEAM */}
                        <a
                            href="/#team"
                            onClick={closeMenu}
                        >
                            Our Team
                        </a>

                        {/* SERVICES */}
                        <a
                            href="/#services"
                            onClick={closeMenu}
                        >
                            Services
                        </a>

                        {/* BLOGS */}
                        <a
                            href="/blogs"
                            onClick={closeMenu}
                        >
                            Blogs
                        </a>

                        {/* PRESENCE */}
                        <a
                            href="/#projects"
                            onClick={closeMenu}
                        >
                            Presence
                        </a>

                        {/* GET A QUOTE */}
                        <a
                            href="/#contact"
                            className="nav-cta-btn"
                            onClick={closeMenu}
                        >
                            Get a Quote
                        </a>

                    </nav>

                    {/* HAMBURGER */}
                    <div
                        className={`hamburger ${menuOpen ? "active" : ""}`}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                </div>
            </header>

            {/* MOBILE OVERLAY */}
            <div
                className={`nav-shade ${menuOpen ? "active" : ""}`}
                onClick={closeMenu}
            />
        </>
    );
};

export default Header;