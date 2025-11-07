const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js'); // Added ChannelType

const MOD_LOG_CHANNEL_ID = '1434814467119779880';

const subcommandData = new SlashCommandSubcommandBuilder()
    .setName('kick')
    .setDescription('Kicks a user from the server.')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('The member to kick.')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('The reason for the kick.')
            .setRequired(false));

module.exports = {
    data: subcommandData, 
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        const targetMember = interaction.guild.members.cache.get(targetUser.id);
        
        if (!targetMember) {
             return interaction.editReply('That user is not a member of this server.');
        }
        
        if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.editReply(`❌ I cannot kick ${targetUser.tag}. My highest role must be above theirs.`);
        }

        try {
            await targetMember.kick(reason);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription(`✅ **${targetUser.tag}** has been kicked. \nReason: *${reason}*`);

            await interaction.editReply({ embeds: [embed] });

            const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);
            if (logChannel && logChannel.type === ChannelType.GuildText) {
                logChannel.send(`**[MOD LOG - KICK]** ${targetUser.tag} was kicked by ${interaction.user.tag}. Reason: ${reason}`);
            } else {
                console.warn('error.modLogChannelNotFound');
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply(`I failed to kick ${targetUser.tag}. Check bot permissions.`);
        }
    },
};