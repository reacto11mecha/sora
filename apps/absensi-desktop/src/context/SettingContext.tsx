import { createContext, useContext, useState, useMemo } from "react";
import { useToast } from "@chakra-ui/react";

import { trpc } from "@/utils/trpc";

interface ISettingContext {
  canAttend: boolean;
  isLoading: boolean;
  isError: boolean;
}

export const SettingContext = createContext<ISettingContext>(
  {} as ISettingContext
);

export const SettingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const toast = useToast();

  const [canAttend, setCanAttend] = useState<boolean>(false);

  const settingsQuery = trpc.settings.getSettings.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,

    onSuccess(result) {
      setCanAttend(result.canAttend);
    },

    onError(error) {
      toast({
        description: `Error: ${error.message}`,
        status: "error",
        duration: 5000,
        position: "top-right",
      });
    },
  });

  const propsValue = useMemo(
    () => ({
      canAttend,
      isError: settingsQuery.isError,
      isLoading: settingsQuery.isLoading,
    }),
    [canAttend, settingsQuery.isError, settingsQuery.isLoading]
  );

  return (
    <SettingContext.Provider value={propsValue}>
      {children}
    </SettingContext.Provider>
  );
};

export const useSetting = () => useContext(SettingContext) as ISettingContext;