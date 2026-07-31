import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { supabase } from "./lib/supabase";

import { useAppDispatch, useAppSelector } from "./app/hooks";
import { Spinner } from "@/components/ui/spinner";
import { initializeAuth } from "./features/auth/api";
import { setSession } from "./features/auth/authSlice";
import { fetchUserWedding } from "./features/wedding/api";

function App() {
   const isLoading = useAppSelector((state) => state.auth.loading);
   const user = useAppSelector((state) => state.auth.user);

   const dispatch = useAppDispatch();

   useEffect(() => {
      dispatch(initializeAuth());
      const {
         data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
         dispatch(setSession(session));
      });

      return () => subscription.unsubscribe();
   }, [dispatch]);

   useEffect(() => {
      if (user) {
         dispatch(fetchUserWedding());
      }
   }, [dispatch, user]);

   if (isLoading)
      return (
         <div className="flex min-h-screen items-center justify-center">
            <Spinner className="size-10 text-primary" />
         </div>
      );

   return <RouterProvider router={router} />;
}

export default App;
