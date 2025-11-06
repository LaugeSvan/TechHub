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
    const subcommandModule = require(path.join(__dirname, 'mod', file));
    
    if (subcommandModule.data) {
        data.addSubcommand(subcommandModule.data);
    } else {
        console.warn(`error.noData.${file}`);
    }
}

module.exports = {
    data,
    
    async execute(interaction) {
        const subcommandName = interaction.options.getSubcommand();
        
        try {
            const subcommandFile = require(path.join(__dirname, 'mod', `${subcommandName}.js`));
            await subcommandFile.execute(interaction);
            
        } catch (error) {
            console.error(`error.run./mod.${subcommandName}:`, error);
            await interaction.reply({ content: `An unexpected error occurred while running /mod ${subcommandName}.`, ephemeral: true });
        }
    },
};