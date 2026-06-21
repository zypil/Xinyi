const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserData, getRank, getLevel, getProgress, generateProfileCard, COLORS } = require('./utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your profile card')
    .addUserOption(opt => opt.setName('user').setDescription('User to view').setRequired(false)),

  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const data = await getUserData(target.id, interaction.guildId);
    const attachment = await generateProfileCard(target, data);
    const rank = getRank(data.xp);

    const embed = new EmbedBuilder()
      .setTitle(`${rank.icon} ${target.username}'s Profile`)
      .setDescription(`**Rank:** ${rank.name}\n**Level:** ${getLevel(data.xp)}\n**XP:** ${data.xp.toLocaleString()}\n**Messages:** ${data.messages || 0}\n**Streak:** ${data.streak || 0}🔥\n**Nitro Wins:** ${data.nitroWins || 0}🎁`)
      .setColor(rank.color || COLORS.primary)
      .setImage('attachment://profile.png')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], files: [attachment], ephemeral: target.id === interaction.user.id });
  }
};
