import { useEffect } from "react";
import { Outlet, Navigate, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toast } from "sonner";
import { signOut } from "@/features/auth/api";
import { fetchGuests } from "@/features/guests/api";
import { fetchExpenses } from "@/features/budget/api";
import { formatDate } from "@/lib/date";
import { Users, Banknote, CirclePile, Settings, LogOut } from "lucide-react";

const NAV_ITEMS = [
   { to: "/guests", label: "Goście", icon: Users },
   { to: "/budget", label: "Budżet", icon: Banknote },
   { to: "/vendors", label: "Dostawcy", icon: CirclePile },
   { to: "/settings", label: "Ustawienia", icon: Settings },
];

export default function RootLayout() {
   const activeWedding = useAppSelector((state) => state.wedding.activeWedding);
   const isLoading = useAppSelector((state) => state.wedding.loading);
   const weddingId = activeWedding?.id;

   const dispatch = useAppDispatch();

   useEffect(() => {
      if (weddingId) {
         dispatch(fetchGuests(weddingId));
         dispatch(fetchExpenses(weddingId));
      }
   }, [dispatch, weddingId]);

   if (isLoading && !activeWedding)
      return (
         <div className="flex min-h-screen items-center justify-center">
            <Spinner className="size-10 text-primary" />
         </div>
      );

   if (!activeWedding) {
      return <Navigate to="/onboarding" />;
   }

   async function handleLogout() {
      try {
         await dispatch(signOut()).unwrap();
         toast.success("Wylogowano");
      } catch (err) {
         toast.error(err);
      }
   }

   const navLinkClass = ({ isActive }) =>
      `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
         isActive
            ? "bg-primary/10 font-medium text-primary"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      }`;

   const bottomNavLinkClass = ({ isActive }) =>
      `flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors ${
         isActive ? "font-medium text-primary" : "text-muted-foreground"
      }`;

   return (
      <div className="flex min-h-screen">
         <aside className="hidden w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
            <div className="flex flex-col gap-1 border-b border-sidebar-border p-6">
               <p className="text-lg font-semibold">{activeWedding.name}</p>
               {activeWedding.weddingDate && (
                  <p className="text-sm text-muted-foreground">
                     {formatDate(activeWedding.weddingDate)}
                  </p>
               )}
            </div>
            <nav className="flex-1 space-y-1 p-4">
               {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} className={navLinkClass}>
                     <Icon size={18} />
                     <span>{label}</span>
                  </NavLink>
               ))}
            </nav>
            <div className="border-t border-sidebar-border p-4">
               <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
               >
                  <LogOut />
                  Wyloguj
               </Button>
            </div>
         </aside>

         <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-background/95 px-4 py-2.5 backdrop-blur md:hidden">
               <div className="min-w-0">
                  <p className="truncate font-semibold">{activeWedding.name}</p>
                  {activeWedding.weddingDate && (
                     <p className="truncate text-xs text-muted-foreground">
                        {formatDate(activeWedding.weddingDate)}
                     </p>
                  )}
               </div>
               <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Wyloguj"
                  onClick={handleLogout}
               >
                  <LogOut />
               </Button>
            </header>

            <main className="flex-1 p-4 pb-24 md:p-6">
               <Outlet />
            </main>
         </div>

         <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
               <NavLink key={to} to={to} className={bottomNavLinkClass}>
                  <Icon size={20} />
                  <span>{label}</span>
               </NavLink>
            ))}
         </nav>
      </div>
   );
}
