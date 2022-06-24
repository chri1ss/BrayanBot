#!/bin/bash

clear >$(tty)

# Prüfen Sie, ob das Skript als root ausgeführt wird. Wenn ja, verwerfen Sie es.
if [ "$EUID" -e 0 ]; then
	echo -e "\e[31m - Bitte führen Sie dieses Skript nicht als root aus.\e[0m"
	exit 3
fi

echo "Installation von BrayanBot für Linux..."


npm install @tycrek/log fs-extra prompt js-yaml
# Stellen Sie sicher, dass ./Modules, ./Commands und . /Events vorhanden sind.
mkdir -p ./Modules
mkdir -p ./Commands
mkdir -p ./Events
mkdir -p ./Addons
mkdir -p ./Addon_Configs


# Sicherstellen, dass config.yml, lang.yml und commands.yml vorhanden sind
for value in config.yml lang.yml commands.yml
do
	if [ ! -f $value ]; then
		touch $value
	fi
done

# Auf eine Bestätigung warten
echo "Dieses Skript wird docker-compose ausführen. Möchten Sie fortfahren? (Drücken Sie CTRL+C, um fortzufahren)"
read -n 1 -s -r -p "Drücken Sie eine beliebige Taste, um fortzufahren..."

echo Einrichten...

# Baut den Container (gemäß Dockerfile) und startet den Container
docker-compose up -d && \

# Setup innerhalb des Containers ausführen
docker-compose exec brayanbot npm run setup && \

# Nach Abschluss den Container neu starten
docker-compose restart && \

# Done!
echo "BrayanBot ist jetzt für Linux installiert."
echo "Führen Sie Folgendes aus, um die Protokolle anzuzeigen:"
echo "$ docker-compose logs -f --tail=50 --no-log-prefix brayanbot"
