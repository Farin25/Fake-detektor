# Fake-detektor - A website for detecting fake news

## Wie Funktioniert der Fake detector?

Die Logik der Webseite ist ein Algorithmus der Den Eingegebenen Text nach auffäligkeiten Prüft zum Beispiel wird geprüft ob der Text auffäligkeiten aufzeigt wie zum Beispiel auffälige wörter wie: "Glauben" oder: "Schockieren / Schock". Außer dem wird der ganze Text auf Groß und klein schreibung geprüft, nur groß geschrieben Wörter sind auch sehr auffällig. Was auch auffälig ist sind viele Ausrufezeichen. Der Algorithmus prüft auch ob eine Qelle Angegeben ist oder nicht. Dann wird noch Geprüft ob zum Teilen Aufgerufen wird oder sich widersprechende Fakten im Text sind. Aber es werden auch auffälig keiten Geprüft die darauf hinweisen das der Text Echt und vertrauenswürdig ist wenn der geneteil der fall ist wie von den Anzeichen für Fake.
<br>
<br>
<br>
Beim berechen ist der Grundaufbau 50/50 und pro endektes Kreterium für Fake wird Fake halt erhöt und bei Echt wird der Real-Score erhöth. Was wie ins Gewicht fällt ist unten in der Tabelle zu sehen.
<br><br>

### Folgende Sachen Werden Geprüft:
| **Ausgabe** | **Auslöser** | **+ -** |
|-------------|--------------|---------|
| Auffälige Überschrift/Wörter : | krass, unglaublich, kaum zu glauben, sprachlos, |
| Zahlen/ Daten erkannt | Zahlen nummern und devinirte Werte |
| Hinweis auf Qellen | "quelle", "laut", "studie", "bericht", "statistik", "bundesamt", "institut", "universität", "forscher", "wissenschaftler", "daten von", "zitiert", "berichtete", "faktencheck", "dpa", "reuters", "ap news" |
| Sehr kurtzer Text | Unter 25 Wörtern |
| Vage oder unkonkrete Quellenangaben gefunde | "man sagt", "angeblich", "gerüchten zufolge", "ich habe gehört", "es heißt", "viele sagen" |
| Stark Feindbildige Sprache | "die da oben", "elite", "volk", "verraten", "verrat", "betrügen", "marionetten", "system", "schuld", "volksverräter", "böse", "feind" |
| Viele Ausrufezeichen | mehr als drei Ausrufezeichen |
| Reißerische / emotionale Sprache erkannt |  "skandal", "lüge", "lügenpresse", "unglaublich", "schockierend", "schock!", "hammer", "eskaliert", "endzeit", "katastrophe", "geheimnis", "verschwörung", "propaganda", "systemmedien", "was dir niemand sagt", "die wahrheit über", "wird dir nicht gefallen", "muss man gesehen haben", "für immer verändern" |
| "Es wurden Links / URLs gefunden – das kann auf Weiterführende Quellen hinweisen. | Links im Text |
| Wenig bis keine Ausrufezeichen und kaum Großschreibung | Wenig bis keine Ausrufezeichen und kaum Großschreibung
| Relativ langer Text | Relativ langer Text|
| Kombinationen wie „?!“ endeckt| Kombinationen mit ? und ! also:"!?" oder:"?!" |

### Changelog

## V1.4       
**7.01.2026**  
- Jahr im Footer Aktualliesiert zu 2026.
- Link auf der Beispieltext seite korrigiert.
- About Seite Angefangen

### Geplante Erweiterungen / Verbesserungen

- About Site

- funktion zum uploden eines Screenshots oder Fotos von einem Artikel oder Text.

- Link eingabe für die eingabe von einem Link zu einem Artikel oder Socialmedia post.

- Serverseitige version bauen die Serverseitig läuft für eine einfachere verwaltung und handhabung der Kretterien usw.

- Integration eines Ki Modells für eine Analyse über eine KI. evt. gmma 3.

- EN Version.


#### Copyright (C) 2026 of Liam and Farin 

## Star History

<a href="https://www.star-history.com/#Farin25/FakeNews-detector&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Farin25/FakeNews-detector&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Farin25/FakeNews-detector&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Farin25/FakeNews-detector&type=date&legend=top-left" />
 </picture>
</a>


#### Copyright (C) 2025 of Liam and Farin 
 - Distributed under the terms of the GNU General Public License v3.0

