# Obiettivo
Implementare una CLI in TypeScript che genera un racconto breve (max 5 capitoli) tramite LLM usando il Vercel AI SDK e il provider Ollama (Gemma), con possibilità di sostituire il modello per singolo step. Tutta la persistenza è in memoria (nessun DB). Output finale in un singolo file `story.md`.


# Requisiti Funzionali
1. **Pipeline step-by-step** con salvataggio progressivo in `context`:
- (1) Genera 5 idee di racconto con: id, title, premise, mainCharacters[], setting.
- (2) L'utente sceglie un'idea via CLI.
- (3) Genera outline: title, chapters[] (number, title, summary). Rispetta max capitoli.
- (4) Genera profili personaggi: name, role, description, relations[{type, with}].
- (5) Genera ambientazioni principali: name, description.
- (6) Per ogni capitolo genera 2-4 scene: number, title, summary. (Doppio loop: capitoli → scene)
- (7) Per ogni scena espandi in prosa il testo completo, usando come contesto il riassunto del capitolo e i riassunti delle scene precedenti del capitolo.
- (8) Esporta `story.md` concatenando capitoli e scene in ordine.


2. **CLI Interattiva** (inquirer):
- Input dei parametri globali: genre, tone, rating (PG/16/18), style, maxChapters.
- Scelta dell'idea (lista delle 5 generate).
- Opzione (facoltativa) per modificare i modelli per step (es. `ollama:gemma:2b`).


3. **Contesto riutilizzato**: ogni step legge i dati dal `context` globale e salva il proprio output nuovamente in `context`.


# Requisiti Tecnici
- Linguaggio: **TypeScript**.
- Esecuzione: **tsx** (`npm run dev` → `tsx src/index.ts`).
- LLM SDK: **Vercel AI SDK** `generateObject()` per ricevere JSON già validato.
- Provider: **Ollama** via `ollama-ai-provider-v2` (host di default `http://localhost:11434`, configurabile via `OLLAMA_HOST`).
- Validazione: **zod** per definire e validare gli schema degli output.
- Output: file unico **Markdown** `story.md` con Titolo, Capitoli e Scene.


# Modelli e Configurazione
- Mappatura modelli per step: `{ ideas, outline, characters, settings, chapters, scenes }`.
- Stringa modello nel formato `provider:modelName` (es. `ollama:gemma:2b`).
- Possibilità di override via variabili d'ambiente `MODEL_*` o via CLI.


# Struttura del Progetto
```
src/
index.ts # CLI interattiva (inquirer)
pipeline.ts # orchestrazione step, context in-memory, doppio loop capitoli→scene
prompts.ts # builder dei prompt
ai.ts # wrapper generateObject + risoluzione provider/modello per step
models.ts # tipi e schema zod
```


# Schema Dati (zod)
- StoryIdea: { id:number, title:string, premise:string, mainCharacters:string[], setting:string }
- StoryOutline: { title:string, chapters: { number:number, title:string, summary:string }[] }
- Character: { name:string, role:string, description:string, relations:{type:string, with:string}[] }
- Setting: { name:string, description:string }
- RawScene: { number:number, title:string, summary:string }
- Scene: RawScene + { chapterNumber:number, text?:string }


# Prompting Guidelines
- Ogni prompt deve imporre **JSON only** (niente testo extra), rispettare i campi richiesti e lunghezze suggerite.
- Scene expansion: 500–900 parole, coerenza con stile/rating, uso di riassunti precedenti.


# Accettazione
- L'esecuzione `npm run dev` chiede parametri globali, propone 5 idee, consente la scelta, esegue tutti gli step senza errori e genera `story.md`.
- Nessun parsing fragile da testo libero: tutti gli step usano `generateObject()` + zod.
- Doppio loop implementato: (capitoli → scene; scene → espansione) con uso di contesto.