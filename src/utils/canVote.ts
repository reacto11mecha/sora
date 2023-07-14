import { DateTime } from "luxon";
import { settings as settingsLib } from "./settings";

const getTimePermission = () => {
  const settings = settingsLib.getSettings();

  const currentTime = DateTime.now().toUTC().toJSDate().getTime();

  const timeConfig = {
    mulai: settings?.startTime
      ? DateTime.fromJSDate(settings.startTime, {
          zone: "utc",
        })
          .toJSDate()
          .getTime()
      : false,
    selesai: settings?.endTime
      ? DateTime.fromJSDate(settings.endTime, {
          zone: "utc",
        })
          .toJSDate()
          .getTime()
      : false,
  };

  return {
    isPermittedByTime:
      // Start
      (timeConfig.mulai
        ? (timeConfig.mulai as number) <= currentTime
        : false) &&
      // End
      (timeConfig.selesai
        ? (timeConfig.selesai as number) >= currentTime
        : false),
    settings,
  };
};

export const canVoteNow = () => {
  const { isPermittedByTime, settings } = getTimePermission();

  return isPermittedByTime && settings.canVote;
};
