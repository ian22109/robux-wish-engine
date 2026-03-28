import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Navbar = () => {
  const navItems = ["Charts", "Marketplace", "Create", "Coins"];

  return (
    <nav className="bg-nav text-nav-foreground h-12 flex items-center px-4 justify-between">
      <div className="flex items-center gap-8">
        <span className="text-lg font-extrabold tracking-wider">GAMEX</span>
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <a key={item} href="#" className="text-sm font-medium text-nav-foreground/80 hover:text-nav-foreground transition-colors">
              {item}
            </a>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="h-8 w-48 pl-8 bg-foreground/10 border-none text-nav-foreground placeholder:text-nav-foreground/50 text-sm rounded-md"
          />
        </div>
        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8">
          Sign Up
        </Button>
        <Button size="sm" variant="outline" className="border-nav-foreground/30 text-nav-foreground hover:bg-nav-foreground/10 text-xs h-8">
          Log In
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
