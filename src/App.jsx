import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/router";
import { supabase } from "./lib/supabase";

import { useAppDispatch, useAppSelector } from "./app/hooks";
import LoadingSpinner from "./components/LoadingSpinner";
import { initializeAuth } from "./features/auth/api";
import { setSession } from "./features/auth/authSlice";

function App() {
   const isLoading = useAppSelector((state) => state.auth.loading);
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

   if (isLoading)
      return (
         <LoadingSpinner
            size={80}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
         />
      );

   return <RouterProvider router={router} />;
}

export default App;
