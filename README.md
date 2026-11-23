# Il Cervellone IA LIVE — Comune di Genova

Quiz multiplayer per concludere il percorso di sei giornate sull'IA nella Pubblica Amministrazione. La sfida riprende 42 domande originali, sette categorie, classifica individuale e autovalutazione finale.

## Pubblicazione su GitHub Pages

1. Prima completa l'aggiornamento di Cloudflare Worker + D1 con lo ZIP **cervellone-ia-live-cloudflare.zip**.
2. Crea un repository GitHub (oppure sostituisci i file della precedente versione del Cervellone).
3. Carica `index.html`, `style.css` e `app.js` **nella radice** del repository, non in una sottocartella.
4. Apri **Settings → Pages → Build and deployment → Deploy from a branch**, seleziona `main` e `/(root)`, poi **Save**.
5. Il sito sarà accessibile da `https://TUO-NOME.github.io/NOME-REPOSITORY/`.

Il frontend è **già collegato** all'API:
`https://cervellone-ia-api.gigi-cogo.workers.dev`

Se il nome del Worker cambia, modifica la prima riga di `app.js` (variabile `API`).

## In aula remota

- Il formatore apre GitHub Pages e sceglie **Crea una partita**. Il sito genera una stanza di 6 caratteri.
- Condivide il link attraverso la videoconferenza oppure comunica il codice stanza.
- Ogni partecipante entra con un **nickname**, senza account.
- Il formatore attende gli ingressi, poi avvia la partita e condivide eventualmente la schermata della **regia**.
- Tutti ricevono la **stessa domanda**, rispondono indipendentemente e vedono la classifica comune.
- Scaduti i secondi scelti, il sistema mostra risposta corretta e spiegazione. Il formatore commenta e clicca **Prossima domanda**.
- Alla fine ciascuno ottiene il proprio riepilogo per categoria, scaricabile in CSV.

Il formato consigliato è 21 domande, 30 secondi ciascuna, con circa 22 partecipanti. Il tempo effettivo dipende dai commenti del formatore.

## Punti

- Corretta: **100 punti**.
- Bonus rapidità: **50 punti** se la risposta arriva prima di metà del tempo disponibile.
- Errata o mancante: **0 punti**.
- Il server accetta una risposta per domanda e per partecipante. Non è possibile inviare punti autonomamente.
- Le domande sono selezionate e bilanciate automaticamente sulle sette categorie a ogni partita.

## Privacy e limitazioni

La classifica mostra i **nickname** di tutti. Non richiedere nomi reali né dati personali. I nickname, le risposte e i punteggi sono conservati in Cloudflare D1 fino alla cancellazione dei dati da parte del gestore. Non è prevista una scadenza o cancellazione automatica. Per eliminare una partita il gestore può cancellarne i dati in D1, rispettando le relazioni tra le tabelle.

L'accesso del formatore usa un token segreto salvato nel browser. **Non condividere il token**. Se cambi dispositivo o cancelli la memoria del browser, potresti non riuscire a riprendere la regia della partita precedente: crea una nuova sessione. I giocatori possono ricaricare la pagina mantenendo il token locale.

Per contenere i costi l'app interroga il Worker ogni 2,6 secondi circa. Non usa WebSocket né servizi di intelligenza artificiale. Durante la partita è necessaria una connessione Internet.

Questo è un gioco di ripasso e non una prova certificativa. Le domande e la loro valutazione sono preconfigurate.

## File

- `index.html` — interfaccia italiana per formatore e partecipanti.
- `style.css` — grafica responsive blu, ciano e arancione.
- `app.js` — logica client e collegamento Cloudflare.

© Materiale didattico · Comune di Genova · Novembre 2026
