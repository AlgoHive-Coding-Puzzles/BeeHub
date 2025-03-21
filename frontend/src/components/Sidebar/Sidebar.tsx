import classNames from "classnames";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "primereact/button";
import { Catalog } from "../../types/Catalog";
import { useEffect, useRef, useState } from "react";
import "./Sidebar.css";

interface SidebarProps {
  selectedMenu: string;
  setCurrentCatalog: (catalog: Catalog | null) => void;
  setCurrentTheme: (theme: string | null) => void;
  currentCatalog: Catalog | null;
  currentTheme: string | null;
  setSelectedMenu: (menu: string) => void;
}

export default function Sidebar({
  selectedMenu,
  setCurrentCatalog,
  setCurrentTheme,
  currentCatalog,
  currentTheme,
  setSelectedMenu,
}: SidebarProps) {
  const { username, logout } = useAuth();
  const navRef = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);

  // Observer pour ajuster en fonction de la hauteur disponible
  useEffect(() => {
    const checkHeight = () => {
      if (navRef.current) {
        const windowHeight = window.innerHeight;
        // Si l'écran est petit, passons en mode compact
        setCompact(windowHeight < 700);
      }
    };

    checkHeight(); // Vérification initiale
    window.addEventListener("resize", checkHeight);

    return () => {
      window.removeEventListener("resize", checkHeight);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const items = [
    {
      label: "Home",
      icon: "pi pi-home",
      command: () => {
        setSelectedMenu("Home");
        setCurrentCatalog(null);
        setCurrentTheme(null);
      },
      className: classNames({ "active-menu-item": selectedMenu === "Home" }),
    },
    {
      label: "Catalog",
      icon: "pi pi-book",
      command: () => {
        setSelectedMenu("Catalog");
        setCurrentTheme(null);
      },
      className: classNames(
        { "active-menu-item": selectedMenu === "Catalog" },
        { "disabled-menu-item": !currentCatalog }
      ),
    },
    {
      label: "Theme",
      icon: "pi pi-folder",
      command: () => {
        setSelectedMenu("Theme");
      },
      className: classNames(
        {
          "active-menu-item": selectedMenu === "Theme",
        },
        { "disabled-menu-item": !currentTheme }
      ),
    },

    {
      label: "Team",
      icon: "pi pi-users",
      command: () => setSelectedMenu("Team"),
      className: classNames({ "active-menu-item": selectedMenu === "Team" }),
    },
    {
      label: "Forge",
      icon: "pi pi-wrench",
      command: () => setSelectedMenu("Forge"),
      className: classNames({ "active-menu-item": selectedMenu === "Forge" }),
    },
    {
      label: "Settings",
      icon: "pi pi-cog",
      command: () => setSelectedMenu("Settings"),
      className: classNames({
        "active-menu-item": selectedMenu === "Settings",
      }),
    },
  ];

  return (
    <nav ref={navRef} className="w-56 p-sidebar-sm flex flex-col">
      <div className="p-3 flex flex-col h-full">
        <div
          className={classNames("text-center", {
            "mb-4 mt-2": compact,
            "mb-8 mt-4": !compact,
          })}
        >
          <i className="pi pi-box text-orange-500 sb-icon"></i>
        </div>
        <div className="w-full flex-grow">
          <ul className="menu p-reset">
            {items.map((item) => (
              <li
                key={item.label}
                className={classNames(
                  "menuitem",
                  "p-component",
                  "menuitem-link",
                  "menuitem-active",
                  item.className
                )}
                onClick={item.command}
              >
                <a href="#" className="menuitem-link">
                  <span className="menuitem-icon">
                    <i className={item.icon + " sb-icon"}></i>
                  </span>
                  <span className="menuitem-text">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="user-menu mt-auto">
          <div className="text-center mb-2">
            <i className="pi pi-user text-lg"></i>
            <div className="mt-1 text-xs font-bold">{username}</div>
          </div>
          <div className="text-center">
            <Button
              icon="pi pi-sign-out"
              text
              onClick={handleLogout}
              label={compact ? "" : "Logout"}
              className="p-button-sm"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
