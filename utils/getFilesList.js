#! /usr/bin/env node
import chalk from "chalk"
import Table from "cli-table"
import format from "date-fns/format/index.js"
import get from "lodash/get.js"
import head from "lodash/head.js"
import differenceInSeconds from "date-fns/differenceInSeconds/index.js"
import forEach from "lodash/forEach.js"
import { readdir, stat } from "node:fs/promises"
import { exec } from "node:child_process"
import ora from "ora"
import find from "lodash/find.js"

export const getFilesList = () => {
  const getScriptCommitTimes = async () => {
    try {
      const dates = []
      const files = await readdir("src/server/")
      files.forEach((file) => {
        const datePromise = new Promise((resolve, reject) => {
          exec(
            `git log -1 --format=%cd src/server/${file}`,
            (error, stdout, stderr) => {
              if (stdout) resolve({ file: file, time: stdout })
              else if (error) reject(error)
              else if (stderr) reject(stderr)
              else {
                stat(`src/server/${file}`).then((res) => {
                  resolve({ file, time: res.mtime })
                })
              }
            }
          )
        })
        dates.push(datePromise)
      })

      return Promise.all(dates)
    } catch (error) {
      console.log(chalk.red(error))
    }
  }

  const getCompiledTimes = async () => {
    try {
      const dates = []
      const files = await readdir("dist/server/")

      files.forEach(async (file) => {
        const info = stat(`dist/server/${file}`).then((res) => {
          return { file, time: res.mtime }
        })
        const datePromise = new Promise((resolve) => {
          resolve(info)
        })
        dates.push(datePromise)
      })
      return Promise.all(dates)
    } catch (error) {
      console.log(chalk.red(error))
    }
  }

  const getFileInfoTable = async ({ showDate }) => {
    const dateFormat = "dd-MM-yyyy HH:mm:ss a"
    const table = new Table({
      head: [
        "#",
        "File Name",
        "Synced",
        ...(showDate ? ["Date Modified", "Date Uploaded"] : []),
      ],
      colWidths: [5, 42, 8, ...(showDate ? [27, 27] : [])],
    })

    const spinner = ora({
      text: "Loading...\n",
      spinner: "bouncingBall",
    })
    spinner.start()

    const compiledTimes = await getCompiledTimes()
    const commitTimes = await getScriptCommitTimes()

    forEach(commitTimes, (info, index) => {
      const compiledFileName = head(get(info, "file", "").split(".")) + ".js"
      const compiledAt = get(
        find(compiledTimes, { file: compiledFileName }),
        "time",
        null
      )
      const committedAt = get(info, "time", null)

      const formattedCompiledDate = compiledAt
        ? format(new Date(compiledAt), dateFormat)
        : "-"
      const formattedCommitDate = committedAt
        ? format(new Date(committedAt), dateFormat)
        : "-"

      const syncedStatus =
        differenceInSeconds(new Date(compiledAt), new Date(committedAt)) >= 0
          ? true
          : false

      const tableRow = [
        index + 1,
        info.file,
        syncedStatus ? chalk.greenBright("✔") : chalk.redBright("✖"),
        ...(showDate ? [formattedCommitDate, formattedCompiledDate] : []),
      ]
      table.push(tableRow)
    })
    console.log(table.toString() + "\n")
    spinner.stop()
  }

  return {
    getFileInfoTable,
    getCompiledTimes,
    getScriptCommitTimes,
  }
}
