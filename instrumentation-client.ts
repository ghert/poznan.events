import { initBotId } from "botid/client/core";

// Server Actions POST to the page they're invoked from, so this covers both
// submit actions in app/dodaj-wydarzenie/actions.ts and the newsletter signup
// (its page and the homepage box).
initBotId({
  protect: [
    { path: "/dodaj-wydarzenie", method: "POST" },
    { path: "/newsletter", method: "POST" },
    { path: "/", method: "POST" },
  ],
});
