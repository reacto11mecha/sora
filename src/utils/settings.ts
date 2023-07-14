import { EventEmitter } from "events";

interface AppSettings {
  startTime: Date | null;
  endTime: Date | null;
  canVote: boolean | null;
  reloadAfterVote: boolean | null;
}

interface ReturnedValues {
  startTime: Date | null;
  endTime: Date | null;
  canVote: boolean;
  reloadAfterVote: boolean;
}

type UpdateEventMap = {
  update: ReturnedValues;
};

type ExtractValues<T> = T extends unknown ? T[keyof T] : never;

class SettingsManager extends EventEmitter {
  private settingsMap: Map<keyof AppSettings, ExtractValues<AppSettings>>;

  constructor() {
    super();
    this.settingsMap = new Map<keyof AppSettings, ExtractValues<AppSettings>>();
  }

  getSettings(): ReturnedValues {
    type DateOrUndef = Date | undefined;
    type BoolOrUndef = boolean | undefined;

    const startTime = this.settingsMap.get("startTime") as DateOrUndef;
    const endTime = this.settingsMap.get("endTime") as DateOrUndef;

    const canVote = this.settingsMap.get("canVote") as BoolOrUndef;
    const reloadAfterVote = this.settingsMap.get(
      "reloadAfterVote"
    ) as BoolOrUndef;

    return {
      startTime: startTime ?? null,
      endTime: endTime ?? null,
      canVote: canVote ?? false,
      reloadAfterVote: reloadAfterVote ?? false,
    };
  }

  private updateBuilder(
    key: keyof AppSettings,
    value: ExtractValues<AppSettings>
  ): void {
    this.settingsMap.set(key, value);
    this.emit("update", this.getSettings());
  }

  updateSettings = {
    startTime: (time: Date) => this.updateBuilder("startTime", time),
    endTime: (time: Date) => this.updateBuilder("endTime", time),
    canVote: (votable: boolean) => this.updateBuilder("canVote", votable),
    reloadAfterVote: (attendable: boolean) =>
      this.updateBuilder("reloadAfterVote", attendable),
  } as const;

  on<K extends keyof UpdateEventMap>(
    event: K,
    listener: (payload: UpdateEventMap[K]) => void
  ): this {
    return super.on(event, listener);
  }
}

export const settings = new SettingsManager();
