# CarService

CarService ist eine lokale Android-App für Wartung, Service, HU/TÜV und Fahrzeughistorie. Das Design und das Offline-WebView-Prinzip orientieren sich am bestehenden Haushaltsbuch-Projekt.

## Enthaltene Fahrzeuge

- Peugeot 508 SW I, 2.0 HDi 163 PS, Baujahr 2012
- Peugeot 2008 I, 1.6 BlueHDi 120 PS, Baujahr 2016

## Funktionen

- Wartungsübersicht mit Status **fällig / bald / okay / offen**
- Berechnung nach Kilometerstand und Datum – es zählt der zuerst erreichte Grenzwert
- Service-Historie mit Datum, Kilometerstand, Kosten und Notizen
- HU/AU (TÜV) mit frei eintragbarem nächsten Termin; nach eingetragener HU wird automatisch +24 Monate berechnet
- Schnelländerung des Kilometerstands
- Wartungsprofile für normale bzw. erschwerte Nutzung beim 2008
- Zwei auswählbare 2012er Wartungsprofile beim 508
- Eigene Wartungspunkte mit km- und/oder Monatsintervall
- Hell-, Dunkel- und Systemdarstellung
- lokale Datenspeicherung ohne Server oder Konto
- Backup und Wiederherstellung über JSON-Text

## Peugeot 2008 BlueHDi 120

Die hinterlegten Intervalle basieren auf dem fahrzeugspezifischen Peugeot-Wartungsplan. Unter normalen Bedingungen sind unter anderem 25.000 km / 1 Jahr für die Inspektion sowie 175.000 km / 10 Jahre für Zahnriemen + Wasserpumpe vorgesehen. Für erschwerte Nutzung ist ein eigenes Profil hinterlegt.

Quelle: https://www.forum-peugeot.com/wp-content/uploads/2016/06/planentretien2008bluehdi120.pdf

## Peugeot 508 2.0 HDi 163

Bei Fahrzeugen aus 2012 kann der Wartungsplan vom Produktionsdatum abhängen. Deshalb bietet die App ein frühes und ein spätes 2012-Profil. Das richtige Profil sollte anhand von VIN/ORGA, Serviceheft oder Peugeot-Wartungsplan bestätigt werden. Punkte, deren exaktes Intervall fahrzeugspezifisch sein kann, werden bewusst als manuelle Kontrolle geführt.

## HU / TÜV

Für normale Pkw gilt in Deutschland nach der ersten HU grundsätzlich ein 24-Monats-Rhythmus. In der App wird bei diesen bereits älteren Fahrzeugen der aktuell gültige HU-Termin manuell eingetragen; nach einer als erledigt gespeicherten HU wird der Folgetermin automatisch 24 Monate später gesetzt.

Rechtsgrundlage: https://www.gesetze-im-internet.de/stvzo_2012/anlage_viii.html

## Entwicklung

Die App besteht aus einer lokalen HTML/CSS/JavaScript-Oberfläche in `app/src/main/assets/index.html` und einer kleinen nativen Android-WebView-Hülle.

### APK bauen

GitHub Actions baut bei jedem Push auf `main` automatisch eine installierbare Debug-APK und stellt sie als Artifact `CarService` bereit. Falls im Repository das Secret `DEBUG_KEYSTORE_BASE64` hinterlegt wird, verwendet der Workflow dieses feste Debug-Keystore für updatefähige Builds; ohne Secret wird die normale temporäre Debug-Signatur verwendet.

> Hinweis: CarService ist eine Erinnerungs- und Dokumentationshilfe. Maßgeblich bleiben immer der fahrzeugspezifische Hersteller-Wartungsplan, die VIN/Produktionsdaten und Werkstatthinweise.
