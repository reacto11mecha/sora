import { router, publicProcedure, protectedProcedure } from "../trpc";

import {
  PengaturanPerilakuValidationSchema,
  ServerPengaturanWaktuValidationSchema,
} from "../../../schema/admin.settings.schema";

import { settings } from "../../../utils/settings";

export const settingsRouter = router({
  getSettings: publicProcedure.query(() => settings.getSettings()),

  changeVotingBehaviour: protectedProcedure
    .input(PengaturanPerilakuValidationSchema)
    .mutation(async ({ input }) => {
      settings.updateSettings.canVote(input.canVote);
      settings.updateSettings.reloadAfterVote(input.reloadAfterVote);

      return { message: "Pengaturan perilaku pemilihan berhasil diperbarui!" };
    }),

  changeVotingTime: protectedProcedure
    .input(ServerPengaturanWaktuValidationSchema)
    .mutation(async ({ input }) => {
      settings.updateSettings.startTime(input.startTime);
      settings.updateSettings.endTime(input.endTime);

      return { message: "Pengaturan waktu pemilihan berhasil diperbarui!" };
    }),
});
