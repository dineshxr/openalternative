import { indexAlgoliaSearch } from "~/lib/index-search"
import { getMilestoneReached, sendMilestoneTweet } from "~/lib/milestones"
import { fetchRepositoryData } from "~/lib/repositories"
import { inngest } from "~/services/inngest"
import { prisma } from "~/services/prisma"

export const fetchToolData = inngest.createFunction(
  { id: "fetch-tool-data" },
  { cron: "TZ=Europe/Warsaw 0 0 * * *" },

  async ({ step }) => {
    const tools = await step.run("fetch-tools", async () => {
      return prisma.tool.findMany({
        where: { publishedAt: { not: null } },
      })
    })

    await step.run("fetch-repository-data", async () => {
      return Promise.all(
        tools.map(async tool => {
          const updatedTool = await fetchRepositoryData(tool)

          if (!updatedTool) {
            return null
          }

          const milestone = getMilestoneReached(tool.stars, updatedTool.stars)

          if (milestone) {
            const tweetName = tool.twitterHandle ? `@${tool.twitterHandle}` : tool.name
            await sendMilestoneTweet(milestone, tweetName, tool.slug)
          }

          return prisma.tool.update({
            where: { id: tool.id },
            data: updatedTool,
          })
        }),
      )
    })

    // Start Algolia index
    await step.run("start-algolia-index", async () => {
      return indexAlgoliaSearch()
    })

    // Disconnect from DB
    await step.run("disconnect-from-db", async () => {
      return prisma.$disconnect()
    })
  },
)