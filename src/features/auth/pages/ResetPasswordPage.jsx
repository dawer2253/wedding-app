import Input from "@/components/Input";
import Button from "@/components/Button";
import { Link } from "react-router-dom";

import { useAppDispatch } from "@/app/hooks";
import { resetPassword } from "../api";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ResetPasswordPage() {
   //TODO: Recovery po kliknięciu w maila

   const dispatch = useAppDispatch();
   const navigate = useNavigate();

   async function onEmailSubmit({ email }) {
      try {
         await dispatch(resetPassword(email)).unwrap();
         toast.success(
            "Jeżeli email istnieje wysłano na niego link do zresetowania hasła",
         );
         navigate("/login");
      } catch (err) {
         toast.error(err);
      }
   }

   const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
   } = useForm();

   return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white">
         <Link
            className="text-sm text-rose-600 hover:text-rose-800"
            to="/login"
         >
            &#8592; Wróć do strony logowania
         </Link>
         <div className="flex justify-center my-6">
            <h1>Zresetuj hasło</h1>
         </div>
         <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4">
            <Input
               label="E-mail"
               type="email"
               {...register("email", { required: "E-mail wymagany" })}
               error={errors.email?.message}
            />
            <div className="flex justify-end ">
               <Button disabled={isSubmitting} variant="primary">
                  Zresetuj hasło
               </Button>
            </div>
         </form>
      </div>
   );
}
