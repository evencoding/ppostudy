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
  const user = await client.user.findUnique({
    where: { email },
  });
  if (!user) {
    return res.status(403).json({
      ok: false,
      error: "User not exist.",
    });
  }
  const correctPassword = await bcrypt.compare(password, user?.password);
  if (!correctPassword) {
    return res.status(403).json({
      ok: false,
      error: "Wrong Password.",
    });
  }
  req.session.user = {
    id: user?.id,
  };
  await req.session.save();
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
