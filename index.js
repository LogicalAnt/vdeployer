#! /usr/bin/env node
import { program } from "commander"
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

program.parse(process.argv)
