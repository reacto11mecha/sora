import { createContext, useContext, useMemo, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { trpc, type RouterOutput } from "@renderer/utils/trpc";
import { DateTime } from "luxon";

import { useParticipant } from "./ParticipantContext";

interface ISettingContext {
  canVoteNow: boolean;
  isLoading: boolean;
  isError: boolean;
  isCandidatesExist: boolean;
  candidates: RouterOutput["candidate"]["candidateList"] | undefined;
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

  const { qrId, setQRCode } = useParticipant();

  const [canVoteNow, setCanVote] = useState<boolean>(false);

  const candidateQuery = trpc.candidate.candidateList.useQuery(undefined, {
    refetchOnWindowFocus: false,

    onError(error) {
      toast({
        description: `Error: ${error.message}`,
        status: "error",
        duration: 5000,
        position: "top-right",
      });
    },
  });

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

      const canVote =
        (waktuMulai as number) <= currentTime &&
        (waktuSelesai as number) >= currentTime &&
        result.canVote;

      setCanVote(canVote);

      if (!canVote && qrId) setQRCode(null);

      if (candidateQuery.isError) candidateQuery.refetch();
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

  const isCandidatesExist = useMemo(
    () => (candidateQuery.data && candidateQuery.data.length > 1) || false,
    [candidateQuery.data],
  );

  const isLoading = useMemo(
    () => candidateQuery.isLoading || settingsQuery.isLoading,
    [candidateQuery.isLoading, settingsQuery.isLoading],
  );

  const isError = useMemo(
    () => candidateQuery.isError || settingsQuery.isError,
    [candidateQuery.isError, settingsQuery.isError],
  );

  return (
    <SettingContext.Provider
      value={{
        canVoteNow,
        isLoading,
        isError,
        isCandidatesExist,
        candidates: candidateQuery.data,
      }}
    >
      {children}
    </SettingContext.Provider>
  );
};

export const useSetting = () => useContext(SettingContext) as ISettingContext;
