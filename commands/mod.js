// commands/mod.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const subcommandFiles = fs.readdirSync(path.join(__dirname, 'mod'))
    .filter(file => file.endsWith('.js'));

const data = new SlashCommandBuilder()
    .setName('mod')
    .setDescription('Moderation commands for the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers);

for (const file of subcommandFiles) {
    const subcommand = require(path.join(__dirname, 'mod', file));
    subcommand.data(data); 
}

module.exports = {
    data,
    
    async execute(interaction) {
        const subcommandName = interaction.options.getSubcommand();
        
        const subcommandFile = require(path.join(__dirname, 'mod', `${subcommandName}.js`));
        
        try {
            await subcommandFile.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `An error occurred while running /mod ${subcommandName}.`, ephemeral: true });
        }
    },
};