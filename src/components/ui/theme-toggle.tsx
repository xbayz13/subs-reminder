import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/components/ui/theme-provider";

/**
 * Theme Toggle Component
 * 
 * Allows users to switch between light, dark, and system theme
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <Select value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>
      <SelectTrigger className="w-[140px] h-9">
        <div className="flex items-center gap-2">
          {resolvedTheme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <SelectValue placeholder="Theme" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">
          Light
        </SelectItem>
        <SelectItem value="dark">
          Dark
        </SelectItem>
        <SelectItem value="system">
          System
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

/**
 * Simple Theme Toggle Button (Icon only)
 * 
 * Cycles through: light -> dark -> system -> light
 */
export function ThemeToggleButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="h-9 w-9"
      title={`Current: ${theme} (${resolvedTheme})`}
    >
      {resolvedTheme === "dark" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

