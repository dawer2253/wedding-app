import { useEffect } from "react";
import { Outlet, Navigate, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toast } from "sonner";
import { signOut } from "@/features/auth/api";
import { fetchGuests } from "@/features/guests/api";
import { formatDate } from "@/lib/date";
import { Users, Banknote, CirclePile, Settings, LogOut } from "lucide-react";

export default function RootLayout() {
   const activeWedding = useAppSelector((state) => state.wedding.activeWedding);
   const isLoading = useAppSelector((state) => state.wedding.loading);
   const weddingId = activeWedding?.id;

   const dispatch = useAppDispatch();

   useEffect(() => {
      if (weddingId) {
         dispatch(fetchGuests(weddingId));
      }
   }, [dispatch, weddingId]);

   if (isLoading)
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

   return (
      <div className="flex min-h-screen">
         <aside className="flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
            <div className="flex flex-col gap-1 border-b border-sidebar-border p-6">
               <p className="text-lg font-semibold">{activeWedding.name}</p>
               {activeWedding.weddingDate && (
                  <p className="text-sm text-muted-foreground">
                     {formatDate(activeWedding.weddingDate)}
                  </p>
               )}
            </div>
            <nav className="flex-1 space-y-1 p-4">
               <NavLink to="/guests" className={navLinkClass}>
                  <Users size={18} />
                  <span>Goście</span>
               </NavLink>
               <NavLink to="/budget" className={navLinkClass}>
                  <Banknote size={18} />
                  <span>Budżet</span>
               </NavLink>
               <NavLink to="/vendors" className={navLinkClass}>
                  <CirclePile size={18} />
                  <span>Dostawcy</span>
               </NavLink>
               <NavLink to="/settings" className={navLinkClass}>
                  <Settings size={18} />
                  <span>Ustawienia</span>
               </NavLink>
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
         <main className="flex-1 p-6">
            <Outlet />
         </main>
      </div>
   );
}
