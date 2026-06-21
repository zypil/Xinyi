const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getLeaderboard, updateUserData, getGuildConfig, COLORS } = require('./utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nitroreward')
    .setDescription('Award Nitro to top 3 (OWNER ONLY)')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

  async execute(interaction) {
    const topUsers = await getLeaderboard(interaction.guildId, 3);
    if (topUsers.length < 3) {
      return interaction.reply({ content: 'Need at least 3 members for Nitro rewards!', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🎁 NITRO REWARDS DISTRIBUTED')
      .setDescription(
        `**🥇 1st Place:** <@${topUsers[0].id}> - 3 Days Nitro\n` +
        `**🥈 2nd Place:** <@${topUsers[1].id}> - 3 Days Nitro\n` +
        `**🥉 3rd Place:** <@${topUsers[2].id}> - 3 Days Nitro`
      )
      .setColor(COLORS.gold)
      .setTimestamp();

    for (let i = 0; i < 3; i++) {
      await updateUserData(topUsers[i].id, interaction.guildId, {
        nitroWins: (topUsers[i].nitroWins || 0) + 1
      });
    }

    await interaction.reply({ embeds: [embed] });

    const config = await getGuildConfig(interaction.guildId);
    if (config.leaderboardChannel) {
      const lbChannel = await interaction.guild.channels.fetch(config.leaderboardChannel).catch(() => null);
      if (lbChannel) await lbChannel.send({ embeds: [embed] });
    }
  }
};
