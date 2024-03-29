import { createContext, useContext, useMemo, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { trpc } from "@renderer/utils/trpc";
import { DateTime } from "luxon";

interface ISettingContext {
  canAttend: boolean;
  isLoading: boolean;
  isError: boolean;
}

export const SettingContext = createContext<ISettingContext>(
  {} as ISettingContext,
);

export const SettingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const toast = useToast();

  const [canAttend, setCanAttend] = useState<boolean>(false);

  const settingsQuery = trpc.settings.getSettings.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,

    onSuccess(result) {
      const waktuMulai = result.startTime
        ? DateTime.fromJSDate(result.startTime).toLocal().toJSDate().getTime()
        : null;
      const waktuSelesai = result.endTime
        ? DateTime.fromJSDate(result.endTime).toLocal().toJSDate().getTime()
        : null;

      const currentTime = new Date().getTime();

      setCanAttend(
        (waktuMulai as number) <= currentTime &&
          (waktuSelesai as number) >= currentTime &&
          result.canAttend,
      );
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
    [canAttend, settingsQuery.isError, settingsQuery.isLoading],
  );

  return (
    <SettingContext.Provider value={propsValue}>
      {children}
    </SettingContext.Provider>
  );
};

export const useSetting = () => useContext(SettingContext) as ISettingContext;
