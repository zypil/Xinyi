const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getGuildConfig, COLORS } = require('./utils');
const { db } = require('./firebase');
const { ref, get } = require('firebase/database');

module.exports = {
  data: [
    new SlashCommandBuilder()
      .setName('serverstats')
      .setDescription('View server statistics (ADMIN ONLY)')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    new SlashCommandBuilder()
      .setName('config')
      .setDescription('View current bot configuration (ADMIN ONLY)')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
  ],

  async execute(interaction) {
    const { commandName, guildId } = interaction;

    if (commandName === 'serverstats') {
      const snapshot = await get(ref(db, `users/${guildId}`));
      const users = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
      const totalMessages = snapshot.exists()
        ? Object.values(snapshot.val()).reduce((a, b) => a + (b.messages || 0), 0)
        : 0;
      const activeToday = snapshot.exists()
        ? Object.values(snapshot.val()).filter(u => u.lastActive > Date.now() - 86400000).length
        : 0;

      const embed = new EmbedBuilder()
        .setTitle('📊 Server Statistics')
        .addFields(
          { name: 'Total Members', value: `${users}`, inline: true },
          { name: 'Total Messages', value: `${totalMessages.toLocaleString()}`, inline: true },
          { name: 'Active Today', value: `${activeToday}`, inline: true }
        )
        .setColor(COLORS.primary)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    if (commandName === 'config') {
      const cfg = await getGuildConfig(guildId);
      const embed = new EmbedBuilder()
        .setTitle('⚙️ Bot Configuration')
        .addFields(
          { name: 'Leaderboard Channel', value: cfg.leaderboardChannel ? `<#${cfg.leaderboardChannel}>` : 'Not set', inline: true },
          { name: 'Command Channel', value: cfg.commandChannel ? `<#${cfg.commandChannel}>` : 'Not set', inline: true },
          { name: 'Welcome Channel', value: cfg.welcomeChannel ? `<#${cfg.welcomeChannel}>` : 'Not set', inline: true },
          { name: 'Auto Role', value: cfg.autoRole ? `<@&${cfg.autoRole}>` : 'Not set', inline: true }
        )
        .setColor(COLORS.primary)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  }
};
