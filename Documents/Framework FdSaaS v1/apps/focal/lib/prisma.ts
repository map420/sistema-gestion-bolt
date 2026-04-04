import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return new PrismaClient()
  }
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient()
  }
  return global.prismaGlobal
}

export const prisma = {
  get objective() { return getPrismaClient().objective },
  get keyResult() { return getPrismaClient().keyResult },
  get note() { return getPrismaClient().note },
  get weeklyReview() { return getPrismaClient().weeklyReview },
  get profile() { return getPrismaClient().profile },
}
