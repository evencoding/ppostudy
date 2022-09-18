import { NextApiRequest, NextApiResponse } from "next";
import client from "@libs/server/client";
import withHandler, { ResponseType } from "@libs/server/withHandler";
import bcrypt from "bcrypt";
import { withApiSession } from "@libs/server/withSession";

async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseType>
) {
  const { email, password } = req.body;
  const saltRounds = 10;
  const existUser = await client.user.findUnique({
    where: {
      email,
    },
    select: { id: true },
  });
  if (existUser) {
    return res.status(403).json({
      ok: false,
      error: "The email alreay exist.",
    });
  }
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  await client.user.create({
    data: {
      email,
      password: hashedPassword,
      name: "Anonymous",
    },
  });
  return res.json({
    ok: true,
  });
}

export default withApiSession(
  withHandler({
    methods: ["POST"],
    handler,
    isPrivate: false,
  })
);
