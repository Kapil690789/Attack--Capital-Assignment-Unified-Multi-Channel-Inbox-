/**
 * Database setup and seeding script
 */
import { prisma } from "@/lib/prisma"

async function main() {
  console.log("Starting database setup...")

  // Create default team
  const team = await prisma.team.upsert({
    where: { id: "default-team" },
    update: {},
    create: {
      id: "default-team",
      name: "Default Team",
    },
  })

  console.log("Team created:", team)

  // Create sample user
  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      role: "ADMIN",
    },
  })

  console.log("User created:", user)

  // Create team membership
  await prisma.teamMember.upsert({
    where: {
      teamId_userId: {
        teamId: team.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      teamId: team.id,
      userId: user.id,
      role: "ADMIN",
    },
  })

  console.log("Database setup completed successfully!")
}

main()
  .catch((error) => {
    console.error("Setup error:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
