const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const subcommandData = new SlashCommandSubcommandBuilder()
    .setName('warn')
    .setDescription('Issues an official warning to a user.')
    .addUserOption(option =>
        option.setName('target')
            .setDescription('The member to warn.')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('The reason for the warning.')
            .setRequired(true));

module.exports = {
    data: subcommandData,
    
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true }); 

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
            return interaction.editReply("⚠️ You need Kick Members permission or higher to issue warnings.");
        }

        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle(`⚠️ Official Warning in ${interaction.guild.name}`)
                .setDescription(`You have received a warning from a moderator.`)
                .addFields(
                    { name: 'Moderator', value: interaction.user.tag, inline: true },
                    { name: 'Reason', value: reason, inline: false }
                )
                .setTimestamp();
                
            await targetUser.send({ embeds: [dmEmbed] }).catch(() => {
                 console.log(`error.dmUser.${targetUser.tag}.`);
            });

            const replyEmbed = new EmbedBuilder()
                .setColor('#00AA00')
                .setDescription(`✅ Successfully **warned** ${targetUser.tag}. \nReason: *${reason}* \n(Note: User was DM'd.)`);
            
            await interaction.editReply({ embeds: [replyEmbed] });

            interaction.channel.send(`**[MOD LOG]** ${targetUser.tag} was warned by ${interaction.user.tag}. Reason: ${reason}`);

        } catch (error) {
            console.error(error);
            await interaction.editReply(`An error occurred while trying to warn ${targetUser.tag}.`);
        }
    },
};