import React, { useState, useEffect } from 'react';
import { bus } from '../lib/bus';
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import NextLink from "next/link";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { MoonFilledIcon, SunFilledIcon } from './icons';
import { LoginButton } from "./LoginButton";

const navItems: { label: string; app: string }[] = [
  { label: 'Service 1', app: 'service1' },
  { label: 'Service 2', app: 'service2' },
];

type HeaderProps = {
  currentApp: string;
  setApp: (app: string) => void;
};

const Header: React.FC<HeaderProps> = ({ currentApp, setApp }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || (stored === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const toggleMenu = () => setMenuOpen((v) => !v);

  const handleNav = (app: string) => {
    setApp(app);
    bus.dispatchEvent(new CustomEvent('appSwitch', { detail: app }));
    setMenuOpen(false);
  };

  return (
    <HeroUINavbar className="px-4 py-2 border-b bg-white dark:bg-gray-900">
      <NavbarContent className="flex items-center justify-between w-full">
        <NavbarBrand>
          <NextLink href="/" passHref legacyBehavior>
            <Link className="flex items-center gap-2 font-bold text-lg">
              <span className="w-6 h-6 bg-blue-500 rounded-full inline-block" /> SAM HeroUI
            </Link>
          </NextLink>
        </NavbarBrand>
        <div className="hidden sm:flex flex-1 justify-center gap-4">
          {navItems.map((item) => (
            <NavbarItem key={item.app}>
              <Button
                variant={currentApp === item.app ? "solid" : "light"}
                className={`text-base px-2 py-1 rounded ${currentApp === item.app ? 'font-bold underline' : ''}`}
                onClick={() => handleNav(item.app)}
              >
                {item.label}
              </Button>
            </NavbarItem>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            aria-label="Toggle theme"
            onClick={toggleTheme}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            variant="light"
          >
            {theme === 'dark' ? (
              <SunFilledIcon className="w-5 h-5 text-yellow-400" />
            ) : (
              <MoonFilledIcon className="w-5 h-5 text-gray-800" />
            )}
          </Button>
          <div className="sm:hidden">
            <NavbarMenuToggle onClick={toggleMenu} aria-label="Toggle menu" />
          </div>
          <LoginButton />
        </div>
      </NavbarContent>
      <NavbarMenu className="sm:hidden flex flex-col gap-2 mt-2">
        {navItems.map((item) => (
          <NavbarMenuItem key={item.app}>
            <Button
              variant={currentApp === item.app ? "solid" : "light"}
              className={`block px-4 py-2 text-base text-left rounded w-full ${currentApp === item.app ? 'font-bold underline' : ''}`}
              onClick={() => handleNav(item.app)}
            >
              {item.label}
            </Button>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </HeroUINavbar>
  );
};

export default Header;
