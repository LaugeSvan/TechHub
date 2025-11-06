const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

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

        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.editReply("❌ You do not have permission to ban members.");
        }
        
        if (!targetMember) {
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
        } catch (error) {
            console.error(error);
            await interaction.editReply(`An error occurred while trying to ban ${targetUser.tag}. Check bot permissions.`);
        }
    },
};