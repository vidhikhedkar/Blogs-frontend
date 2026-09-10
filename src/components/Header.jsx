import React, { useEffect, useState } from "react";
import logodark from '../assets/logo_dark.png'
import logo from '../assets/logo.png'

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
                        href="#home"
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
                        <a
                            href="#home"
                            onClick={closeMenu}
                        >
                            Home
                        </a>

                        <a
                            href="#about"
                            onClick={closeMenu}
                        >
                            About Us
                        </a>

                        <a
                            href="#team"
                            onClick={closeMenu}
                        >
                            Our Team
                        </a>

                        <a
                            href="#services"
                            onClick={closeMenu}
                        >
                            Services
                        </a>

                        {/* <a
                            href="http://localhost:5173/blogs"
                            onClick={closeMenu}
                        >
                            Blogs
                        </a> */}

                        <a href="/blogs" onClick={closeMenu}>
                            Blogs
                        </a>

                        <a
                            href="#projects"
                            onClick={closeMenu}
                        >
                            Presence
                        </a>

                        <a
                            href="#contact"
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