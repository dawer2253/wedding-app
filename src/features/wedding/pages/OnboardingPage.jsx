import Input from "@/components/Input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { createWedding, joinWeddingByCode } from "../api";

export default function OnboardingPage() {
   const isLoading = useAppSelector((state) => state.wedding.loading);
   const activeWedding = useAppSelector((state) => state.wedding.activeWedding);
   const dispatch = useAppDispatch();
   const navigate = useNavigate();
   const {
      register: registerCreate,
      handleSubmit: handleSubmitCreate,
      formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
   } = useForm();

   const {
      register: registerJoin,
      handleSubmit: handleSubmitJoin,
      formState: { errors: errorsJoin, isSubmitting: isSubmittingJoin },
   } = useForm();

   async function onCreateSubmit(data) {
      try {
         await dispatch(
            createWedding({
               name: data.name,
               weddingDate: data.weddingDate || null,
            }),
         ).unwrap();
         toast.success("Wesele utworzone");
         navigate("/guests");
      } catch (err) {
         toast.error(err);
      }
   }

   async function onJoinSubmit({ code }) {
      try {
         await dispatch(joinWeddingByCode(code)).unwrap();
         toast.success("Dołączono do wesela");
         navigate("/guests");
      } catch (err) {
         toast.error(err);
      }
   }

   if (isLoading)
      return (
         <div className="flex min-h-screen items-center justify-center">
            <Spinner className="size-10 text-primary" />
         </div>
      );

   if (activeWedding) {
      return <Navigate to="/guests" />;
   }

   return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
         <div className="grid w-full max-w-3xl gap-6 md:grid-cols-2">
            <Card>
               <CardHeader>
                  <CardTitle className="text-xl">Stwórz wesele</CardTitle>
                  <CardDescription>
                     Załóż wesele i zaproś partnera
                  </CardDescription>
               </CardHeader>
               <CardContent>
                  <form
                     onSubmit={handleSubmitCreate(onCreateSubmit)}
                     className="space-y-4"
                  >
                     <Input
                        {...registerCreate("name", {
                           required: "Nazwa wymagana",
                        })}
                        label="Nazwa wesela"
                        type="text"
                        error={errorsCreate.name?.message}
                     />
                     <Input
                        {...registerCreate("weddingDate")}
                        label="Data (opcjonalnie)"
                        type="date"
                        error={errorsCreate.weddingDate?.message}
                     />
                     <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmittingCreate}
                     >
                        {isSubmittingCreate && <Spinner />}
                        Załóż wesele
                     </Button>
                  </form>
               </CardContent>
            </Card>
            <Card>
               <CardHeader>
                  <CardTitle className="text-xl">Dołącz kodem</CardTitle>
                  <CardDescription>
                     Dołącz do istniejącego wesela
                  </CardDescription>
               </CardHeader>
               <CardContent className="h-full">
                  <form
                     onSubmit={handleSubmitJoin(onJoinSubmit)}
                     className="flex h-full flex-col gap-4"
                  >
                     <Input
                        {...registerJoin("code", {
                           required: "Kod wymagany",
                           pattern: {
                              value: /^[A-Za-z0-9]{6}$/,
                              message: "Kod ma 6 znaków (litery i cyfry)",
                           },
                           setValueAs: (value) => value?.trim().toUpperCase(),
                        })}
                        label="Kod wesela"
                        type="text"
                        maxLength={6}
                        className="uppercase"
                        error={errorsJoin.code?.message}
                     />
                     <Button
                        type="submit"
                        className="mt-auto w-full"
                        disabled={isSubmittingJoin}
                     >
                        {isSubmittingJoin && <Spinner />}
                        Dołącz
                     </Button>
                  </form>
               </CardContent>
            </Card>
         </div>
      </div>
   );
}
