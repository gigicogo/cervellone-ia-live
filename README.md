# Il Cervellone IA LIVE — Comune di Genova

Quiz multiplayer per concludere il percorso di sei giornate sull'IA nella Pubblica Amministrazione. La sfida riprende 42 domande originali, sette categorie, classifica individuale e autovalutazione finale.

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
