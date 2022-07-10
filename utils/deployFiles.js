import fs from "fs"
import forEach from "lodash/forEach.js"
import head from "lodash/head.js"
import get from "lodash/get.js"
import { getFilesList } from "./getFilesList.js"
import childProcess from "child_process"

export const deployFiles = () => {
  const deploy = () => {
    //get unsynced files list
    const { getFilesStatus } = getFilesList()
    const data = getFilesStatus()
    const compiledScriptFolder = "dist/server/"

    forEach(data, (fileInfo) => {
      if (!fileInfo.synced) {
        const compiledFileName =
          head(get(fileInfo, "fileName", "").split(".")) + ".js"
        const compiledFilePath = `${compiledScriptFolder}${compiledFileName}`
        const usersScriptFile = get(fileInfo, "fileName", "")
        fs.unlinkSync(compiledFilePath)
        childProcess
          .execSync(
            `npx webpack --env entry=/server/${usersScriptFile} --mode=production --env externals=false`
          )
          .toString()
          .trim()
      }
    })
  }
  return { deploy }
}
