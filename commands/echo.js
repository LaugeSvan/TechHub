const { SlashCommandBuilder } = require('@discordjs/builders');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo') 
        .setDescription('Repeats the text you provide.')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The message you want the bot to repeat.')
                .setRequired(true)),

    async execute(interaction) {
        const textToEcho = interaction.options.getString('text'); 

        await interaction.reply({ content: textToEcho });
    },
};