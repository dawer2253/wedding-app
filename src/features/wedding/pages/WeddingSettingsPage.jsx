import { useAppSelector } from "@/app/hooks";
import { formatDate } from "@/lib/date";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
   Card,
   CardContent,
   CardDescription,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";

import { useState } from "react";

export default function WeddingSettingsPage() {
   const [copied, setCopied] = useState(false);

   const wedding = useAppSelector((state) => state.wedding.activeWedding);

   function handleCopy() {
      navigator.clipboard.writeText(wedding.inviteCode);
      setCopied(true);
      toast.success("Skopiowano kod do schowka");

      setTimeout(() => setCopied(false), 2000);
   }

   return (
      <div className="space-y-6">
         <PageHeader title="Ustawienia wesela" />
         <Card className="max-w-md">
            <CardHeader>
               <CardTitle>{wedding.name}</CardTitle>
               <CardDescription>
                  {wedding.weddingDate
                     ? `Data wesela: ${formatDate(wedding.weddingDate)}`
                     : "Nie ustawiono daty wesela"}
               </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
               <p className="text-sm text-muted-foreground">
                  Kod dołączenia — udostępnij go partnerowi:
               </p>
               <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-muted px-4 py-1.5 text-center font-mono text-2xl tracking-widest">
                     {wedding.inviteCode}
                  </code>
                  <Button
                     variant="outline"
                     onClick={handleCopy}
                     disabled={copied}
                  >
                     {copied ? <Check /> : <Copy />}
                     {copied ? "Skopiowano!" : "Kopiuj"}
                  </Button>
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
