# Instructor key — do not hand this file out

This folder is the same as `starter-repos/isit300-ts-error-lab`, plus this file. `site/app.ts` is the finished Week 7 demo plus search, sort, the card-count badge, **Caught**, and **Look up**. `tsc --noEmit` reports exactly **10** errors, one on each `ERROR` line. The demo's fetch, cache, and card code is clean.

Bun transpiles and serves the page without checking types, so every symptom in the README shows in the browser. Those symptoms were checked against a build with no fixes, a build with only 1, 9, and 10 fixed, and a build with every fix applied.

## The ten errors

| # | Function | TypeScript says | Fix |
| --- | --- | --- | --- |
| 1 | `catchFromCard` | `Argument of type 'string' is not assignable to parameter of type 'number'.` | `rememberCaught(Number(rawId))` |
| 2 | `renderSpotlightNumber` | `Property 'padStart' does not exist on type 'number'.` | `formatNumber(pokemon.id)`, or `"#" + String(pokemon.id).padStart(3, "0")` |
| 3 | `readSort` | `Type '"alphabetical"' is not assignable to type '"id" \| "name"'.` | `return "name";` |
| 4 | `speciesLabel` | `'match' is possibly 'undefined'.` | `if (!match) { return "No exact match"; }` before the last line |
| 5 | `formatStat` | `Property 'baseStat' does not exist on type 'PokemonStat'.` | `stat.value` |
| 6 | `summarize` | `Property 'primaryType' is missing in type '{ id: number; name: string; }' but required in type 'PokemonSummary'.` | Add `primaryType: pokemon.types[0].type.name` |
| 7 | `caughtLabel` | `Type 'string \| undefined' is not assignable to type 'string'.` | `const label = record.nickname ?? formatName(speciesName);` (`\|\|` also works) |
| 8 | `countTone` | `Type '"empty"' is not assignable to type '"none" \| "one" \| "many"'.` | `return "none";` |
| 9 | `showSpotlight` | `Argument of type 'string' is not assignable to parameter of type 'boolean'.` | `setBusy(false);` |
| 10 | `showSpotlight` | `Argument of type 'Promise<PokemonMeasurement>' is not assignable to parameter of type 'PokemonMeasurement'.` | `const pokemon = await loadMeasurement(name);` |

## Fixes that break the rules

Take points off for these. Each one clears the message without fixing the value.

- `as`, `any`, `// @ts-ignore`, or `!` on `match` (4)
- Adding `"alphabetical"` or `"empty"` to the unions (3, 8)
- Making `primaryType` or `nickname` optional or loosening the type in an interface (6, 7)
- Changing `rememberCaught` to take a string (1), or `setBusy` to take a string (9)
- Renaming `value` to `baseStat` in `PokemonStat` (5). `toStat` would also need to change, and the comment says to read the interface.
- `renderSpotlight(pokemon as PokemonMeasurement)` (10)

## Quick grading check

1. `bun run typecheck` prints nothing after the `tsc --noEmit` line.
2. Search `zzzz` → **No cards**. Search `char` → **No exact match**. **Name** sort starts with Arbok.
3. Clear Nickname, catch Ivysaur → **Release**, green card, **Caught as Ivysaur**, `"id":2`.
4. Search `bulbasaur`, **Look up** → **#001**, **Bulbasaur**, **Grass**, **0.7 m · 6.9 kg**, **Hp 45**, and both buttons enabled.

## Run the instructor copy

```sh
docker compose up -d
```

Open http://localhost:8088. The finished demo can stay on 8087.
