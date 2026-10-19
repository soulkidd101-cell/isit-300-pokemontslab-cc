# Error explanations

For each error, paste the TypeScript message from the Problems panel. Then write one or two plain sentences: what TypeScript was complaining about, and what you changed.

Example (not one of the ten):

> **Message:** Type 'string' is not assignable to type 'number'.
>
> **Explanation:** The variable was declared as a number, but `"3"` in quotes is a string. I removed the quotes so the value is the number `3`.

## 1. Caught button

**Message:** Argument of type 'string' is not assignable to parameter of type 'number'.

**Explanation:** The Pokémon ID from card.dataset.id is stored as a string, but rememberCaught() expects a number. I converted the ID to a number using Number(rawId) before passing it to the function.

## 2. Look up, number line

**Message:** Property 'padStart' does not exist on type 'number'.

**Explanation:** The padStart() method works on strings, but pokemon.id is a number. I used the existing formatNumber() function to convert the ID into the correct format.

## 3. Sort menu

**Message:** Type '"alphabetical"' is not assignable to type '"name" | "id"'.

**Explanation:** The sorting function expects either "name" or "id", but the code returned "alphabetical". I changed the return value to "name" so the cards can be sorted alphabetically.

## 4. Match line

**Message:** Cannot read properties of undefined (reading 'name')

**Explanation:** The find() method can return undefined when no Pokémon matches the search exactly. I added a check for a missing match so the page shows "No exact match" instead of trying to access a nonexistent Pokémon's name.

## 5. Look up, HP line

**Message:** Property 'baseStat' does not exist on type 'PokemonStat'.

**Explanation:** The PokemonStat interface uses the property value, not baseStat. I changed stat.baseStat to stat.value so the HP line shows the correct stat value.

## 6. Look up, type line

**Message:** Property 'primaryType' is missing in type '{ id: number; name: string; }' but required in type 'PokemonSummary'.

**Explanation:** The PokemonSummary interface needs an ID, a name, and a primary type. I added primaryType using the Pokémon's first type, pokemon.types[0].type.name, so the panel can show its type.

## 7. Nickname line

**Message:** Type 'string | undefined' is not assignable to type 'string'.

**Explanation:** A nickname is optional, so record.nickname can be undefined when the input is left empty. I used the species name as a fallback so the card shows "Caught as Ivysaur" instead of "Caught as undefined".

## 8. Card-count badge

**Message:** Type '"empty"' is not assignable to type '"none" | "one" | "many"'.

**Explanation:** The countTone() function only allows "none", "one", or "many" as return values. I changed "empty" to "none" so the badge correctly displays "No cards" when there are no matching Pokémon.

## 9. Buttons after Look up

**Message:** Argument of type 'string' is not assignable to parameter of type 'boolean'.

**Explanation:** The setBusy() function expects a boolean, but the code passed the string "false". I changed it to the boolean false so the Reload and Look up buttons become enabled again when the request finishes.

## 10. Look up panel

**Message:** Argument of type 'Promise<PokemonMeasurement>' is not assignable to parameter of type 'PokemonMeasurement'.

**Explanation:** The loadMeasurement() function is asynchronous and returns a Promise. I added await so the code waits for the Pokémon data to load before passing it to renderSpotlight().

## Typecheck result

Run these and paste what the second command prints. When every error is fixed, it prints nothing after the `tsc --noEmit` line.

```sh
docker compose exec web bun install
docker compose exec web bun run typecheck
```

```text
TODO(student): paste here
```
I ran this in the terminal:

docker compose exec web bunx tsc --noEmit
echo $LASTEXITCODE

and got 0 as a result.
