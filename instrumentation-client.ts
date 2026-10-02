import { initBotId } from "botid/client/core";

// Server Actions POST to the page they're invoked from, so this covers both
// submit actions in app/dodaj-event/actions.ts.
initBotId({
  protect: [{ path: "/dodaj-event", method: "POST" }],
});
