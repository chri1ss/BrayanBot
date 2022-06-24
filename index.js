const installNodeModules = async () => new Promise(async (resolve, reject) => {
    if (!process.argv.includes("--no-install")) {
        const showOutput = process.argv.includes("--show-install-output"),
            package = require("./package.json"),
            { spawn } = require("child_process"),
            modules = [
                ...Object.keys(package.dependencies),
                ...Object.keys(package.optionalDependencies)
            ];

        console.log(`\x1b[34m[Module Installer]`, `\x1b[37mInstalling ${`\x1b[1m${modules.length}\x1b[0m`}\x1b[37m modules, Bitte warten Sie, während wir die Module installieren. Dies kann ein paar Minuten dauern.`);
        let data = spawn(process.platform == "win32" ? "npm.cmd" : "npm", ["install", ...modules]);
        data.stdout.on("data", (data) => {
            showOutput ? console.log(`\x1b[34m[Module Installer: stdout]\x1b[0m`, data.toString().trim()) : "";
        })
        data.stderr.on("data", (data) => {
            showOutput ? console.log(`\x1b[34m[Module Installer: stderr]\x1b[0m`, data.toString().trim()) : ""
        })
        data.on("exit", (code) => {
            console.log(`\x1b[34m[Module Installer]`, `\x1b[37m${`\x1b[1m${modules.length}\x1b[0m`}\x1b[37m wurden installiert. `);
            resolve(code);
        })
    } else resolve();
})

installNodeModules().then(async () => {
    if (!process.argv.includes("--no-install")) {
        try {
            require.resolve("console-stamp");
        } catch (e) {
            if (require("fs").existsSync("node_modules")) {
                console.log(`\x1b[34m[Module Installer]`, `\x1b[37mModule installiert, bitte starten Sie den Bot neu.`);
                process.exit(0);
            } else {
                console.log(`\x1b[34m[Module Installer]`, `\x1b[37mEs sind keine Module installiert.`);
                process.exit(0);
            }
        }
    }
    require("console-stamp")(console, { format: ":date(HH:MM:ss).bold.grey" });
    const Utils = require("./Modules/Utils")
    if (process.versions.node < 16.6)
        return Utils.logError(`BrayanBot Requires Node.js version 16.6.0 or Higher.`);

    const fs = require("fs"), YAML = require("yaml"),
        Discord = require("discord.js"),
        client = new Discord.Client({
            intents: Object.keys(Discord.Intents.FLAGS).map(x => Discord.Intents.FLAGS[x])
        });

    module.exports["client"] = client;
    ["config.yml", "commands.yml", "lang.yml", "WebServer/webserver.yml"].forEach((x) => module.exports[x.replace(".yml", "").replace("WebServer/", "")] = YAML.parse(fs.readFileSync(x, "utf-8"), { prettyErrors: true }));
    ["config", "lang", "commands", "webserver"].forEach((x) => (client[x] = module.exports[x]));
    ["Events", "SlashCmds", "SlashCmdsData"].forEach((x) => (client[x] = []));
    ["Commands", "Aliases", "Routes", "StatusVariables"].forEach((x) => (client[x] = new Discord.Collection()));

    let handlers = ["ErrorHandler.js", "EventHandler.js", "Database.js" ,"CommandHandler.js", "AddonHandler.js", "ExpressHandler.js"];
    for (let index = 0; index < handlers.length; index++)
        await require(`./Modules/Handlers/${handlers[index]}`).init()

    if (client.config.Settings.Token)
        client.login(client.config.Settings.Token);
    else return Utils.logError("Es wurde ein ungültiges Token angegeben.");
});
