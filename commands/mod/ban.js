const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: (builder) => builder
        .setName('ban')
        .setDescription('Bans a user from the server.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The member to ban.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban.')
                .setRequired(false)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided.';
        const targetMember = interaction.guild.members.cache.get(targetUser.id);

        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return interaction.editReply("❌ You do not have permission to ban members.");
        }
        
        if (!targetMember) {
             return interaction.editReply('That user is not a member of this server or they left before I could act.');
        }
        if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.editReply(`❌ I cannot ban ${targetUser.tag}. My highest role must be above theirs.`);
        }

        try {
            await targetMember.ban({ reason, deleteMessageSeconds: 0 }); 
            
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