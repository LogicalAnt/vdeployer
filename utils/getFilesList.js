#! /usr/bin/env node
import fs from "fs"
import chalk from "chalk"
import Table from "cli-table"
import format from "date-fns/format/index.js"
import get from "lodash/get.js"
import head from "lodash/head.js"
import differenceInSeconds from "date-fns/differenceInSeconds/index.js"
import childProcess from "child_process"
export const getFilesList = () => {
  const usersScript = ({ showDate }) => {
    const usersScriptFolder = "src/server/"
    const compiledScriptFolder = "dist/server/"
    const dateFormat = "yyyy-MM-dd HH:mm:ss a"
    const uploadedScript = {}

    const table = new Table({
      head: [
        "#",
        "File Name",
        "Synced",
        ...(showDate ? ["Date Modified", "Date Uploaded"] : []),
      ],
      colWidths: [5, 42, 8, ...(showDate ? [27, 27] : [])],
    })

    try {
      fs.readdirSync(compiledScriptFolder).forEach((file) => {
        const uploadTime = fs.statSync(compiledScriptFolder + file).mtime
        const fileName = file
        uploadedScript[fileName] = uploadTime
      })

      fs.readdirSync(usersScriptFolder).forEach((file, index) => {
        const fileName = head(file.split(".")) + ".js"

        const dateModified = childProcess
          .execSync(`git log -1 --format=%cd ${usersScriptFolder + file}`)
          .toString()
          .trim()
        const formatModifiedDate = format(new Date(dateModified), dateFormat)

        const dateUploaded = get(uploadedScript, `${fileName}`, new Date())
        const formatUploadedDate = format(new Date(dateUploaded), dateFormat)
        const syncedDiff = differenceInSeconds(
          new Date(dateUploaded),
          new Date(dateModified)
        )
        const syncedStatus =
          syncedDiff >= 0 ? chalk.greenBright("✔") : chalk.redBright("✖")

        table.push([
          index + 1,
          file,
          syncedStatus,
          ...(showDate ? [formatModifiedDate, formatUploadedDate] : []),
        ])
      })
      console.log(table.toString())
    } catch (error) {
      console.log(chalk.red("Server side script folder not found"))
      console.log(
        chalk.blueBright("Please make sure you are on a vtecx project")
      )
      console.log(chalk.red("Error: " + error))
    }
  }
  return { usersScript }
}
