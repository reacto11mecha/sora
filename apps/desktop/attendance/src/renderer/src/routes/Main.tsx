import CantAttend from "@renderer/components/PreScan/CantAttend";
import ErrorOcurred from "@renderer/components/PreScan/ErrorOccured";
import Scanner from "@renderer/components/Scanner";
import { useSetting } from "@renderer/context/SettingContext";

import { Loading } from "@sora/ui/Loading";

const Main: React.FC = () => {
  const { isLoading, isError, canAttend } = useSetting();

  if (isError) return <ErrorOcurred />;

  if (isLoading && !isError)
    return <Loading headingText="Mengambil data terbaru..." />;

  if (!isLoading && !canAttend && !isError) return <CantAttend />;

  return <Scanner />;
};

export default Main;
