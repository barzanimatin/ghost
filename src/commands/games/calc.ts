import { Message } from "discord.js";
import { create, all } from "mathjs";
import Command from "structures/Command";
import Bot from "structures/Bot";
import { codeBlock } from "@discordjs/builders";
const math = create(all);

export default class CalcCommand extends Command {
  constructor(bot: Bot) {
    super(bot, {
      name: "calc",
      description: "Calculate something",
      category: "games",
      aliases: ["math"],
      requiredArgs: [{ name: "calculation" }],
    });
  }

  async execute(message: Message, args: string[]) {
    const lang = await this.bot.utils.getGuildLang(message.guild?.id);
    try {
      const calculation = math?.evaluate?.(args.join(" "));

      const embed = this.bot.utils
        .baseEmbed(message)
        .setTitle(lang.GAMES.CALC)
        .addField(`${lang.BOT_OWNER.EVAL_INPUT}:`, codeBlock("js", args.join(" F")))
        .addField(`${lang.BOT_OWNER.EVAL_OUTPUT}:`, codeBlock("js", calculation));

      return message.channel.send({ embeds: [embed] });
    } catch (e) {
      return message.channel.send({
        content: lang.GAMES.INVALID_CALC,
      });
    }
  }
}
