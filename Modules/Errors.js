const fs = require('fs'),
    chalk = require("chalk"),
    consoleIgnore = [
        "DiscordAPIError: Unbekannte Rolle",
        "DiscordAPIError: Unbekanntes Mitglied",
        "DiscordAPIError: Unbekannte Nachricht",
        "DiscordAPIError: Unbekannter Kanal"
    ],
    knownErrors = [
        "Error: ENOENT: keine solche Datei oder Verzeichnis, öffne 'config.yml'",
        "Error [TOKEN_INVALID]: Es wurde ein ungültiges Token angegeben."
    ]
let log = {
    errorStart: chalk.hex("#ff5e5e").bold("\n[ERROR START]"),
    errorEnd: chalk.hex("#ff5e5e").bold("\n[ERROR END]"),
    warn: chalk.hex("#ffa040").bold("[WARNING]"),
}
module.exports = (shortError, fullError = "") => {
    function sendMessage() {
        if (shortError.includes(`config.yml`)) return console.log(log.warn, `Die Datei config.yml konnte nicht gefunden werden. Bitte folgen Sie unserer Installationsanleitung! https://brayanbot.dev/docs/setup/hosting/windows`)
        if (shortError.includes(`TOKEN_INVALID`)) return console.log(log.warn, `Ihr Bot-Token ist falsch. Bitte aktualisieren Sie in der config.yml`)

    }
    if (!shortError) return;
    if (typeof shortError !== "string") shortError = shortError.toString();
    if (!consoleIgnore.includes(shortError)) {
        if (process.argv.slice(2).includes("--show-errors")) console.log(`${log.errorStart} ${shortError}\n${fullError} ${log.errorEnd}`)
        else if (knownErrors.includes(shortError)) return sendMessage()
        else console.log(`${log.warn} ${shortError}`);
    }

    return;
}
