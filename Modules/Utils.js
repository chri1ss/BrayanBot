const Discord = require("discord.js"), chalk = require("chalk"),
    moment = require("moment"), axios = require("axios"),
    { client } = require("../index");

module.exports = {
    parseSlashCommands: require("./Utils/parseSlashCommand"),
    setupMessage: require("./Utils/setupMessage"),
    wait: require("util").promisify(setTimeout),
    database: require("./Handlers/Database"),
    builder: require("@discordjs/builders"),
    logWarning: (...text) => console.log(chalk.hex("#edd100").bold("[WARN] ") + text),
    logError: (...text) => console.log(chalk.hex("#ff0800").bold("[ERROR] ") + text),
    logInfo: (...text) => console.log(chalk.hex("#57ff6b").bold("[INFO] ") + text),
    logDebug: (...text) => console.log(chalk.hex("#ffff00").bold("[DEBUG] ") + text),
    /** @param {Array} array*/
    getRandom: (array) => {
        let random = Math.floor(Math.random() * array.length);
        return array[random];
    },
    /** @param {String} text @returns {String}*/
    formatFirstLetter: (text) => {
        return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
    },
    /**
     * @param {Discord.GuildMember} user
     * @param {String} prefix
     * @returns {String[]}
     */
    userVariables: (user, prefix) => {
        let returnObject = [];

        if (user) returnObject = [{
            searchFor: new RegExp(`{${prefix || "user"}-id}`, "g"),
            replaceWith: user.id,
        }, {
            searchFor: new RegExp(`{${prefix || "user"}-displayname}`, "g"),
            replaceWith: user.displayName,
        }, {
            searchFor: new RegExp(`{${prefix || "user"}-username}`, "g"),
            replaceWith: user.user.username,
        }, {
            searchFor: new RegExp(`{${prefix || "user"}-tag}`, "g"),
            replaceWith: user.user.tag,
        }, {
            searchFor: new RegExp(`{${prefix || "user"}-mention}`, "g"),
            replaceWith: "<@" + user.id + ">",
        }, {
            searchFor: new RegExp(`{${prefix || "user"}-pfp}`, "g"),
            replaceWith: user.user.displayAvatarURL({ dynamic: true }),
        }, {
            searchFor: new RegExp(`{${prefix || "user"}-createdate}`, "g"),
            replaceWith: `<t:${Math.floor(user.user.createdTimestamp / 1000)}:D>`,
        }, {
            searchFor: new RegExp(`{${prefix || "user"}-for}`, "g"),
            replaceWith: `<t:${Math.floor(user.user.createdTimestamp / 1000)}:R>`,
        }, {
            searchFor: new RegExp(`{${prefix || "user"}-badges}`, "g"),
            replaceWith: module.exports.getUserBadges(user).join(", "),
        }];

        if (!user) module.exports.logError(`[Utils] [userVariables] Ungültige Eingabe für ${chalk.bold("user")}.`);

        return returnObject;
    },
    /**
     * @param {Discord.GuildMember} member
     * @param {String} prefix
     * @returns {String[]}
     */
    memberVariables: (member, prefix) => {
        let returnObject = [];

        if (member) returnObject = [{
            searchFor: new RegExp(`{${prefix || "member"}-id}`, "g"),
            replaceWith: member.id,
        }, {
            searchFor: new RegExp(`{${prefix || "member"}-displayname}`, "g"),
            replaceWith: member.displayName,
        }, {
            searchFor: new RegExp(`{${prefix || "member"}-username}`, "g"),
            replaceWith: member.user.username,
        }, {
            searchFor: new RegExp(`{${prefix || "member"}-tag}`, "g"),
            replaceWith: member.user.tag,
        }, {
            searchFor: new RegExp(`{${prefix || "member"}-mention}`, "g"),
            replaceWith: "<@" + member.id + ">",
        }, {
            searchFor: new RegExp(`{${prefix || "member"}-pfp}`, "g"),
            replaceWith: member.displayAvatarURL({ dynamic: true }),
        }, {
            searchFor: new RegExp(`{${prefix || "member"}-createdate}`, "g"),
            replaceWith: `<t:${Math.floor(member.createdTimestamp / 1000)}:D>`,
        }, {
            searchFor: new RegExp(`{${prefix || "member"}-joindate}`, "g"),
            replaceWith: `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>`,
        }, {
            searchFor: new RegExp(`{${prefix || "member"}-for}`, "g"),
            replaceWith: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
        }, {
            searchFor: new RegExp(`{${prefix || "member"}-roles}`, "g"),
            replaceWith: member.roles.cache.filter(x => x.id != member.guild.roles.everyone.id).map((r) => `<@&${r.id}>`).join(", "),
        }];

        if (!member) module.exports.logError(`[Utils] [memberVariables] Ungültige Eingabe für ${chalk.bold("member")}.`);

        return returnObject;
    },
    /**
     * 
     * @param {Discord.Channel} channel 
     * @param {String} prefix 
     * @returns {Array<Object>}
    */
    channelVariables: (channel, prefix) => {
        let returnObject = [];

        if (channel) returnObject = [{
            searchFor: new RegExp(`{${prefix || "channel"}-id}`, "g"),
            replaceWith: channel.id,
        }, {
            searchFor: new RegExp(`{${prefix || "channel"}-name}`, "g"),
            replaceWith: channel.name,
        }, {
            searchFor: new RegExp(`{${prefix || "channel"}-mention}`, "g"),
            replaceWith: channel.toString(),
        }, {
            searchFor: new RegExp(`{${prefix || "channel"}-type}`, "g"),
            replaceWith: channel.type,
        }, {
            searchFor: new RegExp(`{${prefix || "channel"}-createdate}`, "g"),
            replaceWith: `<t:${Math.floor(channel.createdTimestamp / 1000)}:D>`,
        }]

        if (!channel) module.exports.logError(`[Utils] [channelVariables] Ungültige Eingabe für ${chalk.bold("channel")}.`);

        return returnObject;
    },
    /**
     * 
     * @param {Discord.Role} role 
     * @param {String} prefix 
     * @returns 
     */
    roleVariables: (role, prefix) => {
        let returnObject = [];

        if (role) returnObject = [{
            searchFor: new RegExp(`{${prefix || "role"}-id}`, "g"),
            replaceWith: role.id,
        }, {
            searchFor: new RegExp(`{${prefix || "role"}-name}`, "g"),
            replaceWith: role.name,
        }, {
            searchFor: new RegExp(`{${prefix || "role"}-mention}`, "g"),
            replaceWith: role.toString(),
        }, {
            searchFor: new RegExp(`{${prefix || "role"}-createdate}`, "g"),
            replaceWith: `<t:${Math.floor(role.createdTimestamp / 1000)}:D>`,
        }, {
            searchFor: new RegExp(`{${prefix || "role"}-color}`, "g"),
            replaceWith: role.color,
        }, {
            searchFor: new RegExp(`{${prefix || "role"}-hexColor}`, "g"),
            replaceWith: role.hexColor,
        }, {
            searchFor: new RegExp(`{${prefix || "role"}-position}`, "g"),
            replaceWith: role.rawPosition,
        }, {
            searchFor: new RegExp(`{${prefix || "role"}-icon}`, "g"),
            replaceWith: role.iconURL() || "https://cdn-icons-png.flaticon.com/512/2522/2522053.png",
        }]

        if (!role) module.exports.logError(`[Utils] [roleVariables] Ungültige Eingabe für ${chalk.bold("role")}.`);

        return returnObject;
    },
    /**
     * @param {Discord.Client} bot
     * @param {String} prefix
     * @returns {Object[]}
     */
    botVariables: (bot, prefix) => {
        let returnObject = [];

        if (bot) returnObject = [{
            searchFor: new RegExp(`{${prefix || "bot"}-id}`, "g"),
            replaceWith: bot.id,
        }, {
            searchFor: new RegExp(`{${prefix || "bot"}-displayname}`, "g"),
            replaceWith: bot.displayName,
        }, {
            searchFor: new RegExp(`{${prefix || "bot"}-username}`, "g"),
            replaceWith: bot.user.username,
        }, {
            searchFor: new RegExp(`{${prefix || "bot"}-tag}`, "g"),
            replaceWith: bot.user.tag,
        }, {
            searchFor: new RegExp(`{${prefix || "bot"}-mention}`, "g"),
            replaceWith: "<@" + bot.id + ">",
        }, {
            searchFor: new RegExp(`{${prefix || "bot"}-pfp}`, "g"),
            replaceWith: bot.user.displayAvatarURL({ dynamic: true }),
        }]

        if (!bot) module.exports.logError(`[Utils] [botVariables] Ungültige Eingabe für ${chalk.bold("bot")}.`);

        return returnObject;
    },
    /**
     * @param {Discord.Guild} guild 
     * @param {String} prefix 
     * @returns {Array}
     */
    guildVariables: (guild, prefix) => {
        if (!guild) {
            module.exports.logError(`[Utils] [guildVariables] Ungültige Eingabe für ${chalk.bold("guild")}.`);
            return [];
        } else return [{
            searchFor: new RegExp(`{${prefix || "guild"}-id}`, "g"),
            replaceWith: guild.id
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-name}`, "g"),
            replaceWith: guild.name,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-icon}`, "g"),
            replaceWith: guild.iconURL({ dynamic: true }),
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-boosts}`),
            replaceWith: guild.premiumSubscriptionCount == "NONE" ? 0 : guild.premiumSubscriptionCount,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-level}`),
            replaceWith: guild.premiumTier,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-max-members}`),
            replaceWith: guild.maximumMembers,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-createdate}`),
            replaceWith: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-online-members}`),
            replaceWith: guild.members.cache.filter((member) => member.presence && (member.presence.status !== "offline").size),
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-online-bots}`),
            replaceWith: guild.members.cache.filter((member) => member.presence && member.presence.status !== "offline" && member.user.bot).size,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-members}`),
            replaceWith: guild.members.cache.filter((m) => !m.user.bot).size,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-bots}`),
            replaceWith: guild.members.cache.filter((m) => m.user.bot).size,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-total-members}`),
            replaceWith: guild.memberCount,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-total-roles}`),
            replaceWith: guild.roles.cache.size,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-total-channels}`),
            replaceWith: guild.channels.cache.size,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-total-emojis}`),
            replaceWith: guild.emojis.cache.size,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-online-humans}`),
            replaceWith: guild.members.cache.filter((member) => member.presence && member.presence.status == "online" && !member.user.bot).size,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-idle-humans}`),
            replaceWith: guild.members.cache.filter((member) => member.presence && member.presence.status == "idle" && !member.user.bot).size,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-dnd-humans}`),
            replaceWith: guild.members.cache.filter((member) => member.presence && member.presence.status == "dnd" && !member.user.bot).size,
        }, {
            searchFor: new RegExp(`{${prefix || "guild"}-offline-humans}`),
            replaceWith: guild.members.cache.filter((member) => member.presence && member.presence.status == "offline" && !member.user.bot).size,
        },
        ]
    },
    /**
     * @param {String} name
     * @param {Discord.Guild} guild
     * @param {String} type
     * @param {Boolean} notify
     * @returns {Discord.Channel | void}
     */
    findChannel: (name, guild, type = "GUILD_TEXT", notify = true) => {
        if (!name) return module.exports.logError(`[Utils] [findChannel] Ungültige Eingabe für channel ${chalk.bold(name)}.`);
        if (!guild) return module.exports.logError(`[Utils] [findChannel] Ungültige Eingabe für ${chalk.bold("guild")}.`);
        if (typeof name == "bigint" || typeof name == "number") name = name.toString();

        let returnObject = false;
        const channel = guild.channels.cache.find((c) =>
            (c.name.toLowerCase() === name.toLowerCase() || c.id === name)
            && c.type.toLowerCase() === type.toLowerCase());

        if (channel) returnObject = channel;
        else if (notify && !channel) module.exports.logError(`[Utils] [findChannel] ${chalk.bold(name)} wurde nicht gefunden im ${chalk.bold(guild.name)} guild`);

        return returnObject;
    },
    /**
     * @param {String} name
     * @param {Discord.TextChannel} guild
     * @param {Boolean} notify
     * @returns {Discord.Role | void}
     */
    findRole: (name, guild, notify = true) => {
        if (!name) return module.exports.logError(`[Utils] [findRole] Ungültige Eingabe für Rollenname.`);
        if (!guild) return module.exports.logError(`[Utils] [findRole] Ungültige Eingabe für Gilde.`);
        if (typeof name == "bigint" || typeof name == "number") name = name.toString();

        let returnObject = false;
        const role = guild.roles.cache.find((r) =>
            r.name.toLowerCase() === name.toLowerCase()
            || r.id === name);

        if (role) returnObject = role;
        else if (notify) module.exports.logError(`[Utils] [findRole] ${chalk.bold(name)} rolle wurde nicht gefunden in ${chalk.bold(guild.name)} guild`);

        return returnObject;
    },
    /**
     * @param {String} name 
     * @param {Discord.Client} client 
     * @param {Boolean} notify
     * @returns {Discord.Guild | void}
     */
     findGuild: (name, client, notify = true) => {
        if (!name) return module.exports.logError(`[Utils] [findGuild] Ungültige Eingabe für Gildenname.`);
        if (!client) return module.exports.logError(`[Utils] [findGuild] Ungültige Eingabe für Client.`);
        if (typeof name == "bigint" || typeof name == "number") name = name.toString();

        let returnObject = false;
        const guild = client.guilds.cache.find((g) => g.name.toLowerCase() === name.toLowerCase() || g.id === name);

        if (guild) returnObject = guild;
        else if (notify) module.exports.logError(`[Utils] [findGuild] ${chalk.bold(name)} Gilde nicht gefunden.`);

        return returnObject;
    },
    /**
     * @param {Discord.GuildMember} member
     * @param {String | Array} name
     * @param {Boolean} notify
     * @returns {Boolean | void}
     */
    hasRole: (member, name, notify = true) => {
        if (!member) return module.exports.logError(`[Utils] [hasRole] Ungültige Eingabe für ${chalk.bold("member")}.`);
        if (!name) return module.exports.logError(`[Utils] [hasRole] Ungültige Eingabe für Rolle ${chalk.bold("name")}.`);
        if (typeof name == "bigint" || typeof name == "number") name = name.toString();

        let permissions = [];
        if (Array.isArray(name) && name[0]) {
            for (let index = 0; index < name.length; index++) {
                const role = module.exports.findRole(name[index], member.guild, notify)
                if (role) {
                    if (member.roles.cache.has(role.id)) permissions.push(true);
                    else permissions.push(false);
                } else permissions.push(false);
            }
        } else if (typeof name == "string") {
            let role = module.exports.findRole(name, member.guild, notify);
            if (role) {
                if (member.roles.cache.has(role.id)) permissions.push(true);
                else permissions.push(false);
            } else permissions.push(false);
        } else module.exports.logError(`[Utils] [hasRole] Ungültiger Typ der Eigenschaft ${chalk.bold("name")}.`);

        return permissions.includes(true);
    },
    /**
     * @param {String} argument
     * @param {Discord.Guild} guild
     * @returns {Discord.GuildMember | void}
     */
    parseUser: (argument, guild) => {
        if (!argument) return module.exports.logError(`[Utils] [parseUser] Ungültige Eingabe ${chalk.bold("argument")}.`);
        if (!guild) return module.exports.logError(`[Utils] [parseUser] Ungültige Eingabe für ${chalk.bold("guild")}.`);
        if (typeof argument == "bigint" || typeof argument == "number") argument = argument.toString();

        if (argument && guild) {
            argument = argument.replace(/([<@!]|[>])/g, "");
            const user = guild.members.cache.find((user) => {
                if (user.user.id.toLowerCase() === argument.toLowerCase()) return true;
                else if (user.user.username.toLowerCase() === argument.toLowerCase()) return true;
                else if (user.user.tag.toLowerCase() === argument.toLowerCase()) return true;
                else if (user.displayName && user.displayName.toLowerCase() === argument.toLowerCase()) return true;
            });

            if (user) return user;
            else return false;
        } else return false;
    },
    /**
     * @param {Discord.Message} message
     * @param {String} argument
     * @returns {Discord.GuildMember | void}
     */
    parseUserFromMessage: (message, argument, messageMember = true) => {
        if (!message) return module.exports.logError(`[Utils] [parseUserFromMessage] Ungültige Eingabe ${chalk.bold("message")}.`);
        if (!argument) return module.exports.logError(`[Utils] [parseUserFromMessage] Ungültige Eingabe ${chalk.bold("argument")}.`);
        if (typeof argument == "bigint" || typeof argument == "number") argument = argument.toString();

        if (messageMember) return (message.mentions.members.first() || module.exports.parseUser(argument, message.guild) || message.member);
        else return (message.mentions.members.first() || module.exports.parseUser(argument, message.guild));
    },
    /**
     * @param {Discord.GuildMember} member
     * @returns {Array | void}
     */
    getUserBadges: (member) => {
        if (!member)
            return module.exports.logError(`[Utils] [getUserBadges] Invalid input ${chalk.bold("member")}.`);

        const badges = {
            BUGHUNTER_LEVEL_1: "Discord Bug Hunter Level 1",
            BUGHUNTER_LEVEL_2: "Discord Bug Hunter Level 2",
            DISCORD_EMPLOYEE: "Discord Staff",
            DISCORD_NITRO: "Discord Nitro",
            EARLY_SUPPORTER: "Early Supporter",
            HOUSE_BALANCE: "HypeSquad Balance",
            HOUSE_BRAVERY: "HypeSquad Bravery",
            HOUSE_BRILLIANCE: "HypeSquad Brilliance",
            HYPESQUAD_EVENTS: "HypeSquad Events",
            EARLY_VERIFIED_BOT_DEVELOPER: "Early Verified Bot Developer",
            PARTNERED_SERVER_OWNER: "Partnered Server Owner",
            DISCORD_CERTIFIED_MODERATOR: "Discord Certified Moderator",
            VERIFIED_BOT: "Verified Bot",
            TEAM_USER: "Team User",
        }, data = [];

        member.user.flags.toArray().forEach((flag, i) =>
            badges[flag] ? data.push(badges[flag]) : false);

        return data;
    },
    /**
     * @param {Array} choices
     * @returns {Object | void}
     */
    parseSlashArgs: function (options) {
        let args = {};
        if (typeof options !== "object" && options.length <= 0)
            return module.exports.logError("[Utils] [parseSlashArgs] Es wurden ungültige Optionen angegeben.");

        options.forEach((opt) => {
            let { type, value, name } = opt;

            args[name] = { type };
            if (["STRING", "NUMBER", "INTEGER", "BOOLEAN"].includes(type)) {
                if (value) args[name].content = value;
            } else if (["CHANNEL"].includes(type)) {
                if (opt.channel) args[name].channel = opt.channel;
            } else if (["ROLE"].includes(type)) {
                if (opt.role) args[name].role;
            } else if (["USER"].includes(type)) {
                if (opt.user) args[name].user = opt.user;
                if (opt.member) args[name].member = opt.member;
            } else if (["MENTIONABLE".includes(type)]) {
                if (opt.user) args[name].user = opt.user;
                if (opt.member) args[name].member = opt.member;
                if (opt.role) args[name].role;
            } else return module.exports.logWarning("[Utils] [parseSlashArgs] Ungültige Auswahl Typ. Type: " + type);

        });
        return args;
    },
    paste: (data, url = "https://paste.zorino.in", extension, raw) => new Promise(async (resolve, reject) => {
        axios.post(`${url}/documents`, data).then(({ data }) => {
            if (raw) url += "/raw";
            if (extension) data.key += `.${extension}`;

            resolve(`${url}/${data.key}`);
        }).catch(reject)
    }),
    /** @param {Discord.Interaction} interaction */
    sendPing: async (interaction) => new Promise(async (resolve, reject) => {
        await interaction.client.api.interactions(interaction.id, interaction.token).callback.post({
            data: { type: 6 },
        }).then((res) => resolve(res)).catch((err) => {
            if (err.message === "Unbekannte Interaktion")
                resolve(undefined);
            else reject(err);
        });
    }),
    createMultipleConfigs: async (configs, addonName) => new Promise(async (resolve, reject) => {
        if (typeof configs !== "object" && Object.keys(configs).length <= 0) {
            module.exports.logError("[Utils] [createMultipleConfigs] Es wurden ungültige Configs bereitgestellt.");
            resolve({});
        }

        let addonConfigs = {}, configsEntries = Object.entries(configs),
            createCustomConfigs = require("./Utils/createCustomConfig");

        for (let index = 0; index < configsEntries.length; index++) {
            const addonConfig = configsEntries[index];
            let [name, configData] = addonConfig;
            addonConfigs[name] = await createCustomConfigs(addonName, name, configData);
        }
        resolve(addonConfigs);
    }),
    /**
     * @param {Array} array 
     * @param {Function} callback 
     */
    asyncForEach: async (array, callback) => {
        for (let index = 0; index < array.length; index++)
            await callback(array[index], index, array);
    },
    /**
     * @param {Number} bytes 
     * @param {String} seperator 
     * @returns {String}
     */
    bytesToSize: (bytes, seperator = " ") => {
        // Dieser Code wurde nicht von Mitarbeitern von BrayanBot geschrieben.
        // Dieser Code wurde von github gist genommen
        // -> https://gist.github.com/lanqy/5193417?permalink_comment_id=2793883#gistcomment-2793883
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

        if (bytes === 0) return 'N/A';
        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
        if (i === 0) return `${bytes}${seperator}${sizes[i]}`;
        return `${(bytes / (1024 ** i)).toFixed(1)}${seperator}${sizes[i]}`;
    }
};
