import {Link, Outlet, useLocation} from "react-router-dom";
import {Home, MoonStar, Settings, SunMoon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils.ts";
import {useTheme} from "@/provider/theme.tsx";

export default function Layout() {
    const { setTheme } = useTheme()
    const changeTheme = () => {
        setTheme(localStorage.getItem("vite-ui-theme") === "dark" ? "light" : "dark")
    }
    const location = useLocation().pathname;
    const activeRoute = (path: string, more: string[] = []) => {
        if (location === path)
            return cn(['bg-accent', 'hover:bg-accent', 'text-foreground', ...more]);
        return cn(['bg-accent', 'hover:bg-accent', 'text-muted-foreground', ...more]);
    }

    const shadowTop = () => {
        return localStorage.getItem("vite-ui-theme") === "light" ?
        `shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.2)]` :
        `shadow-[0_-10px_25px_-5px_rgba(255,255,255,0.2)]`
    }

    return (
        <div className="flex flex-col min-w-screen min-h-screen bg-background text-foreground text-lg overflow-hidden">
            <div className="m-4 max-w-screen flex items-center mb-20">
                <div className="container">
                    <Outlet/>
                </div>
            </div>

            <div className={`fixed bottom-0 w-full bg-accent h-18 p-2 rounded-t-xl ${shadowTop()}`}>
                <div className="flex justify-evenly items-center">
                    <Link to="/">
                        <Button className={activeRoute('/', [])}>
                            <Home/>
                        </Button>
                    </Link>
                    <Link to="/settings">
                        <Button className={activeRoute('/settings', [])}>
                            <Settings/>
                        </Button>
                    </Link>
                    <Button variant="ghost" className="rounded-full" onClick={changeTheme}>
                        <SunMoon className="h-[2rem] w-[2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 duration-300"/>
                        <MoonStar className="absolute h-[2rem] w-[2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 duration-300"/>
                    </Button>
                </div>
            </div>
        </div>
    );
}
