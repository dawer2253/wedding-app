import Input from "@/components/Input";
import Button from "@/components/Button";
import { Link } from "react-router-dom";

import { useAppDispatch } from "@/app/hooks";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { login } from "../api";

export default function LoginPage() {
   const dispatch = useAppDispatch();
   const navigate = useNavigate();

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm();

   async function onSubmit(data) {
      try {
         await dispatch(login(data)).unwrap();
         toast.success("Zalogowano");
         navigate("/");
      } catch (err) {
         toast.error(err);
      }
   }

   return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white">
         <div className="flex justify-center my-6">
            <h1>Login</h1>
         </div>
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
               label="E-mail"
               type="email"
               {...register("email", { required: "E-mail wymagany" })}
               error={errors.email?.message}
            />
            <div>
               <Input
                  label="Hasło"
                  type="password"
                  {...register("password", { required: "Hasło wymagane" })}
                  error={errors.password?.message}
               />
               <div className="flex justify-end mt-1">
                  <Link
                     to="/reset-password"
                     className="text-sm text-rose-600 hover:text-rose-800"
                  >
                     Zapomniałeś hasła?
                  </Link>
               </div>
            </div>
            <div className="flex justify-end ">
               <Button disabled={isSubmitting} variant="primary">
                  Zaloguj się
               </Button>
            </div>
         </form>
         <div className="mt-8 flex justify-center font-bold">
            <p>
               Nie masz konta?{" "}
               <Link
                  to="/signup"
                  className="text-md text-rose-600 hover:text-rose-800"
               >
                  Zarejestruj się
               </Link>
            </p>
         </div>
      </div>
   );
}
