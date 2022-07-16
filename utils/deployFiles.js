import forEach from "lodash/forEach.js"
import head from "lodash/head.js"
import get from "lodash/get.js"
import { getFilesList } from "./getFilesList.js"
import ora from "ora"
import differenceInSeconds from "date-fns/differenceInSeconds/index.js"
import { exec } from "node:child_process"
import { unlink } from "node:fs/promises"
import find from "lodash/find.js"
import chalk from "chalk"

export const deployFiles = () => {
  const deploy = async () => {
    const spinner = ora({
      text: "Deploying...\n",
      spinner: "bouncingBall",
    })
    spinner.start()
    const { getCompiledTimes, getScriptCommitTimes } = getFilesList()

    const compiledTimes = await getCompiledTimes()
    const commitTimes = await getScriptCommitTimes()
    const deployed = []
    forEach(commitTimes, (info) => {
      const scriptFileName = get(info, "file", "")
      const compiledFileName = head(scriptFileName.split(".")) + ".js"
      const compiledAt = get(
        find(compiledTimes, { file: compiledFileName }),
        "time",
        null
      )
      const committedAt = get(info, "time", null)

      const syncedStatus =
        differenceInSeconds(new Date(compiledAt), new Date(committedAt)) >= 0
          ? true
          : false
      if (!syncedStatus) {
        unlink(`src/dist/${compiledFileName}`).catch(() => null)

        const deployedPromise = new Promise((resolve, reject) => {
          exec(
            `npx webpack --env entry=/server/${scriptFileName} --mode=production --env externals=false`,
            (error, stdout, stderr) => {
              if (stdout) {
                console.log(chalk.green(stdout))
                resolve(stdout)
              } else if (error) reject(error)
              else if (stderr) reject(stderr)
            }
          )
        })
        deployed.push(deployedPromise)
      }
    })

    Promise.all(deployed).then(() => {
      spinner.succeed("Done\n")
    })
  }
  return { deploy }
}
