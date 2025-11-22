import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export const useMarketDataInitializer = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkAndInitialize = async () => {
      // Check if data already exists
      const { count } = await supabase
        .from("market_prices")
        .select("*", { count: "exact", head: true });

      if (count && count > 0) {
        setIsInitialized(true);
        return;
      }

      // Data doesn't exist, initialize
      setIsInitializing(true);
      
      try {
        const { data, error } = await supabase.functions.invoke("initialize-market-data");

        if (error) throw error;

        setIsInitialized(true);
        toast({
          title: "تم تحميل بيانات السوق",
          description: data.message || "تم تحميل البيانات بنجاح",
        });
      } catch (error) {
        console.error("Failed to initialize market data:", error);
        toast({
          title: "خطأ في تحميل البيانات",
          description: "فشل تحميل بيانات السوق الأولية",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };

    checkAndInitialize();
  }, [toast]);

  return { isInitializing, isInitialized };
};
