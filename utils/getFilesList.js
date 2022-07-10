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

  const getFileInfoTable = async ({ showDate }) => {
    const data = getFilesStatus()
    const table = new Table({
      head: [
        "#",
        "File Name",
        "Synced",
        ...(showDate ? ["Date Modified", "Date Uploaded"] : []),
      ],
      colWidths: [5, 42, 8, ...(showDate ? [27, 27] : [])],
    })

    forEach(data, (fileInfo) => {
      const tableRow = [
        fileInfo.serial,
        fileInfo.fileName,
        fileInfo.synced ? chalk.greenBright("✔") : chalk.redBright("✖"),
        ...(showDate ? [fileInfo.modified, fileInfo.uploaded] : []),
      ]

      table.push(tableRow)
    })
    console.log(table.toString())
  }

  return { getFilesStatus, getFileInfoTable }
}
