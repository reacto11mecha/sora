import amqp from "amqplib";
import { z } from "zod";

import { Prisma, prisma, type Participant } from "@sora/db";
import { validateId } from "@sora/id-generator";

import { canVoteNow } from "./canVoteNow";
import { env } from "./env";
import { logger } from "./logger";
import { trpc } from "./trpc";

const inputValidator = z.object({
  id: z.number().positive(),
  qrId: z.string().refine(validateId),
});

const consumeMessagesFromQueue = async () => {
  try {
    logger.info("[DB] Connecting to Database...");

    await prisma.$connect();

    logger.info("[DB] Connected!");

    if (!env.AMQP_URL) throw new Error("Diperlukan AQMP URL!");

    logger.info(`[MQ] MQ AMQP: ${env.AMQP_URL}`);
    logger.info(`[TRPC] TRPC URL: ${env.TRPC_URL}`);

    logger.info("[MQ] Connecting to RabbitMQ instance");

    const connection = await amqp.connect(env.AMQP_URL);
    const channel = await connection.createChannel();

    const exchange = "vote";
    const queue = "vote_queue";
    const routingKey = "vote_rpc";

    await channel.assertExchange(exchange, "direct", { durable: true });
    await channel.assertQueue(queue, { durable: true });
    await channel.bindQueue(queue, exchange, routingKey);

    logger.info("[MQ] Connected! Waiting for queue...");

    channel.consume(queue, async (msg) => {
      if (!msg) {
        logger.warn("Consumer has been cancelled or channel has been closed.");
        return;
      }

      try {
        const settings = await trpc.settings.getSettings.query();
        const inVotingCondition = canVoteNow(settings);

        const inputData = await inputValidator.safeParseAsync(
          JSON.parse(msg.content.toString()),
        );

        if (!inputData.success) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(
              JSON.stringify({
                success: false,
                message:
                  "Data yang dijadikam permintaan tidak sesuai dengan standar yang ditetapkan!",
              }),
            ),
            { correlationId: msg.properties.correlationId },
          );

          channel.ack(msg);
          logger.trace(`[MQ] Isn't a valid request data`);

          return;
        }

        logger.info(`[MQ] New message! QR ID: ${inputData.data.qrId}`);

        if (!inVotingCondition) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(
              JSON.stringify({
                success: false,
                message:
                  "Tidak bisa memilih kandidat jika bukan dalam kondisi pemilihan!",
              }),
            ),
            { correlationId: msg.properties.correlationId },
          );

          channel.ack(msg);
          logger.trace(
            `[MQ] Isn't a valid time yet for voting. QR ID: ${inputData.data.qrId}`,
          );

          return;
        }

        await prisma.$transaction(
          async (tx) => {
            const _participant = await tx.$queryRaw<
              Participant[]
            >`SELECT * FROM Participant WHERE qrId = ${inputData.data.qrId} FOR UPDATE`;
            const participant = _participant[0];

            if (!participant) {
              channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify({ error: "Gak ada" })),
                { correlationId: msg.properties.correlationId },
              );

              channel.ack(msg);
              logger.trace(
                `[MQ] Participant isn't exist. QR ID: ${inputData.data.qrId}`,
              );

              return;
            }

            if (participant.alreadyChoosing) {
              channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify({ error: "Kamu sudah memilih!" })),
                { correlationId: msg.properties.correlationId },
              );

              channel.ack(msg);
              logger.trace(
                `[MQ] Participant already chosen someone. QR ID: ${inputData.data.qrId}`,
              );

              return;
            }

            if (!participant.alreadyAttended) {
              channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(JSON.stringify({ error: "Kamu belum absen!" })),
                { correlationId: msg.properties.correlationId },
              );

              channel.ack(msg);
              logger.trace(
                `[MQ] Participant isn't attended yet. QR ID: ${inputData.data.qrId}`,
              );

              return;
            }

            const _candidate = await tx.$queryRaw<
              Participant[]
            >`SELECT * FROM Candidate WHERE id = ${inputData.data.id} FOR UPDATE`;
            const candidate = _candidate[0];

            if (!candidate) {
              channel.sendToQueue(
                msg.properties.replyTo,
                Buffer.from(
                  JSON.stringify({ error: "Kandidat yang dipilih tidak ada!" }),
                ),
                { correlationId: msg.properties.correlationId },
              );

              channel.ack(msg);
              logger.trace(
                `[MQ] Candidate isn't exist. QR ID: ${inputData.data.qrId}`,
              );

              return;
            }

            await tx.candidate.update({
              where: { id: inputData.data.id },
              data: {
                counter: {
                  increment: 1,
                },
              },
            });

            await tx.participant.update({
              where: { qrId: inputData.data.qrId },
              data: {
                alreadyChoosing: true,
                choosingAt: new Date(),
              },
            });

            logger.info(`[MQ] Upvote! QR ID: ${inputData.data.qrId}`);

            channel.sendToQueue(
              msg.properties.replyTo,
              Buffer.from(JSON.stringify({ success: true })),
              { correlationId: msg.properties.correlationId },
            );

            channel.ack(msg);

            return;
          },
          {
            maxWait: 5000,
            timeout: 10000,
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );
      } catch (error) {
        logger.error(error);

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify({ error: "Internal Server Error" })),
          { correlationId: msg.properties.correlationId },
        );

        channel.ack(msg);
      }
    });
  } catch (error) {
    logger.error(error);
  }
};
consumeMessagesFromQueue();
