# Accelerator Wins gallery

Drop screenshots into this folder and reference them in the `WINS` array
of `src/app/accelerator/AcceleratorClient.tsx`.

## Naming
- Use lowercase + hyphens: `alkis-first-payout.png`, `menes-100-orders.jpg`
- PNG, JPG, or WebP all work
- Recommended max width: 1600px (larger will still render, just slower to load)
- Aspect ratio: any works — the grid handles it

## Wiring
After dropping a file, open `src/app/accelerator/AcceleratorClient.tsx`
and edit the `WINS` constant:

```ts
const WINS: { src: string; caption?: string }[] = [
  { src: "/accelerator/wins/alkis-first-payout.png", caption: "Alkis — first weekly payout" },
  { src: "/accelerator/wins/menes-100-orders.jpg", caption: "Menes — 100 orders in 14 days" },
  // ...
];
```

The empty state disappears automatically once at least one entry is
in the array. Redeploy after committing the changes.
