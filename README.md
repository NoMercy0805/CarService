# CarService

CarService ist eine lokale Android-App für Wartung, Service, HU/TÜV und Fahrzeughistorie. Die App läuft offline und speichert ihre Daten lokal auf dem Gerät.

## Enthaltene Fahrzeuge

- **Peugeot 508 SW I, 2.0 HDi, 163 PS / 120 kW, Baujahr 2012** — HSN/TSN **3003/AOK**
- **Peugeot 2008 I, 1.6 BlueHDi, 120 PS / 88 kW, Baujahr 2016** — HSN/TSN **3003/AUH**

Die feste Zuordnung der Fahrzeugtypen zu den erlaubten Wartungsprofilen ist zusätzlich in `vehicle-identification.json` dokumentiert.

## Funktionen

- Wartungsübersicht mit Status **fällig / bald / okay / offen**
- Berechnung nach Kilometerstand und Datum – es zählt der zuerst erreichte Grenzwert
- Service-Historie mit Datum, Kilometerstand, Kosten und Notizen
- HU/AU (TÜV) mit frei eintragbarem nächsten Termin; nach eingetragener HU wird automatisch +24 Monate berechnet
- Schnelländerung des Kilometerstands
- Fahrzeugdaten mit HSN/TSN, Kennzeichen, FIN/VIN, Erstzulassung und HU-Termin
- Kompakte Startseitenkarte **Als Nächstes fällig**
- Peugeot-orientierte **Service-Checkliste** mit Grundservice, Sicht-/Funktionskontrollen und automatisch fälligen Zusatzarbeiten
- Wartungsprofile für normale bzw. erschwerte Nutzung beim 2008
- Zwei Wartungspläne nach 508-Produktionszeitraum (bis 30.06.2012 / ab 01.07.2012)
- Eigene Wartungspunkte mit km- und/oder Monatsintervall
- Hell-, Dunkel- und Systemdarstellung
- lokale Datenspeicherung ohne Server oder Konto
- Backup und Wiederherstellung über JSON-Text

## Service-Checkliste

Die Service-Checkliste orientiert sich am veröffentlichten Peugeot-Serviceumfang: Fahrzeugprüfung, Flüssigkeitskontrolle/-ergänzung, Motoröl- und Ölfilterwechsel, Diagnose sowie Sicherheits-/Umweltkontrollen. Fällige Zusatzarbeiten werden aus dem jeweiligen Wartungsplan automatisch ergänzt. Die exakte VIN-spezifische Arbeitsliste kann in Peugeot Service Box abweichen.

Quellen:
- https://www.peugeot.co.uk/owners/assistance-and-warranty/service-contracts-and-warranty-extensions.html
- https://public.servicebox.peugeot.com/aides/DOC_OI/AP/documents/de_DE/AIDE/9941/plan_entretien_apoi.html?id=sous_menu2%7C2_12

## Peugeot 2008 BlueHDi 120 — 3003/AUH

Die hinterlegten Intervalle basieren auf dem fahrzeugspezifischen Peugeot-Wartungsplan. Unter normalen Bedingungen sind unter anderem 25.000 km / 1 Jahr für die Inspektion sowie 175.000 km / 10 Jahre für Zahnriemen + Wasserpumpe vorgesehen. Für erschwerte Nutzung ist ein eigenes Profil hinterlegt.

Quelle: https://www.forum-peugeot.com/wp-content/uploads/2016/06/planentretien2008bluehdi120.pdf

## Peugeot 508 SW 2.0 HDi 163 — 3003/AOK

HSN/TSN bestätigen den Fahrzeugtyp Peugeot 508 SW 2.0 HDi mit 120 kW. Bei Fahrzeugen aus 2012 kann der Wartungsplan trotzdem vom Produktionsdatum abhängen. Deshalb unterscheidet die App zwischen Produktion bis 30.06.2012 (OPR/DAM bis 13018) und Produktion ab 01.07.2012 (OPR/DAM ab 13019). Das richtige Profil sollte anhand von Produktionsdatum/ORGA, Serviceheft oder Peugeot-Wartungsplan bestätigt werden. Die HSN/TSN allein unterscheidet diese beiden 2012-Varianten nicht.

## Profil-Zuordnung

Die App trennt die Wartungsprofile fest nach Fahrzeug:

- 508 / 3003-AOK: nur `508_early` oder `508_late`
- 2008 / 3003-AUH: nur `2008_normal` oder `2008_severe`

Damit können die 508- und 2008-Pläne in der Oberfläche nicht gegeneinander ausgewählt werden.

## HU / TÜV

Für normale Pkw gilt in Deutschland nach der ersten HU grundsätzlich ein 24-Monats-Rhythmus. In der App wird bei diesen bereits älteren Fahrzeugen der aktuell gültige HU-Termin manuell eingetragen; nach einer als erledigt gespeicherten HU wird der Folgetermin automatisch 24 Monate später gesetzt.

Rechtsgrundlage: https://www.gesetze-im-internet.de/stvzo_2012/anlage_viii.html

## Entwicklung und signierte APK

Die App besteht aus einer lokalen HTML/CSS/JavaScript-Oberfläche in `app/src/main/assets/index.html` und einer kleinen nativen Android-WebView-Hülle.

GitHub Actions baut die installierbare APK direkt **in diesem CarService-Repository**. Für updatefähige Builds wird ausschließlich der feste Keystore aus dem Repository-Secret `DEBUG_KEYSTORE_BASE64` verwendet. Der Workflow prüft vor dem Signieren den erwarteten SHA-1-Fingerabdruck und veröffentlicht die fertige APK anschließend im Release `carservice-latest` als `CarService.apk`.

Der feste Signier-Fingerabdruck lautet:

`90:D7:94:A6:9C:A8:58:88:15:18:3E:FA:11:12:02:D6:54:A9:21:8C`

Ohne das Secret `DEBUG_KEYSTORE_BASE64` bricht der signierte Build bewusst ab, damit niemals versehentlich eine APK mit einem anderen Schlüssel veröffentlicht wird.

> Hinweis: CarService ist eine Erinnerungs- und Dokumentationshilfe. Maßgeblich bleiben immer der fahrzeugspezifische Hersteller-Wartungsplan, Produktionsdaten/VIN und Werkstatthinweise.
