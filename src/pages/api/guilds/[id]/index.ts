import DJS from "discord.js";
import { NextApiResponse } from "next";
import { hiddenGuildItems } from "data/hidden-items";
import ApiRequest from "types/ApiRequest";

export default async function handler(req: ApiRequest, res: NextApiResponse) {
  const { method, query } = req;
  const { id: guildId } = query;

  try {
    await req.bot.utils.checkAuth(req, { guildId: `${guildId}` });
  } catch (e) {
    return res.json({ status: "error", error: e });
  }

  switch (method) {
    case "GET": {
      const discordGuild = await req.bot.guilds.fetch(query.id as DJS.Snowflake);
      const guild = await req.bot.utils.handleApiRequest(
        `/guilds/${query.id}`,
        { type: "Bot", data: `${process.env["DISCORD_BOT_TOKEN"]}` },
        "GET",
      );

      const gSlashCommands = await discordGuild.commands.fetch().catch(() => null);
      const gChannels = await req.bot.utils.handleApiRequest(
        `/guilds/${query.id}/channels`,
        {
          type: "Bot",
          data: `${process.env["DISCORD_BOT_TOKEN"]}`,
        },
        "GET",
      );

      if (guild.error || guild.message) {
        return res.json({
          error: guild.error || guild.message,
          status: "error",
          invalid_token: guild.error === "invalid_token",
        });
      }

      const g = await req.bot.utils.getGuildById(guild.id);

      if (!g) {
        return res.json({
          error: "An unexpected error occurred",
          status: "error",
        });
      }
      guild.channels = gChannels.filter((c: { type: number }) => {
        /* remove category 'channels' & voice channels */
        if (c.type === 4) return false; /* category */
        if (c.type === 2) return false; /* voice chat */
        if (c.type === 3) return false; /* group DM */
        if (c.type === 6) return false; /* store page */

        return true;
      });

      guild.categories = gChannels.filter((c) => c.type === 4);
      guild.voice_channels = gChannels.filter((c) => c.type === 2);
      guild.categories.unshift({ id: null, name: "Disabled" });
      guild.channels.unshift({ id: null, name: "Disabled" });
      guild.roles.unshift({ id: null, name: "Disabled" });
      guild.voice_channels.unshift({ id: null, name: "Disabled" });
      guild.roles = guild.roles.filter((r) => r.name !== "@everyone");

      if (gSlashCommands) {
        guild.slash_commands = gSlashCommands.array().map((command) => {
          const cmd = g.slash_commands.find((c) => c.slash_cmd_id === command.id);

          return {
            ...cmd,
            description: command.description,
            id: command.id,
          };
        });
      } else {
        guild.slash_commands = null;
      }

      hiddenGuildItems.forEach((item) => {
        guild[item] = undefined;
      });

      return res.json({
        guild: { ...g.toJSON(), ...guild },
        botCommands: req.bot.commands.map((cmd) => cmd.name),
        status: "success",
      });
    }
    case "POST": {
      const body = JSON.parse(req.body);
      const g = await req.bot.utils.getGuildById(`${guildId}`);

      if (!g) {
        return res.json({
          error: "An unexpected error occurred",
          status: "error",
        });
      }

      if (body?.audit_channel) {
        await req.bot.utils.createWebhook(body.audit_channel, g?.audit_channel || undefined);
      }

      if (body?.starboards_data?.enabled === true) {
        /**
         * check if starboards is enabled and no channel is provider
         */
        if (body.starboards_data?.channel_id !== "Disabled") {
          if (body?.starboards_data?.channel_id === null) {
            return res.json({
              error: "Starboards channel must be provided when starboards is enabled!",
              status: "error",
            });
          }

          try {
            const starboard = req.bot.starboardsManager.starboards.find(
              (s) =>
                s.channelID === g?.starboards_data?.channel_id &&
                s.options.emoji === g?.starboards_data?.emoji,
            );

            await req.bot.utils.createStarboard(
              {
                id: body?.starboards_data?.channel_id,
                guild: { id: g?.guild_id },
              },
              {
                emoji: body?.starboards_data?.emoji || "???",
              },
              {
                channelID: starboard?.channelID as DJS.Snowflake,
                emoji: starboard?.options.emoji,
              },
            );
          } catch (e) {
            req.bot.utils.sendErrorLog(e, "error");
          }
        } else {
          return res.json({
            error: "Starboards channel must be provided when starboards is enabled!",
            status: "error",
          });
        }
      } else {
        try {
          req.bot.starboardsManager.delete(g.starboards_data.channel_id, g?.starboards_data.emoji);
        } catch (e) {
          // eslint-disable-next-line quotes
          if (!e?.stack?.includes('Error: The channel "')) {
            req.bot.utils.sendErrorLog(e, "error");
            return res.json({
              error: "An error occurred when deleting the starboard, please try again later",
              status: "error",
            });
          }
        }
      }

      await req.bot.utils.updateGuildById(`${guildId}`, body);

      return res.json({
        status: "success",
        message: "Successfully updated guild settings",
      });
    }
    default: {
      return res.status(405).json({ error: "Method not allowed", status: "error" });
    }
  }
}
