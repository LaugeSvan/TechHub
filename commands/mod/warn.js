const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const MOD_LOG_CHANNEL_ID = '1434814467119779880';
const TIMEOUT_DURATION_MS = 60 * 60 * 1000;

const subcommandData = new SlashCommandSubcommandBuilder()
    .setName('warn')
    .setDescription('Issues an official warning to a user and applies a short timeout.')
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
        const targetMember = interaction.guild.members.cache.get(targetUser.id);

        if (!targetMember) {
            return interaction.editReply('That user is not a member of this server.');
        }

        if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.editReply(`❌ You cannot warn ${targetUser.tag} because your highest role is not above theirs.`);
        }

        if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.editReply(`❌ I cannot timeout ${targetUser.tag}. My highest role must be above theirs.`);
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
                .setFooter({ text: `A ${TIMEOUT_DURATION_MS / (60 * 1000)} minute timeout has also been applied.` })
                .setTimestamp();
                
            await targetUser.send({ embeds: [dmEmbed] }).catch(() => {
                console.log(`error.dmUser.${targetUser.tag}.`);
            });

            await targetMember.timeout(TIMEOUT_DURATION_MS, reason);

            const replyEmbed = new EmbedBuilder()
                .setColor('#00AA00')
                .setDescription(`✅ Successfully **warned** and applied a **${TIMEOUT_DURATION_MS / (60 * 1000)} minute timeout** to ${targetUser.tag}. \nReason: *${reason}*`);
            
            await interaction.editReply({ embeds: [replyEmbed] });

            const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);
            if (logChannel && logChannel.type === ChannelType.GuildText) {
                logChannel.send(`**[MOD LOG - WARN]** ${targetUser.tag} was warned and timed out by ${interaction.user.tag}. Reason: ${reason}`);
            } else {
                console.warn('error.modLogChannelNotFound');
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply(`An error occurred while trying to warn and timeout ${targetUser.tag}.`);
        }
    },
};