const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard, generateLeaderboardImage, COLORS } = require('./utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('View the server leaderboard')
    .addIntegerOption(opt => opt.setName('limit').setDescription('Number of users').setMinValue(5).setMaxValue(25).setRequired(false)),

  async execute(interaction) {
    const limit = interaction.options.getInteger('limit') || 10;
    const topUsers = await getLeaderboard(interaction.guildId, limit);

    if (topUsers.length === 0) {
      return interaction.reply({ content: 'No data yet! Start chatting to earn XP.', ephemeral: true });
    }

    const attachment = await generateLeaderboardImage(interaction.guild, topUsers);
    const embed = new EmbedBuilder()
      .setTitle('🏆 VESPERA LEADERBOARD')
      .setDescription('Top active members')
      .setColor(COLORS.primary)
      .setImage('attachment://leaderboard.png')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [attachment] });
  }
};
