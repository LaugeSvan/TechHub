const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo') 
        .setDescription('Displays information about a user.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to get information about (defaults to you).')
                .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('target') || interaction.user;
        
        const member = interaction.guild.members.cache.get(targetUser.id);
        
        const userInfoEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`User Info: ${targetUser.username}`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Username', value: `\`${targetUser.tag}\``, inline: true },
                { name: '🆔 User ID', value: `\`${targetUser.id}\``, inline: true },
                { name: '🗓️ Account Created', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:f>`, inline: false },
                { name: '🚀 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>`, inline: false },
            )
            .setTimestamp()
            .setFooter({ text: `Requested by ${interaction.user.tag}` });

        await interaction.reply({ embeds: [userInfoEmbed] });
    },
};