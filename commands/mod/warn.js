const { SlashCommandSubcommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const MOD_LOG_CHANNEL_ID = '1434814467119779880';

const TIMEOUT_DURATIONS = {
    '5 minutes': 5 * 60 * 1000,
    '15 minutes': 15 * 60 * 1000,
    '30 minutes': 30 * 60 * 1000,
    '1 hour': 60 * 60 * 1000,
    '6 hours': 6 * 60 * 60 * 1000,
    '1 day': 24 * 60 * 60 * 1000,
    '1 week': 7 * 24 * 60 * 60 * 1000,
};
const DEFAULT_DURATION_NAME = '1 hour';
const DEFAULT_DURATION_MS = TIMEOUT_DURATIONS[DEFAULT_DURATION_NAME];

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
            .setRequired(true))
    .addStringOption(option => {
        option.setName('duration')
            .setDescription(`The duration of the timeout (Defaults to ${DEFAULT_DURATION_NAME}).`)
            .setRequired(false);

        for (const [name, ms] of Object.entries(TIMEOUT_DURATIONS)) {
            option.addChoices({ name: name, value: String(ms) });
        }
        return option;
    });

module.exports = {
    data: subcommandData,

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');
        const durationChoice = interaction.options.getString('duration');
        const timeoutDurationMS = durationChoice ? parseInt(durationChoice, 10) : DEFAULT_DURATION_MS;
        const durationName = Object.keys(TIMEOUT_DURATIONS).find(key => TIMEOUT_DURATIONS[key] === timeoutDurationMS) 
            || `${timeoutDurationMS / 3600000} hours`;

        const targetMember = interaction.guild.members.cache.get(targetUser.id);

        if (!targetMember) {
            return interaction.editReply('That user is not a member of this server.');
        }

        // User role hierarchy check
        if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
            return interaction.editReply(`❌ You cannot warn ${targetUser.tag} because your highest role is not above theirs.`);
        }

        // Bot role hierarchy check
        if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
            return interaction.editReply(`❌ I cannot timeout ${targetUser.tag}. My highest role must be above theirs.`);
        }

        // NEW — Administrator check
        if (targetMember.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.editReply(`❌ I cannot timeout ${targetUser.tag} because they are an administrator.`);
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
                .setFooter({ text: `A ${durationName} timeout has also been applied.` })
                .setTimestamp();

            await targetUser.send({ embeds: [dmEmbed] }).catch(() => {
                console.log(`error.dmUser.${targetUser.tag}.`);
            });

            await targetMember.timeout(timeoutDurationMS, reason);

            const replyEmbed = new EmbedBuilder()
                .setColor('#00AA00')
                .setDescription(`✅ Successfully **warned** and applied a **${durationName} timeout** to ${targetUser.tag}. \nReason: *${reason}*`);

            await interaction.editReply({ embeds: [replyEmbed] });

            const logChannel = interaction.guild.channels.cache.get(MOD_LOG_CHANNEL_ID);
            if (logChannel && logChannel.type === ChannelType.GuildText) {
                logChannel.send(`**[MOD LOG - WARN]** ${targetUser.tag} was warned and timed out for **${durationName}** by ${interaction.user.tag}. Reason: ${reason}`);
            } else {
                console.warn('error.modLogChannelNotFound');
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply(`An error occurred while trying to warn and timeout ${targetUser.tag}.`);
        }
    },
};