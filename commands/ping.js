const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    // Defines the command name, description, and any options
    data: new SlashCommandBuilder()
        .setName('ping') // This is what the user types: /ping
        .setDescription('Replies with Pong!'),

    // The execution function uses interaction instead of message
    async execute(interaction) {
        // Reply is always used for interactions
        await interaction.reply('Pong!');
    },
};