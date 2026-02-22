import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Trophy,
  Terminal,
  User,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store";

/* ─── Navigation Items ─── */
interface NavItem {
  label: string;
  to: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", to: "/", icon: <LayoutDashboard size={18} /> },
  { label: "Questions", to: "/questions", icon: <FileText size={18} /> },
  { label: "Contests", to: "/contests", icon: <Trophy size={18} /> },
  { label: "Sandbox", to: "/sandbox", icon: <Terminal size={18} /> },
];

/* ─── Theme hook ─── */
function useTheme() {
  const [light, setLight] = useState(() =>
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("light")
      : false,
  );

  const toggle = useCallback(() => {
    setLight((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("light", next);
      localStorage.setItem("theme", next ? "light" : "dark");
      return next;
    });
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light") {
      document.documentElement.classList.add("light");
      setLight(true);
    }
  }, []);

  return { light, toggle };
}

/* ─── Top Navigation Bar ─── */
function TopNav() {
  const { light, toggle } = useTheme();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ─── Scroll Occlusion Mask ─── */}
      <div 
        className={cn(
          "fixed top-0 left-0 right-0 z-20 bg-bg transition-all duration-300",
          isScrolled ? "h-[72px] border-b border-border shadow-sm" : "h-0 opacity-0"
        )} 
      />

      <header
        className={cn(
          "fixed z-30 flex items-center justify-between rounded-xl border border-border shadow-[0_1px_3px_var(--shadow)] backdrop-blur-md transition-all duration-300",
          isScrolled
            ? "top-3 left-3 right-3 h-12 bg-bg-secondary px-5"
            : "top-4 left-6 right-6 h-14 bg-bg-secondary/95 px-6"
        )}
      >
        {/* Left — Logo */}
      <span
        className={cn(
          "font-semibold tracking-tight text-text transition-all duration-300",
          isScrolled ? "text-sm" : "text-base"
        )}
      >
        ByteCode
      </span>

      {/* Center — Navigation Links */}
      <nav className="flex items-center gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-2 rounded-lg text-sm font-medium transition-all duration-200",
                isScrolled ? "px-2.5 py-1.5" : "px-3 py-2",
                isActive
                  ? "text-accent"
                  : "text-text-muted hover:bg-accent-subtle hover:text-text",
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="shrink-0">{item.icon}</span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full bg-accent" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Right — Theme toggle + User + Logout */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggle}
          className={cn(
            "flex items-center justify-center rounded-lg text-text-muted transition-all duration-200 hover:bg-accent-subtle hover:text-text",
            isScrolled ? "h-8 w-8" : "h-9 w-9"
          )}
          aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
        >
          {light ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button
          onClick={() => navigate("/profile")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 text-text-muted transition-all duration-200 hover:bg-accent-subtle hover:text-text",
            isScrolled ? "h-8" : "h-9"
          )}
          aria-label="Profile"
        >
          <User size={18} />
          {user && <span className="text-sm font-medium text-text">{user.username}</span>}
        </button>

        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center justify-center rounded-lg text-text-muted transition-all duration-200 hover:bg-red-500/10 hover:text-red-400",
            isScrolled ? "h-8 w-8" : "h-9 w-9"
          )}
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  </>
  );
}

/* ─── Main Layout ─── */
export function MainLayout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <TopNav />

      <main
        style={{
          paddingTop: "96px",   /* 16px top inset + 56px navbar + 24px gap */
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingBottom: "24px",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
