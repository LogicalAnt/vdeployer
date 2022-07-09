#! /usr/bin/env node
import { program } from "commander"
//import Table from "cli-table"
import { getFilesList } from "./utils/getFilesList.js"
program.version("1.0.0").description("vtecx deploy helper")

program
  .command("list")
  .alias("l")
  .option("--date", "show modified dates")
  .action((args) => {
    const showDate = args.date
    const { usersScript } = getFilesList()
    usersScript({ showDate })
  })
  .description("List of user written server scripts")

program.parse(process.argv)
