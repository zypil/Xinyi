require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const cron = require('node-cron');
const { db } = require('./firebase');
const { ref, set, remove } = require('firebase/database');

const {
  getUserData,
  updateUserData,
  getGuildConfig,
  getXpGain,
  isOnCooldown,
  updateLeaderboard,
  COLORS
} = require('./utils');

const profileCmd = require('./profile');
const leaderboardCmd = require('./leaderboard');
const rankCmd = require('./rank');
const adminCmd = require('./admin');
const nitroCmd = require('./nitro');
const statsCmd = require('./stats');
const helpCmd = require('./help');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates
  ]
});

const slashCommands = [
  profileCmd.data,
  leaderboardCmd.data,
  rankCmd.data,
  ...adminCmd.data,
  nitroCmd.data,
  ...statsCmd.data,
  helpCmd.data
];

client.once('ready', async () => {
  console.log(`🌙 XINYI is online! Logged in as ${client.user.tag}`);

  try {
    await client.rest.put(
      `/applications/${process.env.DISCORD_CLIENT_ID}/guilds/${process.env.DISCORD_GUILD_ID}/commands`,
      { body: slashCommands.map(c => c.toJSON()) }
    );
    console.log('✅ Slash commands registered');
  } catch (e) {
    console.error('❌ Command registration failed:', e);
  }

  cron.schedule('*/5 * * * *', async () => {
    const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID).catch(() => null);
    if (guild) await updateLeaderboard(client, guild);
  });
});

client.on('guildMemberAdd', async (member) => {
  const config = await getGuildConfig(member.guild.id);

  if (config.welcomeChannel) {
    const channel = await member.guild.channels.fetch(config.welcomeChannel).catch(() => null);
    if (channel) {
      const embed = new EmbedBuilder()
        .setTitle(`🌙 Welcome to ${member.guild.name}!`)
        .setDescription(`Hey ${member}, welcome to **VESPERA**! Start chatting to earn XP and climb the leaderboard!`)
        .setColor(COLORS.primary)
        .setThumbnail(member.user.displayAvatarURL())
        .setTimestamp();
      await channel.send({ content: `${member}`, embeds: [embed] });
    }
  }

  if (config.autoRole) {
    const role = await member.guild.roles.fetch(config.autoRole).catch(() => null);
    if (role) await member.roles.add(role).catch(() => null);
  }

  await set(ref(db, `users/${member.guild.id}/${member.id}`), {
    xp: 0,
    messages: 0,
    joinDate: Date.now(),
    lastActive: Date.now(),
    nitroWins: 0,
    streak: 0
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  if (isOnCooldown(message.guild.id, message.author.id)) return;

  const xpGain = getXpGain();
  const userData = await getUserData(message.author.id, message.guild.id);
  const newXp = (userData.xp || 0) + xpGain;
  const newMessages = (userData.messages || 0) + 1;
  const oldLevel = Math.floor(Math.sqrt((userData.xp || 0) / 100)) + 1;
  const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

  await updateUserData(message.author.id, message.guild.id, {
    xp: newXp,
    messages: newMessages,
    lastActive: Date.now(),
    streak: ((Date.now() - (userData.lastActive || 0)) < 86400000) ? (userData.streak || 0) + 1 : 1
  });

  if (newLevel > oldLevel) {
    const embed = new EmbedBuilder()
      .setTitle('🎉 LEVEL UP!')
      .setDescription(`${message.author} leveled up to **Level ${newLevel}**!`)
      .setColor(COLORS.gold)
      .setThumbnail(message.author.displayAvatarURL());
    await message.reply({ embeds: [embed] }).catch(() => null);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const config = await getGuildConfig(interaction.guildId);
  const adminCommands = ['setleaderboardinfo', 'setcommandchannel', 'setwelcome', 'setautorole', 'givexp', 'removexp', 'resetuser', 'nitroreward', 'serverstats', 'config'];

  if (config.commandChannel && adminCommands.includes(interaction.commandName)) {
    if (interaction.channelId !== config.commandChannel) {
      return interaction.reply({
        content: `❌ Admin commands only work in <#${config.commandChannel}>`,
        ephemeral: true
      });
    }
  }

  try {
    switch (interaction.commandName) {
      case 'profile': await profileCmd.execute(interaction); break;
      case 'leaderboard': await leaderboardCmd.execute(interaction); break;
      case 'rank': await rankCmd.execute(interaction); break;
      case 'setleaderboardinfo':
      case 'setcommandchannel':
      case 'setwelcome':
      case 'setautorole':
      case 'givexp':
      case 'removexp':
      case 'resetuser': await adminCmd.execute(interaction); break;
      case 'nitroreward': await nitroCmd.execute(interaction); break;
      case 'serverstats':
      case 'config': await statsCmd.execute(interaction); break;
      case 'help': await helpCmd.execute(interaction); break;
    }
  } catch (e) {
    console.error(e);
    await interaction.reply({ content: '❌ An error occurred!', ephemeral: true }).catch(() => null);
  }
});

client.login(process.env.DISCORD_TOKEN);
