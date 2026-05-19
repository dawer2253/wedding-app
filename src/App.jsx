import { useEffect } from "react";
import { supabase } from "./lib/supabase";

function App() {
   useEffect(() => {
      async function getData() {
         const data = await supabase.from("todos").select();
         console.log(data);
      }
      getData();
   }, []);
   return <div className="bg-blue-500 text-white p-4">Hello tailwind v4</div>;
}

export default App;
