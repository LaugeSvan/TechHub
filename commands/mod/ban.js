const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const MOD_LOG_CHANNEL_ID = '1434814467119779880';

const subcommandData = new SlashCommandSubcommandBuilder()
    .setName('ban')
    .setDescription('Bans a user from the server.')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('The member to ban.')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('The reason for the ban.')
            .setRequired(false));

module.exports = {
    data: subcommandData,
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        const targetMember = interaction.guild.members.cache.get(targetUser.id);

        if (targetMember && targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.editReply(`❌ You cannot ban ${targetUser.tag} because your highest role is not above theirs.`);
        }
        
        if (targetMember && targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.editReply(`❌ I cannot ban ${targetUser.tag}. My highest role must be above theirs.`);
        }

        try {
            await interaction.guild.members.ban(targetUser.id, { reason, deleteMessageSeconds: 0 }); 
            
            const embed = new EmbedBuilder()
                .setColor('#CC0000')
                .setDescription(`🔨 **${targetUser.tag}** has been permanently banned. \nReason: *${reason}*`);

            await interaction.editReply({ embeds: [embed] });

            const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);
            if (logChannel && logChannel.type === ChannelType.GuildText) {
                logChannel.send(`**[MOD LOG - BAN]** ${targetUser.tag} was banned by ${interaction.user.tag}. Reason: ${reason}`);
            } else {
                console.warn('error.modLogChannelNotFound');
            }
            
        } catch (error) {
            console.error(error);
            if (error.code === 10013) {
                await interaction.editReply(`An error occurred while trying to ban ${targetUser.tag}. Check bot permissions.`);
            } else {
                 await interaction.editReply(`An error occurred while trying to ban ${targetUser.tag}. Check bot permissions.`);
            }
        }
    },
};