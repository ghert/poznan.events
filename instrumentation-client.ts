import { initBotId } from "botid/client/core";

// Server Actions POST to the page they're invoked from, so this covers both
// submit actions in app/dodaj-wydarzenie/actions.ts.
initBotId({
  protect: [{ path: "/dodaj-wydarzenie", method: "POST" }],
});
