const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { setGuildConfig, getUserData, updateUserData, getGuildConfig, COLORS } = require('./utils');
const { db } = require('./firebase');
const { ref, remove } = require('firebase/database');

module.exports = {
  data: [
    new SlashCommandBuilder()
      .setName('setleaderboardinfo')
      .setDescription('Set leaderboard channel (ADMIN ONLY)')
      .addChannelOption(opt => opt.setName('channel').setDescription('Channel for leaderboard').setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    new SlashCommandBuilder()
      .setName('setcommandchannel')
      .setDescription('Set admin command channel (ADMIN ONLY)')
      .addChannelOption(opt => opt.setName('channel').setDescription('Admin command channel').setRequired(true))
      .addStringOption(opt => opt.setName('commands').setDescription('Comma-separated commands').setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    new SlashCommandBuilder()
      .setName('setwelcome')
      .setDescription('Set welcome channel (ADMIN ONLY)')
      .addChannelOption(opt => opt.setName('channel').setDescription('Welcome channel').setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    new SlashCommandBuilder()
      .setName('setautorole')
      .setDescription('Set auto-role for new members (ADMIN ONLY)')
      .addRoleOption(opt => opt.setName('role').setDescription('Role to assign').setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    new SlashCommandBuilder()
      .setName('givexp')
      .setDescription('Give XP to a user (ADMIN ONLY)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('XP amount').setMinValue(1).setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    new SlashCommandBuilder()
      .setName('removexp')
      .setDescription('Remove XP from user (ADMIN ONLY)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('XP amount').setMinValue(1).setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),

    new SlashCommandBuilder()
      .setName('resetuser')
      .setDescription('Reset user data (ADMIN ONLY)')
      .addUserOption(opt => opt.setName('user').setDescription('User').setRequired(true))
      .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
  ],

  async execute(interaction) {
    const { commandName, options, guildId } = interaction;

    switch (commandName) {
      case 'setleaderboardinfo': {
        const channel = options.getChannel('channel');
        await setGuildConfig(guildId, 'leaderboardChannel', channel.id);
        const embed = new EmbedBuilder()
          .setTitle('✅ Leaderboard Channel Set')
          .setDescription(`Leaderboard will update in ${channel}`)
          .setColor(COLORS.success)
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }

      case 'setcommandchannel': {
        const channel = options.getChannel('channel');
        const commandsStr = options.getString('commands');
        await setGuildConfig(guildId, 'commandChannel', channel.id);
        await setGuildConfig(guildId, 'allowedCommands', commandsStr.split(',').map(c => c.trim()));
        const embed = new EmbedBuilder()
          .setTitle('✅ Admin Command Channel Set')
          .setDescription(`Channel: ${channel}\nCommands: ${commandsStr}`)
          .setColor(COLORS.success)
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }

      case 'setwelcome': {
        const channel = options.getChannel('channel');
        await setGuildConfig(guildId, 'welcomeChannel', channel.id);
        const embed = new EmbedBuilder()
          .setTitle('✅ Welcome Channel Set')
          .setDescription(`New members will be welcomed in ${channel}`)
          .setColor(COLORS.success)
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }

      case 'setautorole': {
        const role = options.getRole('role');
        await setGuildConfig(guildId, 'autoRole', role.id);
        const embed = new EmbedBuilder()
          .setTitle('✅ Auto-Role Set')
          .setDescription(`New members will get ${role}`)
          .setColor(COLORS.success)
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }

      case 'givexp': {
        const target = options.getUser('user');
        const amount = options.getInteger('amount');
        const data = await getUserData(target.id, guildId);
        await updateUserData(target.id, guildId, { xp: (data.xp || 0) + amount });
        const embed = new EmbedBuilder()
          .setTitle('✅ XP Given')
          .setDescription(`Gave **${amount} XP** to ${target}`)
          .setColor(COLORS.success)
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }

      case 'removexp': {
        const target = options.getUser('user');
        const amount = options.getInteger('amount');
        const data = await getUserData(target.id, guildId);
        const newXp = Math.max(0, (data.xp || 0) - amount);
        await updateUserData(target.id, guildId, { xp: newXp });
        const embed = new EmbedBuilder()
          .setTitle('✅ XP Removed')
          .setDescription(`Removed **${amount} XP** from ${target}\nNew XP: ${newXp}`)
          .setColor(COLORS.warning)
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }

      case 'resetuser': {
        const target = options.getUser('user');
        await remove(ref(db, `users/${guildId}/${target.id}`));
        const embed = new EmbedBuilder()
          .setTitle('✅ User Reset')
          .setDescription(`Reset all data for ${target}`)
          .setColor(COLORS.danger)
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }
    }
  }
};
