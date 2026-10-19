# ISIT 300 TypeScript error lab — field guide

This is the Week 7 field guide from class, with new features added: search, sort, a card-count badge, **Caught**, and **Look up**. Ten lines in the new code are TypeScript errors. Your job is to fix them and explain each one.

The page still opens with the errors in place. Bun serves the page, but it does not check types. The editor does.

## Start

1. On GitHub, choose **Use this template**, then clone **your** copy.
2. Open the folder in VS Code or Cursor.
3. Start the server:

   ```sh
   docker compose up -d
   ```

4. Open http://localhost:8088. If a Week 7 container is already on that port, stop it first.

Edit `site/app.ts`, save, and refresh the browser.

## Find the errors

- Open `site/app.ts`. The ten errors have red underlines. Each is marked with a comment that starts `ERROR 1` through `ERROR 10`.
- Open the **Problems** panel (View → Problems). It lists all ten with the TypeScript message.
- From the terminal, this prints the same list:

  ```sh
  docker compose exec web bun install
  docker compose exec web bun run typecheck
  ```

## Rules

- Fix the value, the call, or the check on the marked line.
- Do not use `any`, `as`, or `// @ts-ignore`.
- Do not change an interface or a function's return type to make the error go away.
- Do not paste the class demo over `site/app.ts`. The demo does not have these features.

## What you will see

Two features work and are not part of the errors: the 24-card grid and **Reload**, and filtering cards by typing in **Search**.

Some errors hide others. **Look up** stops at error 10 until you fix it, so errors 2, 5, and 6 show up after that. **Caught** stops at error 1, so error 7 shows up after that. Fixing 10 and 1 first is the easiest order.

| # | Feature | Before the fix | After the fix |
| --- | --- | --- | --- |
| 1 | Caught button | Click **Caught** on Ivysaur. The button still says **Caught** and the card does not change. In DevTools → Application → Local Storage, `isit300-pokemon-caught` shows `"id":"2"` with quotes. | The button says **Release** and the card turns green. The stored value is `"id":2` with no quotes. The card is still green after a refresh. |
| 2 | Look up, number line | After fixing 10: the red banner says **pokemon.id.padStart is not a function**. The number line is blank. | The panel shows **#001** and the banner says **Looked up Bulbasaur.** |
| 3 | Sort menu | Choose **Name**. The cards stay in number order. | **Name** starts Arbok, Beedrill, Blastoise. **Number** goes `#001` to `#024`. |
| 4 | Match line | Type `char` in Search. The match line is blank, and the console says **Cannot read properties of undefined (reading 'name')**. | `char` shows **No exact match**. `bulbasaur` shows **Match: Bulbasaur**. |
| 5 | Look up, HP line | After fixing 10: **Hp undefined** | **Hp 45** |
| 6 | Look up, type line | After fixing 10: **Type missing** | **Grass** |
| 7 | Nickname line | After fixing 1: leave **Nickname** empty and catch Ivysaur. The card says **Caught as undefined**. | **Caught as Ivysaur**. Type `Sprout`, then catch Bulbasaur: **Caught as Sprout**. |
| 8 | Card-count badge | Type `zzzz` in Search. The badge says **empty**. | **No cards**. `caterpie` shows **One card**. An empty search shows **Several cards**. |
| 9 | Buttons after Look up | After a look up, **Reload** and **Look up** stay greyed out until you refresh the page. | Both buttons work again as soon as the look up finishes. |
| 10 | Look up panel | Type `bulbasaur`, click **Look up**. No panel appears. The banner says **Cannot read properties of undefined (reading 'split')**. | The panel opens for Bulbasaur. A name that is not a Pokémon, such as `notapokemon`, shows **Could not look up "notapokemon" (404)**. |

Every **Look up** test starts by typing a name in **Search**.

## Done

- The Problems panel says **No problems** for `site/app.ts`, and `bun run typecheck` prints nothing.
- Every "After the fix" result in the table is what you see.
- The 24-card grid and **Reload** still work the way they did in class.

## Explain each error

Fill in `EXPLANATIONS.md`. For each error, copy the TypeScript message, then write one or two plain sentences: what TypeScript was complaining about, and what you changed. Paste your `bun run typecheck` result at the bottom.

## Submit

Commit and push to **your** repository. Submit the GitHub URL in Canvas.
