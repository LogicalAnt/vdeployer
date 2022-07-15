#! /usr/bin/env node
import fs from "fs"
import chalk from "chalk"
import Table from "cli-table"
import format from "date-fns/format/index.js"
import get from "lodash/get.js"
import head from "lodash/head.js"
import differenceInSeconds from "date-fns/differenceInSeconds/index.js"
import childProcess from "child_process"
import forEach from "lodash/forEach.js"
import { readdir, stat } from "node:fs/promises"
import { exec } from "node:child_process"
import ora from "ora"
import find from "lodash/find.js"

export const getFilesList = () => {
  const getFilesStatus = () => {
    const usersScriptFolder = "src/server/"
    const compiledScriptFolder = "dist/server/"
    const dateFormat = "yyyy-MM-dd HH:mm:ss a"
    const uploadedScript = {}
    const statusList = []

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
      const syncedStatus = syncedDiff >= 0 ? true : false

      statusList.push({
        serial: index,
        fileName: file,
        synced: syncedStatus,
        modified: formatModifiedDate,
        uploaded: formatUploadedDate,
      })
    })
    return statusList
  }

  const getScriptCommitTimes = async () => {
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
          }
        )
      })
      dates.push(datePromise)
    })

    return Promise.all(dates)
  }

  const getCompiledTimes = async () => {
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
    }).start()

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

  return { getFilesStatus, getFileInfoTable }
}
