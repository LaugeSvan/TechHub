const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: (builder) => builder
        .setName('kick')
        .setDescription('Kicks a user from the server.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to kick.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the kick.')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        
        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        const targetMember = interaction.guild.members.cache.get(targetUser.id);
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.editReply("You do not have permission to kick members.");
        }

        try {
            await targetMember.kick(reason);
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription(`✅ **${targetUser.tag}** has been kicked. \nReason: *${reason}*`);

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply(`I failed to kick ${targetUser.tag}. Check my role hierarchy and permissions.`);
        }
    },
};