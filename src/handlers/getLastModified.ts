import { Message, MessageAttachment } from "discord.js";
import { writeFileSync } from "fs";

import User from "../models/user";
import { error } from "../utils";

export default async function getLastModified(message: Message): Promise<void> {
  try {          
    if (message.author.id !== process.env.POLLEN_ADMIN) 
      throw "You do not have access to this command.";

    const weeks: number = +message.content.split(" ")[2] || 1 ;

    const modifiedUsers = await User
      .find({ modifiedAt: { $gte: Date.now() - (1000 * 60 * 60 * 24 * 7 * weeks) } })
      .select("-_id -createdAt -modifiedAt -address");

    const formattedModifiedUsers = JSON.stringify(modifiedUsers, null, 2);
    // modifiedUsers
    //   .toString()
    //   .replace(/{/g, "{\n")
    //   .replace(/}/g, "\n}")
    //   .replace(/,/g, ",\n");

    writeFileSync("lastModifiedUsers.json", formattedModifiedUsers);
  
    message.author.send(
      `Here's the list of users created or modified last ${weeks} week(s):`,
      new MessageAttachment("lastModifiedUsers.json")
    );
  } catch (err) {
    if (typeof err !== "string") error(err);
    message.reply(err)
  }
}
