#! /usr/bin/env node
import { program } from "commander"
import { createFile } from "./utils/createFile.js"
import { deployFiles } from "./utils/deployFiles.js"
import { getFilesList } from "./utils/getFilesList.js"
program.version("1.0.0").description("vtecx deploy helper")

program
  .command("list")
  .alias("l")
  .option("--date", "show modified dates")
  .action((args) => {
    const showDate = args.date ?? false
    const { getFileInfoTable } = getFilesList()
    getFileInfoTable({ showDate })
  })
  .description("List of user written server scripts")

program
  .command("deploy")
  .alias("d")
  .action(() => {
    const { deploy } = deployFiles()
    deploy()
  })
  .description("Deploy unsynced scripts")

program
  .command("create")
  .alias("c")
  .option("-f, --file-name <type>", "Script file name")
  .description("Type File Name without extension")
  .action((args) => {
    const fileName = args.fileName
    const { create } = createFile()
    create({ fileName })
  })

program.parse(process.argv)
