import { writeFile } from "fs/promises"
import ora from "ora"
import { bareboneScript } from "../constants/boilerplates.js"
import chalk from "chalk"
export const createFile = () => {
  const create = async ({ fileName }) => {
    const spinner = ora({
      text: "Deploying...\n",
      spinner: "bouncingBall",
    })
    spinner.start()

    const filePath = `src/server/${fileName}.tsx`
    const deployCommand = `npx webpack --env entry=/server/${fileName}.tsx --mode=production --env externals=false`

    try {
      await writeFile(filePath, bareboneScript, {
        flag: "ax",
      })

      await writeFile("./deploy.sh", `\n${deployCommand}`, {
        flag: "a+",
      })
      spinner.succeed("Done")
    } catch (error) {
      spinner.warn(chalk.red(error.message))
    }
  }
  return { create }
}
