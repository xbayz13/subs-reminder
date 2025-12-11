import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggleButton } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Home, Calendar, List, LogOut, Menu, X, User } from "lucide-react";
import { logout } from "@/lib/api";

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

/**
 * Navigation Bar Component
 */
export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
    // Clear any local state and redirect
    window.location.href = "/";
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            <span className="hidden sm:inline">Subs Reminder</span>
            <span className="sm:hidden">Subs</span>
          </span>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <Button
            variant={currentPage === "dashboard" ? "default" : "ghost"}
            onClick={() => onNavigate("dashboard")}
            size="sm"
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>
          <Button
            variant={currentPage === "subscriptions" ? "default" : "ghost"}
            onClick={() => onNavigate("subscriptions")}
            size="sm"
            className="gap-2"
          >
            <List className="h-4 w-4" />
            <span>Subscriptions</span>
          </Button>
          <Button
            variant={currentPage === "profile" ? "default" : "ghost"}
            onClick={() => onNavigate("profile")}
            size="sm"
            className="gap-2"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-2" />
          
          <ThemeToggleButton />
          
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm leading-none">{user.name}</span>
                <span className="text-xs text-muted-foreground leading-none mt-1">
                  {user.email}
                </span>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            size="sm"
            className="gap-2 text-muted-foreground hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggleButton />
          {user && (
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background animate-in slide-in-from-top duration-200">
          <div className="container mx-auto px-4 py-3 space-y-1">
            <Button
              variant={currentPage === "dashboard" ? "default" : "ghost"}
              onClick={() => {
                onNavigate("dashboard");
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start gap-2"
              size="sm"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
            <Button
              variant={currentPage === "subscriptions" ? "default" : "ghost"}
              onClick={() => {
                onNavigate("subscriptions");
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start gap-2"
              size="sm"
            >
              <List className="h-4 w-4" />
              Subscriptions
            </Button>
            <Button
              variant={currentPage === "profile" ? "default" : "ghost"}
              onClick={() => {
                onNavigate("profile");
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start gap-2"
              size="sm"
            >
              <User className="h-4 w-4" />
              Profile
            </Button>
            <Separator className="my-2" />
            {user && (
              <div className="px-3 py-2 space-y-1">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            )}
            <Button
              variant="ghost"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
              size="sm"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

