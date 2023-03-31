import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

import { nanoid } from "id-generator";

import {
  ParticipantByCategoryValidationSchema,
  PaginatedParticipantValidationSchema,
  TambahPesertaManyValidationSchema,
  ParticipantAttendValidationSchema,
  TambahPesertaValidationSchema,
  DeletePesertaValidationSchema,
} from "~/schema/admin.participant.schema";
import { TRPCError } from "@trpc/server";
import { prisma } from "~/server/db";

import { canAttendNow } from "~/utils/canDoSomething";

export const participantRouter = createTRPCRouter({
  getParticipantPaginated: protectedProcedure
    .input(PaginatedParticipantValidationSchema)
    .query(
      async ({ input: { pageSize: limit, pageIndex: offset } }) =>
        await prisma.participant.findMany({
          skip: offset,
          take: limit,
        })
    ),

  createNewParticipant: protectedProcedure
    .input(TambahPesertaValidationSchema)
    .mutation(async ({ input }) => {
      await prisma.participant.create({
        data: {
          name: input.nama,
          qrId: nanoid(),
        },
      });

      return { message: "Berhasil menambahkan peserta baru!" };
    }),

  insertManyParticipant: protectedProcedure
    .input(TambahPesertaManyValidationSchema)
    .mutation(async ({ input }) => {
      const okToInsert = input.map(({ Nama }) => ({
        name: Nama,
        qrId: nanoid(),
      }));

      const checkThing = await Promise.all(
        okToInsert.map(({ name }) =>
          prisma.participant.findUnique({ where: { name } })
        )
      );

      if (checkThing.every((data) => data !== null)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Semua data yang ingin di upload sudah terdaftar!",
        });
      }

      if (checkThing.some((data) => data !== null)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Beberapa data yang ingin di upload sudah ada!",
        });
      }

      await prisma.participant.createMany({
        data: okToInsert,
      });

      return { message: "Berhasil mengupload data file csv!" };
    }),

  deleteParticipant: protectedProcedure
    .input(DeletePesertaValidationSchema)
    .mutation(async ({ input }) => {
      const participant = await prisma.participant.findUnique({
        where: { id: input.id },
      });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta pemilihan tidak dapat ditemukan!",
        });

      if (participant.alreadyAttended)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Peserta pemilihan sebelumnya sudah absen!",
        });

      if (participant.alreadyChoosing)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Peserta pemilihan sebelumnya sudah memilih!",
        });

      await prisma.participant.delete({ where: { id: input.id } });

      return { message: "Berhasil menghapus peserta!" };
    }),

  categories: protectedProcedure.query(async () => {
    const participants = await prisma.participant.findMany();

    if (!participants)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Data peserta pemilihan masih kosong!",
      });

    const categories = [
      ...new Set(participants.map(({ name }) => name.split("|")[0])),
    ].map((text) => text?.trim());

    return { categories };
  }),

  getParticipantByCategory: protectedProcedure
    .input(ParticipantByCategoryValidationSchema)
    .query(async ({ input }) => {
      if (input.category === "") return { participants: [] };

      const participants = await prisma.participant.findMany({
        where: {
          name: input.category,
        },
      });

      return { participants };
    }),

  participantAttend: publicProcedure
    .input(ParticipantAttendValidationSchema)
    .mutation(async ({ input }) => {
      const participantCanAttend = await canAttendNow();

      if (!participantCanAttend)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Belum diperbolehkan untuk melakukan absensi!",
        });

      const participant = await prisma.participant.findUnique({
        where: { qrId: input },
      });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta pemilihan tidak dapat ditemukan!",
        });

      if (participant.alreadyAttended)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kamu sudah absen!",
        });

      await prisma.participant.update({
        where: { qrId: input },
        data: {
          alreadyAttended: true,
          attendedAt: new Date(),
        },
      });

      return { message: "Berhasil melakukan absensi!" };
    }),

  isParticipantAlreadyAttended: publicProcedure
    .input(ParticipantAttendValidationSchema)
    .mutation(async ({ input }) => {
      const participant = await prisma.participant.findUnique({
        where: { qrId: input },
      });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta pemilihan tidak dapat ditemukan!",
        });

      if (participant.alreadyChoosing)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kamu sudah memilih kandidat!",
        });

      if (!participant.alreadyAttended)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Kamu belum absen!",
        });

      return { success: true };
    }),

  exportJsonData: protectedProcedure.query(async () => {
    const participants = await prisma.participant.findMany();

    if (!participants)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Tidak ada data peserta pemilihan!",
      });

    const remapped = participants.map((participant) => ({
      name: participant.name,
      qrId: participant.qrId,
    }));

    return { data: JSON.stringify(remapped, null, 2) };
  }),

  getParticipantStatus: publicProcedure
    .input(ParticipantAttendValidationSchema)
    .query(async ({ input }) => {
      const participant = await prisma.participant.findUnique({
        where: { qrId: input },
      });

      if (!participant)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Peserta pemilihan tidak dapat ditemukan!",
        });

      return {
        alreadyAttended: participant.alreadyAttended,
        alreadyChoosing: participant.alreadyChoosing,
      };
    }),
});
