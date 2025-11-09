import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  LayoutDashboard,
  Users,
  Clock,
  DollarSign,
  ShoppingCart,
  Settings,
  FileText,
  TrendingUp,
  LogOut,
  Menu,
  X,
  User,
  Package,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: ["ADMIN", "CREATOR", "INVESTOR"],
  },
  {
    title: "Performa",
    icon: TrendingUp,
    roles: ["CREATOR", "ADMIN"],
    children: [
      {
        title: "Sesi Live",
        href: "/sesi-live",
        icon: Clock,
        roles: ["CREATOR", "ADMIN"],
      },
      {
        title: "Sales",
        href: "/sales",
        icon: ShoppingCart,
        roles: ["ADMIN", "CREATOR"],
      },
      {
        title: "Konten",
        href: "/konten",
        icon: FileText,
        roles: ["CREATOR", "ADMIN"],
      },
    ],
  },
  {
    title: "Manajemen",
    icon: Users,
    roles: ["ADMIN"],
    children: [
      {
        title: "Payroll",
        href: "/payroll",
        icon: DollarSign,
        roles: ["ADMIN"],
      },
      {
        title: "Kreator",
        href: "/kreator",
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        title: "Inventaris",
        href: "/inventaris",
        icon: Package,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "Bisnis",
    icon: DollarSign,
    roles: ["ADMIN", "INVESTOR"],
    children: [
      {
        title: "Keuangan",
        href: "/keuangan",
        icon: TrendingUp,
        roles: ["ADMIN", "INVESTOR"],
      },
      {
        title: "Konfigurasi",
        href: "/konfigurasi",
        icon: Settings,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "Profil",
    href: "/profil",
    icon: User,
    roles: ["ADMIN", "CREATOR", "INVESTOR"],
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { signOut, userRole, userName, user } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredNavItems = navItems.filter((item) => {
    if (!userRole) return false;
    if (!item.roles.includes(userRole)) return false;
    
    // Filter children based on role
    if (item.children) {
      item.children = item.children.filter((child) =>
        userRole ? child.roles.includes(userRole) : false
      );
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold hidden sm:inline-block">Agensi Afiliasi</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="font-medium">{userName} ({userRole})</span>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container flex px-4 py-6">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex w-64 flex-col gap-2 pr-6">
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              
              // Item without children (direct link)
              if (!item.children) {
                const isActive = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href!}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive && "bg-secondary font-medium"
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.title}
                    </Button>
                  </Link>
                );
              }

              // Item with children (collapsible parent)
              const hasActiveChild = item.children.some(
                (child) => child.href === location.pathname
              );

              return (
                <Collapsible key={item.title} defaultOpen={hasActiveChild}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between hover:bg-accent"
                    >
                      <span className="flex items-center">
                        <Icon className="h-4 w-4 mr-2" />
                        {item.title}
                      </span>
                      <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-6 pt-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isActive = location.pathname === child.href;
                      
                      return (
                        <Link key={child.href} to={child.href!}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            size="sm"
                            className={cn(
                              "w-full justify-start",
                              isActive && "bg-secondary font-medium"
                            )}
                          >
                            <ChildIcon className="h-4 w-4 mr-2" />
                            {child.title}
                          </Button>
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <nav className="fixed top-16 left-0 bottom-0 w-64 bg-card border-r p-4 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                
                // Item without children
                if (!item.children) {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      to={item.href!}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start",
                          isActive && "bg-secondary font-medium"
                        )}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.title}
                      </Button>
                    </Link>
                  );
                }

                // Item with children
                const hasActiveChild = item.children.some(
                  (child) => child.href === location.pathname
                );

                return (
                  <Collapsible key={item.title} defaultOpen={hasActiveChild}>
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between hover:bg-accent"
                      >
                        <span className="flex items-center">
                          <Icon className="h-4 w-4 mr-2" />
                          {item.title}
                        </span>
                        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 pl-6 pt-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isActive = location.pathname === child.href;
                        
                        return (
                          <Link
                            key={child.href}
                            to={child.href!}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button
                              variant={isActive ? "secondary" : "ghost"}
                              size="sm"
                              className={cn(
                                "w-full justify-start",
                                isActive && "bg-secondary font-medium"
                              )}
                            >
                              <ChildIcon className="h-4 w-4 mr-2" />
                              {child.title}
                            </Button>
                          </Link>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
