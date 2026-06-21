const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { db } = require('./firebase');
const { ref, get, update, set } = require('firebase/database');

const COLORS = {
  primary: 0x6B4EE6,
  secondary: 0x9B7BFF,
  accent: 0xFF6B9D,
  danger: 0xFF4757,
  success: 0x2ED573,
  warning: 0xFFA502,
  dark: 0x1E1E2E,
  gold: 0xFFD700,
  silver: 0xC0C0C0,
  bronze: 0xCD7F32
};

const RANKS = [
  { name: 'Novice', min: 0, color: 0x95A5A6, icon: '🌱' },
  { name: 'Explorer', min: 100, color: 0x3498DB, icon: '🔍' },
  { name: 'Adventurer', min: 500, color: 0x2ECC71, icon: '⚔️' },
  { name: 'Knight', min: 1500, color: 0x9B59B6, icon: '🛡️' },
  { name: 'Elite', min: 3500, color: 0xE74C3C, icon: '👑' },
  { name: 'Legend', min: 7000, color: 0xFFD700, icon: '🏆' },
  { name: 'Vespera', min: 15000, color: 0x6B4EE6, icon: '🌙' }
];

const XP_MIN = 15;
const XP_MAX = 25;
const LEVEL_MULTIPLIER = 100;
const COOLDOWN = new Map();
const XP_COOLDOWN = 60000;

function getRank(xp) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].min) return RANKS[i];
  }
  return RANKS[0];
}

function getLevel(xp) {
  return Math.floor(Math.sqrt(xp / LEVEL_MULTIPLIER)) + 1;
}

function getXpForLevel(level) {
  return Math.pow(level - 1, 2) * LEVEL_MULTIPLIER;
}

function getProgress(xp) {
  const level = getLevel(xp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = getXpForLevel(level + 1);
  const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
  return Math.min(100, Math.max(0, progress));
}

async function getUserData(userId, guildId) {
  const snapshot = await get(ref(db, `users/${guildId}/${userId}`));
  if (snapshot.exists()) return snapshot.val();
  return {
    xp: 0,
    messages: 0,
    joinDate: Date.now(),
    lastActive: Date.now(),
    nitroWins: 0,
    streak: 0
  };
}

async function updateUserData(userId, guildId, data) {
  await update(ref(db, `users/${guildId}/${userId}`), data);
}

async function getGuildConfig(guildId) {
  const snapshot = await get(ref(db, `config/${guildId}`));
  if (snapshot.exists()) return snapshot.val();
  return {
    leaderboardChannel: null,
    commandChannel: null,
    welcomeChannel: null,
    autoRole: null
  };
}

async function setGuildConfig(guildId, key, value) {
  await update(ref(db, `config/${guildId}`), { [key]: value });
}

async function getLeaderboard(guildId, limit = 10) {
  const snapshot = await get(ref(db, `users/${guildId}`));
  if (!snapshot.exists()) return [];
  return Object.entries(snapshot.val())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, limit);
}

function getXpGain() {
  return Math.floor(Math.random() * (XP_MAX - XP_MIN + 1)) + XP_MIN;
}

function isOnCooldown(guildId, userId) {
  const key = `${guildId}-${userId}`;
  const now = Date.now();
  if (COOLDOWN.has(key) && now - COOLDOWN.get(key) < XP_COOLDOWN) return true;
  COOLDOWN.set(key, now);
  return false;
}

async function generateProfileCard(user, memberData) {
  const width = 900;
  const height = 350;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const rank = getRank(memberData.xp);
  const level = getLevel(memberData.xp);
  const progress = getProgress(memberData.xp);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(0.5, '#16213e');
  gradient.addColorStop(1, '#0f3460');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#6B4EE6';
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(100, 100, 0, 100, 100, 300);
  glow.addColorStop(0, 'rgba(107,78,230,0.3)');
  glow.addColorStop(1, 'rgba(107,78,230,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.beginPath();
  ctx.arc(130, 175, 80, 0, Math.PI * 2);
  ctx.fillStyle = '#0f3460';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = rank.color ? `#${rank.color.toString(16).padStart(6, '0')}` : '#6B4EE6';
  ctx.stroke();

  try {
    const avatarURL = user.displayAvatarURL({ extension: 'png', size: 256 });
    const img = await loadImage(avatarURL);
    ctx.save();
    ctx.beginPath();
    ctx.arc(130, 175, 75, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, 55, 100, 150, 150);
    ctx.restore();
  } catch (e) {
    ctx.fillStyle = '#6B4EE6';
    ctx.beginPath();
    ctx.arc(130, 175, 75, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(user.username[0].toUpperCase(), 130, 190);
  }

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(user.username, 240, 130);

  ctx.fillStyle = '#9B7BFF';
  ctx.font = '24px Arial';
  ctx.fillText(`${rank.icon} ${rank.name}`, 240, 165);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px Arial';
  ctx.fillText(`Level ${level}`, 240, 210);

  ctx.fillStyle = '#6B4EE6';
  ctx.font = '20px Arial';
  ctx.fillText(`${memberData.xp.toLocaleString()} XP`, 240, 245);

  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fillRect(240, 270, 580, 25);

  const progressGradient = ctx.createLinearGradient(240, 270, 820, 270);
  progressGradient.addColorStop(0, '#6B4EE6');
  progressGradient.addColorStop(1, '#FF6B9D');
  ctx.fillStyle = progressGradient;
  ctx.fillRect(240, 270, 580 * (progress / 100), 25);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.floor(progress)}%`, 530, 287);

  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(`Messages: ${memberData.messages || 0}`, 680, 130);
  ctx.fillText(`Streak: ${memberData.streak || 0}🔥`, 680, 155);
  ctx.fillText(`Nitro Wins: ${memberData.nitroWins || 0}🎁`, 680, 180);

  const buffer = canvas.toBuffer('image/png');
  return new AttachmentBuilder(buffer, { name: 'profile.png' });
}

async function generateLeaderboardImage(guild, topUsers) {
  const width = 1000;
  const height = 200 + (topUsers.length * 120);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0f0f1a');
  gradient.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#6B4EE6';
  ctx.lineWidth = 5;
  ctx.strokeRect(0, 0, width, height);

  const titleGlow = ctx.createRadialGradient(500, 60, 0, 500, 60, 200);
  titleGlow.addColorStop(0, 'rgba(107,78,230,0.4)');
  titleGlow.addColorStop(1, 'rgba(107,78,230,0)');
  ctx.fillStyle = titleGlow;
  ctx.fillRect(0, 0, width, 120);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('🏆 VESPERA LEADERBOARD', 500, 70);

  ctx.fillStyle = '#9B7BFF';
  ctx.font = '24px Arial';
  ctx.fillText('Top Active Members', 500, 100);

  const medals = ['🥇', '🥈', '🥉'];

  for (let i = 0; i < topUsers.length; i++) {
    const userData = topUsers[i];
    const member = await guild.members.fetch(userData.id).catch(() => null);
    const y = 140 + (i * 120);
    const rank = getRank(userData.xp);

    const rowGradient = ctx.createLinearGradient(0, y, 0, y + 100);
    if (i === 0) {
      rowGradient.addColorStop(0, 'rgba(255,215,0,0.2)');
      rowGradient.addColorStop(1, 'rgba(255,215,0,0.05)');
    } else if (i === 1) {
      rowGradient.addColorStop(0, 'rgba(192,192,192,0.2)');
      rowGradient.addColorStop(1, 'rgba(192,192,192,0.05)');
    } else if (i === 2) {
      rowGradient.addColorStop(0, 'rgba(205,127,50,0.2)');
      rowGradient.addColorStop(1, 'rgba(205,127,50,0.05)');
    } else {
      rowGradient.addColorStop(0, 'rgba(107,78,230,0.1)');
      rowGradient.addColorStop(1, 'rgba(107,78,230,0.02)');
    }

    ctx.fillStyle = rowGradient;
    ctx.fillRect(20, y, 960, 100);
    ctx.strokeStyle = i < 3 ? '#FFD700' : '#6B4EE6';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, y, 960, 100);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`${medals[i] || '#' + (i + 1)}`, 40, y + 65);

    try {
      if (member) {
        const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 128 });
        const img = await loadImage(avatarURL);
        ctx.save();
        ctx.beginPath();
        ctx.arc(130, y + 50, 35, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, 95, y + 15, 70, 70);
        ctx.restore();
      }
    } catch (e) {
      ctx.fillStyle = '#6B4EE6';
      ctx.beginPath();
      ctx.arc(130, y + 50, 35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(member ? member.user.username : 'Unknown', 180, y + 45);

    ctx.fillStyle = rank.color ? `#${rank.color.toString(16).padStart(6, '0')}` : '#6B4EE6';
    ctx.font = '18px Arial';
    ctx.fillText(`${rank.icon} ${rank.name}`, 180, y + 70);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Lv.${getLevel(userData.xp)}`, 850, y + 45);

    ctx.fillStyle = '#9B7BFF';
    ctx.font = '18px Arial';
    ctx.fillText(`${userData.xp.toLocaleString()} XP`, 850, y + 70);

    if (i < 3) {
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('🎁 NITRO ELIGIBLE', 850, y + 90);
    }
  }

  const buffer = canvas.toBuffer('image/png');
  return new AttachmentBuilder(buffer, { name: 'leaderboard.png' });
}

async function updateLeaderboard(client, guild) {
  const config = await getGuildConfig(guild.id);
  if (!config.leaderboardChannel) return;

  const channel = await guild.channels.fetch(config.leaderboardChannel).catch(() => null);
  if (!channel) return;

  const topUsers = await getLeaderboard(guild.id, 10);
  if (topUsers.length === 0) return;

  const attachment = await generateLeaderboardImage(guild, topUsers);
  const embed = new EmbedBuilder()
    .setTitle('🌙 VESPERA LEADERBOARD')
    .setDescription('Top active members ranked by XP')
    .setColor(COLORS.primary)
    .setImage('attachment://leaderboard.png')
    .setTimestamp()
    .setFooter({ text: 'Updates every 5 minutes | Type /profile to see your stats' });

  const messages = await channel.messages.fetch({ limit: 10 });
  const botMessage = messages.find(m => m.author.id === client.user.id);

  if (botMessage) {
    await botMessage.edit({ embeds: [embed], files: [attachment] });
  } else {
    await channel.send({ embeds: [embed], files: [attachment] });
  }
}

module.exports = {
  COLORS,
  RANKS,
  getRank,
  getLevel,
  getProgress,
  getUserData,
  updateUserData,
  getGuildConfig,
  setGuildConfig,
  getLeaderboard,
  getXpGain,
  isOnCooldown,
  generateProfileCard,
  generateLeaderboardImage,
  updateLeaderboard,
  db
};
