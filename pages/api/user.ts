import nextConnect from "next-connect";
import auth from "@/middleware/auth";
import { safeUserTransformator } from "@/lib/valueTransformator";

// import User from "@/lib/User";

import type { NextApiRequest, NextApiResponse } from "next";

interface requestInterface extends NextApiRequest {
  user: any;
  logOut: () => void;
}

const handler = nextConnect<
  requestInterface,
  NextApiResponse<AlertErrorResponse | UserSuccessResponse | ApiErrorInterface>
>();

handler
  .use(auth)
  .get((req, res) => {
    res.json({
      user: req.user ? safeUserTransformator(req.user?.toObject()) : null,
    });
  })
  .use((req, res, next) => {
    if (!req.user)
      res.status(401).send({
        error: true,
        message: "Anda belum terautentikasi!",
        type: "UNAUTHENTICATED",
      });
    else next();
  })
  .put(async (req, res) => {
    const { type, body } = req.body;

    if (!type || !body)
      return res
        .status(400)
        .json({ error: true, message: "Tidak ada type ataupun body!" });

    switch (type) {
      case "UPDATE_USERNAME":
        const { nama } = body;

        if (!nama)
          return res.status(400).json({
            error: true,
            message: "Diperlukan nama yang ingin diubah!",
          });

        try {
          await req.user.update({ username: nama });

          res
            .status(201)
            .json({ error: false, message: "Nama berhasil diperbarui!" });
        } catch (e: unknown) {
          res.status(500).json({
            error: true,
            message: (e as unknown as { toString(): string }).toString(),
          });
        }

        break;

      case "UPDATE_PASSWORD":
        break;
      default:
        return res
          .status(400)
          .json({ error: true, message: "Invalid request" });
    }
  })
  .delete((req, res) => {
    req.logOut();
    res.status(204).end();
  });

export default handler;
