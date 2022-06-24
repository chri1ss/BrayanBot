// Default configuration
const config =
{
	"Settings": {
	  "Token": "BOT-TOKEN",
	  "Prefix": "-",
	  "Storage": "database.db",
	  "DevMode": false
	},
	"Embeds": {
	  "Color": "2f3136"
	},
	"Branding": {
	  "Name": "BrayanBot",
	  "Logo": "https://avatars.githubusercontent.com/u/99198112?s=200&v=4",
	  "Link": "https://brayanbot.dev"
	}
  }


function getConfirmSchema(description) {
	return {
		properties: {
			confirm: {
				description,
				"type": 'string',
				"pattern": /^[y|n]/gim,
				"message": 'Sie müssen entweder mit \'y\' oder \'n\' antworten',
				"required": true,
				"before": (value) => value.toLowerCase().startsWith('y')
			}
		}
	};
}

// Bei direktem Aufruf in der Kommandozeile, Setup-Skript ausführen
function doSetup() {
	const path = (...paths) => require('path').join(process.cwd(), ...paths);
	const TLog = require('@tycrek/log');
	const fsExtra = require('fs-extra');
	const prompt = require('prompt');

	const log = new TLog({ level: 'debug', timestamp: { enabled: false } });

	// Override default configs with existing configs to allow migrating configs
	// Disabled for now. Wİll find a better way to do it.
	// try {
	//	const existingConfig = require('../config.json');
	//	Object.entries(existingConfig).forEach(([key, value]) => {
	//		Object.prototype.hasOwnProperty.call(config, key) && (config[key] = value); // skipcq: JS-0093
	//	});
	//} catch (ex) {
	//	if (ex.code !== 'MODULE_NOT_FOUND' && !ex.toString().includes('Unexpected end')) log.error(ex);
	//}

	// Deaktiviert das lästige "prompt: " Präfix und entfernt Farben
	prompt.message = '';
	prompt.colors = false;
	prompt.start();

	// Schema für die config installation
	const setupSchema = {
		properties: {
			botToken: {
				description: 'Dein Discord Bot Token',
				type: 'string',
				default: config.Settings.Token,
				required: true,
				message: 'Du musst ein gültiges Bot-Token eingeben'
			},
			prefix: {
				description: 'Dein Bot-Präfix',
				type: 'string',
				default: config.Settings.Prefix,
				//	pattern: /^[-_!]$/gim, // regex to limit prefix options
				//	message: 'Must be a - , _ , or !'
				required: false,
			},
			storage: {
				description: `Name der Ablage-Datei. (Beispiel: ${config.Settings.Storage})`,
				type: 'string',
				default: config.Settings.Storage,
				// pattern: ^.*\.(db)$,
				require: false,
			},
			brandName: {
				description: `Ihr Markenname/Servername verwendet von {brand-name} variable(in embeds). (Beispiel: ${config.Branding.Name})`,
				type: 'string',
				default: config.Branding.Name,
				required: false
			},
			brandlogo: {
				description: `Ihr Marken-/Serverlogo wird verwendet von {brand-logo} variable(in embeds). (Beispiel: ${config.Branding.Logo})`,
				type: 'string',
				default: config.Branding.Logo,
				required: false
			},
			brandlink: {
				description: `Ihr Marken-/Serverlink wird verwendet von {brand-link} variable(in embeds). (Beispiel: ${config.Branding.Link})`,
				type: 'string',
				default: config.Branding.Link,
				required: false
			},
			color: {
				description: `Farbe für Ihre Einbettungen (Beispiel: ${config.Embeds.Color})`,
				type: 'string',
				default: config.Embeds.Color,
				required: false
			}
		}
	};

	// Schema für die Sicherheitsabfrage. Der Benutzer muss "y" oder "n" eingeben (Groß- und Kleinschreibung wird nicht berücksichtigt)
	const confirmPrompt = getConfirmSchema('\nSind die oben genannten Informationen korrekt? (y/n)');

	log.blank().blank().blank().blank()
		.info('[=== BrayanBot Setup ===]').blank();
	let results = {};
	prompt.get(setupSchema)
		.then((r) => results = r) // skipcq: JS-0086

		// Prüfen Sie, ob die Informationen korrekt sind.
		.then(() => log
			.blank()
			.info('Bitte überprüfen Sie Ihre Angaben', '\n'.concat(Object.entries(results).map(([setting, value]) => `${'            '}${log.chalk.dim.gray('-->')} ${log.chalk.bold.white(`${setting}:`)} ${log.chalk.white(value)}`).join('\n')))
			.blank())

		// Bestätigen
		.then(() => prompt.get(confirmPrompt))
		.then(({ confirm }) => (confirm ? fsExtra.writeJson(path('config.json'), results, { spaces: 4 }) : log.error('Setup abgebrochen').callback(process.exit, 1)))

		// config.json in config.yml umwandeln, bestätigen und beenden
		.then(() => {
		const { promises: fs } = require("fs")
		const yaml = require('js-yaml');
		(async function main() {

			try {

				let configJson = await fs.readFile("./install/config.json", "utf-8")
				let doc = yaml.load(configJson)
				let configYaml = yaml.dump(doc)
				await fs.writeFile("./config.yaml", configYaml, "utf-8")
				.then(() => log.blank().success('Setup komplett').callback(() => process.exit(0)))
				.catch((err) => log.blank().error(err).callback(() => process.exit(1)))
			} catch (error) {
				console.log(error)
			}
		})();
	})
}

module.exports = {
	doSetup,
	config
};

// Bei einem Aufruf über die Befehlszeile wird das Setup ausgeführt.
// Auf diese Weise wird sichergestellt, dass das Setup nicht ausgeführt wird, wenn es von einer anderen Datei importiert wird
if (require.main === module) {
	doSetup();
}
