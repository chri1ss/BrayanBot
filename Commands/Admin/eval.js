const Utils = require("../../Modules/Utils"),
    { lang, config, commands } = require("../../index"),
    moment = require("moment");

module.exports = {
    name: "eval",
    type: "admin",
    commandData: commands.Admin.Eval,
};

/**
 *
 * @param {Discord.Client} bot
 * @param {Discord.Message} message
 * @param {Array} args
 */
module.exports.run = async (bot, message, args) => {
    // Define code to eval
    const input = args.join(" ");
    // Send error message if code is empty
    if (!input) return message.reply(Utils.setupMessage({
        configPath: lang.Presets.Error,
        variables: [
            { searchFor: /{error}/g, replaceWith: "Du musst den Code definieren, der ausgeführt werden soll!" },
            ...Utils.userVariables(message.member),
            ...Utils.botVariables(bot),
        ],
    }));
    // Send error message if input includes bot.token
    if (input.includes("token")) return message.reply(Utils.setupMessage({
        configPath: lang.Presets.Error,
        variables: [
            { searchFor: /{error}/g, replaceWith: "Du kannst keinen Code ausführen, der Bot-Token enthält!" },
            ...Utils.userVariables(message.member),
            ...Utils.botVariables(bot),
        ],
    }));
    // Try to execute code
    try {
        var output = await eval(input);
    } catch (e) {
        var output = e;
    }
    // Send error message if output includes token
    if (typeof output != "map" && output.toString().includes(bot.token)) return message.reply(Utils.setupMessage({
        configPath: lang.Presets.Error,
        variables: [
            { searchFor: /{error}/g, replaceWith: "Du kannst keinen Code ausführen, der Bot-Token enthält!" },
            ...Utils.userVariables(message.member),
            ...Utils.botVariables(bot),
        ],
    }));
    // Send message with eval output
    message.reply(Utils.setupMessage({
        configPath: lang.Admin.Eval,
        variables: [
            { searchFor: /{input}/g, replaceWith: input },
            { searchFor: /{output}/g, replaceWith: output },
            ...Utils.userVariables(message.member),
            ...Utils.botVariables(bot),
        ],
    }));
};
/**
 *
 * @param {Discord.Client} bot
 * @param {Discord.Interaction} interaction
 */
module.exports.runSlash = async (bot, interaction) => {
    // Define code to eval
    const input = interaction.options.getString("code");
    // Send error message if code is empty
    if (!input) return interaction.reply(Utils.setupMessage({
        configPath: lang.Presets.Error,
        variables: [
            { searchFor: /{error}/g, replaceWith: "Du musst den Code definieren, der ausgeführt werden soll!" },
            ...Utils.userVariables(interaction.member),
            ...Utils.botVariables(bot),
        ],
    }));
    // Send error message if input includes bot.token
    if (input.includes("bot.token")) return interaction.reply(Utils.setupMessage({
        configPath: lang.Presets.Error,
        variables: [
            { searchFor: /{error}/g, replaceWith: "Du kannst keinen Code ausführen, der Bot-Token enthält!" },
            ...Utils.userVariables(interaction.member),
            ...Utils.botVariables(bot),
        ],
    }));
    // Try to execute code
    try {
        var output = await eval(input);
    } catch (e) {
        var output = e;
    }
    // Send error message if output includes token
    if (typeof output != "map" && output.toString().includes(bot.token)) return interaction.reply(Utils.setupMessage({
        configPath: lang.Presets.Error,
        variables: [
            { searchFor: /{error}/g, replaceWith: "Du kannst keinen Code ausführen, der Bot-Token enthält!" },
            ...Utils.userVariables(interaction.member),
            ...Utils.botVariables(bot),
        ],
    }));
    // Send message with eval output
    interaction.reply(Utils.setupMessage({
        configPath: lang.Admin.Eval,
        variables: [
            { searchFor: /{input}/g, replaceWith: input },
            { searchFor: /{output}/g, replaceWith: output },
            ...Utils.userVariables(interaction.member),
            ...Utils.botVariables(bot),
        ],
    }));
};
