import { GuildChannel } from "discord.js";
import Bot from "../../structures/Bot";
import Event from "../../structures/Event";

export default class ChannelCreateEvent extends Event {
  constructor(bot: Bot) {
    super(bot, "channelCreate");
  }

  async execute(bot: Bot, channel: GuildChannel) {
    if (!channel.guild?.available) return;
    if (!channel.guild.me?.hasPermission("MANAGE_WEBHOOKS")) return;

    const webhook = await bot.utils.getWebhook(channel.guild);
    if (!webhook) return;
    const lang = await bot.utils.getGuildLang(channel.guild.id);

    let msg = "";

    const type = channel.type === "category" ? "Category" : "Channel";
    msg = lang.EVENTS.CHANNEL_CREATED_MSG.replace("{channel_type}", type).replace(
      "{channel}",
      channel.name
    );

    const embed = bot.utils
      .baseEmbed({ author: bot.user })
      .setTitle(lang.EVENTS.CHANNEL_CREATED)
      .setDescription(msg)
      .setColor("GREEN")
      .setTimestamp();

    webhook.send(embed);
  }
}
