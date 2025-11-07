const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

const REQUIRED_ROLE_ID = '1434578752981041233';

const subcommandFiles = fs.readdirSync(path.join(__dirname, 'mod'))
    .filter(file => file.endsWith('.js'));

const data = new SlashCommandBuilder()
    .setName('mod')
    .setDescription('Moderation commands for the server.');

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
        const member = interaction.member; 

        if (!member.roles.cache.has(REQUIRED_ROLE_ID)) {
            return interaction.reply({ 
                content: `You do not have the required role (<@&${REQUIRED_ROLE_ID}>) to use the \`/mod\` commands.`, 
                ephemeral: true 
            });
        }
        
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