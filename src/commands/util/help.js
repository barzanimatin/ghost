const { getGuildById } = require("../../utils/functions");
const { ownerId } = require("../../../config.json");
const BaseEmbed = require("../../modules/BaseEmbed");
const categories = require("../../data/categories.json");

module.exports = {
  name: "help",
  description: "Shows all commands Or shows more info about a command",
  category: "util",
  cooldown: 2,
  usage: "h <category name | command name>",
  aliases: ["h"],
  async execute(bot, message, args) {
    const guild = await getGuildById(message.guild.id);
    const prefix = guild.prefix;
    const cmdArgs = args[0];

    if (categories.includes(cmdArgs)) {
      const cmds = bot.commands
        .filter((com) => com.category === cmdArgs)
        .map((cmd) => cmd.name)
        .join(", ");

      if (cmds.length < 0) {
        return message.channel.send("That category does not exist");
      }

      const embed = BaseEmbed(message)
        .setTitle(`Commands: ${cmdArgs}`)
        .setDescription(`\`\`\`${cmds}\`\`\``);

      return message.channel.send({ embed });
    } else if (cmdArgs) {
      const cmd =
        bot.commands.get(cmdArgs) || bot.commands.get(bot.aliases.get(cmdArgs));
      if (!cmd) return message.channel.send("Command or alias not found");

      const aliases = cmd.aliases ? cmd.aliases.map((alias) => alias) : "None";
      const options = cmd.options
        ? cmd.options.map((option) => option)
        : "None";
      const cooldown = cmd.cooldown ? `${cmd.cooldown}s` : "None";

      const embed = BaseEmbed(message)
        .setTitle(`Command: ${cmd.name}`)
        .addField("Aliases", aliases, true)
        .addField("Cooldown", `${cooldown}`, true)
        .addField(
          "Usage",
          cmd.usage ? `${prefix}${cmd.usage}` : "Not specified",
          true
        )
        .addField("Category", cmd.category, true)
        .addField(
          "Description",
          cmd.description ? cmd.description : "Not specified"
        )
        .addField("Options", options);

      return message.channel.send(embed);
    }

    let nsfw = message.channel.nsfw;
    const commands = bot.commands;

    const utilsCmds = commands
      .filter(({ category }) => category === "util")
      .map(({ name }) => name)
      .join(", ");
    const adminCmds = commands
      .filter(({ category }) => category === "admin")
      .map(({ name }) => name)
      .join(", ");
    const animalCmds = commands
      .filter(({ category }) => category === "animal")
      .map(({ name }) => name)
      .join(", ");
    const botOwnerCmds = commands
      .filter(({ category }) => category === "botowner")
      .map(({ name }) => name)
      .join(", ");
    const gameCmds = commands
      .filter(({ category }) => category === "games")
      .map(({ name }) => name)
      .join(", ");
    const musicCmds = commands
      .filter(({ category }) => category === "music")
      .map(({ name }) => name)
      .join(", ");
    const nsfwCmds = commands
      .filter(({ category }) => category === "nsfw")
      .map(({ name }) => name)
      .join(", ");
    const economyCmds = commands
      .filter(({ category }) => category === "economy")
      .map(({ name }) => name)
      .join(", ");
    const levelCmds = commands
      .filter(({ category }) => category === "levels")
      .map(({ name }) => name)
      .join(", ");
    const imageCmds = commands
      .filter(({ category }) => category === "image")
      .map(({ name }) => name)
      .join(", ");
    const hentaiCmds = commands
      .filter(({ category }) => category === "hentainsfw")
      .map(({ name }) => name)
      .join(", ");
    const exemptCmds = commands
      .filter(({ category }) => category === "exempt")
      .map(({ name }) => name)
      .join(", ");

    const embed = BaseEmbed(message)
      .addField("Admin Commands", `\`\`\`${adminCmds}\`\`\``)
      .addField("Animal Commands", `\`\`\`${animalCmds}\`\`\``);
    if (ownerId === message.author.id) {
      embed.addField("BotOwner Commands", `\`\`\`${botOwnerCmds}\`\`\``);
    }
    if (ownerId !== message.author.id) {
      embed.addField(
        "BotOwner Commands",
        "only the owner is allowed to see this!"
      );
    }
    if (nsfw) {
      embed.addField("NSFW Commands", `\`\`\`${nsfwCmds}\`\`\``);
      embed.addField("Hentai Commands", `\`\`\`${hentaiCmds}\`\`\``);
    } else {
      embed.addField(
        "NSFW Commands",
        "To view nfsw commands check in an nfsw channel!"
      );
    }
    embed
      .addField("Game Commands", `\`\`\`${gameCmds}\`\`\``)
      .addField("Image Commands", `\`\`\`${imageCmds}\`\`\``)
      .addField("Music Commands", `\`\`\`${musicCmds}\`\`\``)
      .addField("Util Commands", `\`\`\`${utilsCmds}\`\`\``)
      .addField("Economy Commands", `\`\`\`${economyCmds}\`\`\``)
      .addField("Levels Commands", `\`\`\`${levelCmds}\`\`\``)
      .addField(
        "Exempt Commands (commands that cannot be disabled) ",
        `\`\`\`${exemptCmds}\`\`\``
      )
      .addField("Server prefix: ", prefix)
      .setDescription(
        `use \`${prefix}help <command name | alias>\` to view more info about a command\n More info can be found using the \`botinfo\` command`
      )
      .setTitle("Help");

    message.channel.send(embed);
  },
};
