const { PrismaClient } = require("../generated/prisma");
const { State } = require("../generated/prisma");

const prisma = new PrismaClient();

module.exports = { prisma, State };
