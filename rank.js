const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, getRank, getLevel, getProgress, COLORS } = require('./utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Check your current rank and progress'),

  async execute(interaction) {
    const data = await getUserData(interaction.user.id, interaction.guildId);
    const rank = getRank(data.xp);
    const level = getLevel(data.xp);
    const progress = getProgress(data.xp);

    const embed = new EmbedBuilder()
      .setTitle(`${rank.icon} Your Rank`)
      .addFields(
        { name: 'Rank', value: rank.name, inline: true },
        { name: 'Level', value: `${level}`, inline: true },
        { name: 'XP', value: `${data.xp.toLocaleString()}`, inline: true },
        { name: 'Progress', value: `${Math.floor(progress)}% to Level ${level + 1}`, inline: true },
        { name: 'Messages', value: `${data.messages || 0}`, inline: true },
        { name: 'Streak', value: `${data.streak || 0}🔥`, inline: true }
      )
      .setColor(rank.color || COLORS.primary)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
