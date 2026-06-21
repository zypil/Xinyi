const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { COLORS } = require('./utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🌙 XINYI - VESPERA BOT HELP')
      .setDescription(
        '**👤 User Commands:**\n' +
        '`/profile` - View your profile card\n' +
        '`/profile @user` - View someone\'s profile\n' +
        '`/leaderboard` - View server leaderboard\n' +
        '`/rank` - Check your rank & progress\n\n' +
        '**🔒 Admin Commands:**\n' +
        '`/setleaderboardinfo #channel` - Set leaderboard channel\n' +
        '`/setcommandchannel #channel commands` - Set admin command channel\n' +
        '`/setwelcome #channel` - Set welcome channel\n' +
        '`/setautorole @role` - Set auto-role for new members\n' +
        '`/givexp @user amount` - Give XP to user\n' +
        '`/removexp @user amount` - Remove XP from user\n' +
        '`/resetuser @user` - Reset user data\n' +
        '`/nitroreward` - Award Nitro to top 3\n' +
        '`/serverstats` - View server stats\n' +
        '`/config` - View bot configuration\n\n' +
        '**✨ Features:**\n' +
        '• Auto-register new members\n' +
        '• XP from chatting (cooldown: 1 min)\n' +
        '• Level up system with 7 ranks\n' +
        '• Streak system\n' +
        '• Beautiful profile cards & leaderboard images\n' +
        '• Auto leaderboard updates every 5 min\n' +
        '• Top 3 get Nitro rewards'
      )
      .setColor(COLORS.primary)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
