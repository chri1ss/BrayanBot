const 
    { REST } = require("@discordjs/rest"), { Routes } = require("discord-api-types/v9"),
    { app } = require('../Modules/Handlers/ExpressHandler'),
    Discord = require("discord.js"), 
    Utils = require("../Modules/Utils"),
    packageJSON = require("../package.json"), 
    fsUtils = require("nodejs-fs-utils"),
    chalk = require("chalk"),
    Status = require("../Modules/Handlers/StatusHandler"),
    axios = require('axios').default,
    fse = require ("fs-extra");

/**
 *
 * @param {Discord.Client} bot
 * @param {Discord.Interaction} interaction
 */

    module.exports = async (bot) => {
    let { SlashCmds, SlashCmdsData, config, webserver } = bot,
        rest = new REST({ version: "9" }).setToken(config.Settings.Token),
        fSize = fsUtils.fsizeSync('./', {
            skipErrors: true,
            countFolders: true
        }), guild = bot.guilds.cache.first();

    if (!guild) {
        Utils.logError(`Derzeit auf ${chalk.bold(0)} server. | Der Bot muss sich mindestens auf ${chalk.bold(1)} servern befinden. Verwenden Sie den unten stehenden Link, um den Bot auf Ihren Server einzuladen.`)
        Utils.logError(chalk.blue(`https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=bot%20applications.commands`))
        process.exit(0)
    }
    await Utils.logInfo("#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#");
    await Utils.logInfo("                                                                          ");
    await Utils.logInfo(`                    • ${chalk.bold(`Brayan Bot v${packageJSON.version}`)} is now Online! •       `);
    await Utils.logInfo("                                                                          ");
    await Utils.logInfo("          • Join our Discord Server for any Issues/Custom Bots •          ");
    await Utils.logInfo(`                     ${chalk.blue(chalk.underline(`https://brayanbot.dev/discord`))}                        `);
    await Utils.logInfo("                                                                          ");
    await Utils.logInfo("#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=#");
    await Utils.logInfo(`${chalk.bold(bot.Events.length)} Event${bot.Events.length == 1 ? "" : "s"} Loaded.`);
    await Utils.logInfo(`${chalk.bold(bot.Commands.size)} Command${bot.Commands.size == 1 ? "" : "s"} Loaded.`);

    await rest.put(Routes.applicationGuildCommands(bot.user.id, guild.id), {
        body: SlashCmdsData.filter((x) => typeof x == "object"),
      
    }).catch(e => {
        if (e.code == 50001) {
            Utils.logWarning(`[SlashCommands] \"${chalk.bold(`application.commands`)}\" Der Funktionsbereich wurde beim Einladen des Bots nicht ausgewählt. Bitte verwenden Sie den unten stehenden Link, um Ihren Bot erneut einzuladen.`)
            Utils.logWarning(`[SlashCommands] ${chalk.blue(chalk.underline(chalk.bold(`https://discord.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=8&scope=bot%20applications.commands`)))}`)
        } else {
            Utils.logError(e.stack);
        }
    })

    if (webserver && webserver.Enabled) {
        app.listen(webserver.Port || 8080, () => {
            Utils.logInfo(`WebServer is now Online & Listening on port ${chalk.bold(webserver.Port || 80)}`)
        })
    }

    await axios({
        baseURL: "https://api.github.com",
        url: "repos/BrayanBot/BrayanBot/releases/latest",
        method: "GET"
    }).then(async ({ data }) => {
        if (data) {
            let { tag_name: tagName, target_commitish: repo } = data;
            if (!data.draft && repo == "main") {
                let newVersion = tagName.trim().replace(/^[=v]+/, '').split("."),
                    curVersion = packageJSON.version.split("."),
                    versions = [true, true, true]
                for (let i = 0; i < newVersion.length; i++)
                    if (newVersion[i] > curVersion[i]) versions[i] = false

                if (versions[0] == false) {
                    Utils.logWarning(`Du arbeitest mit einer älteren Version von ${chalk.bold("BrayanBot")}, Bitte aktualisieren Sie Ihren Bot, um ${chalk.bold("Major")} Änderungen zu übernehmen.`)
                } else if (versions[1] == false) {
                    Utils.logWarning(`Du arbeitest mit einer älteren Version von ${chalk.bold("BrayanBot")}, Bitte aktualisieren Sie Ihren Bot, um ${chalk.bold("Minor")} Änderungen zu übernehmen.`)
                } else if (versions[2] == false) {
                    Utils.logWarning(`Du arbeitest mit einer älteren Version von ${chalk.bold("BrayanBot")}, Bitte aktualisieren Sie Ihren Bot, um ${chalk.bold("Patch")} Änderungen zu übernehmen.`)
                } else if (versions[0] == true && versions[1] == true && versions[2] == true) {
                    Utils.logInfo(`Du arbeitest mit einer älteren Version von ${chalk.bold("BrayanBot")}!`)
                }
            }
        }
    }).catch(async (e) => {
        if (e.response && e.response.status == 404) {
            Utils.logWarning(`Die neuesten BrayanBot-Versionen können nicht abgerufen werden.`)
        } else if (e.response && e.response.data && e.response.data.message.includes("rate limit")) {
            Utils.logWarning("Überspringen der Github-Versionsprüfung aufgrund von Ratelimits.")
        } else {
            Utils.logError(`[Update-Checker] ${e}`)
        }
    })

    Status.addVariables("Core", [
        { searchFor: /{brand-name}/g, replaceWith: config.Branding.Name },
        { searchFor: /{brand-logo}/g, replaceWith: config.Branding.Logo },
        { searchFor: /{brand-link}/g, replaceWith: config.Branding.Link },
        ...Utils.botVariables(bot),
        ...Utils.guildVariables(bot.guilds.cache.first()),
        ...Utils.userVariables(Utils.parseUser(bot.guilds.cache.first().ownerId, bot.guilds.cache.first()), "guild-owner"),
    ])

    if (config.Status) Status.set(config.Status);

    await Utils.logInfo(`Logged in as: ${chalk.bold(bot.user.tag)}`);
        if (config.Settings.Verbose == true) {
            await Utils.logDebug(`Currently using ${chalk.bold(Utils.bytesToSize(fSize))} of storage`);
            if (fse.existsSync("./Addons")) {
                let files = fse.readdirSync("./Addons");
                Utils.logDebug(`${files.length} addons found.`);
            }
            else { // TODO: make this warning error specific
                Utils.logWarning(`Addon-Verzeichnis wurde nicht gefunden. Stelle sicher, dass der Bot Verzeichnisse erstellen oder auf das Addons-Verzeichnis zugreifen kann.`);
            }
        }
    bot.guilds.cache.size > 1
        ? Utils.logWarning(`Derzeit in ${chalk.bold(bot.guilds.cache.size)} servers. | ${chalk.hex("##ff596d")(`BrayanBot ist nicht für mehrere Server ausgelegt.`)}`)
        : Utils.logInfo(`Derzeit in ${chalk.bold(bot.guilds.cache.size)} server.`);
    await Utils.logInfo(`Bot Bereit!`);
};

module.exports.once = true;
