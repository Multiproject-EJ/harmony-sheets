// tools/update-init.js
// Usage: node tools/update-init.js path/to/lovablesheet.js
//
// This script:
// - Backups the original file to lovablesheet.js.bak (same dir)
// - Replaces the body of `async function init() { ... }` with the new implementation
//   that waits up to 2000ms for supabase.auth.onAuthStateChange if getSession() returns no session.
//
// The replacement is done by finding the 'async function init() {' token and matching braces.

const fs = require("fs");
const path = require("path");

if (process.argv.length < 3) {
  console.error("Usage: node tools/update-init.js path/to/lovablesheet.js");
  process.exit(2);
}

const filePath = path.resolve(process.argv[2]);
if (!fs.existsSync(filePath)) {
  console.error("File not found:", filePath);
  process.exit(2);
}

const backupPath = `${filePath}.bak`;
fs.copyFileSync(filePath, backupPath);
console.log(`Backup created at ${backupPath}`);

let content = fs.readFileSync(filePath, "utf8");

const startToken = "async function init() {";
const startIndex = content.indexOf(startToken);
if (startIndex === -1) {
  console.error("Could not find start token:", startToken);
  process.exit(3);
}

// Find matching closing brace for the init() function using brace counting
let i = startIndex + content.slice(startIndex).indexOf("{") + 1;
let depth = 1;
let endIndex = -1;
for (; i < content.length; i++) {
  const ch = content[i];
  if (ch === "{") depth++;
  else if (ch === "}") {
    depth--;
    if (depth === 0) {
      endIndex = i;
      break;
    }
  }
}
if (endIndex === -1) {
  console.error("Could not find matching closing brace for init()");
  process.exit(4);
}

// New init() implementation (keeps the signature and uses same indentation)
const newInit = `async function init() {
  showSection("loading");

  if (!isSupabaseConfigured()) {
    handleUnauthorized("Supabase credentials are missing. Update supabase-config.js to enable admin access.");
    return;
  }

  supabaseClient = getSupabaseClient();

  try {
    console.log("LovableSheet: init - checking session");

    // Try to get session synchronously first
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
      console.error("Unable to load session for LovableSheet", error);
      handleUnauthorized("We couldn't verify your admin access. Please try signing in again.");
      return;
    }

    // If getSession() returns a session, use it. Otherwise wait briefly for auth rehydration.
    let user = data?.session?.user ?? null;

    if (!user) {
      console.log("LovableSheet: no session from getSession(); waiting up to 2000ms for onAuthStateChange...");
      user = await new Promise((resolve) => {
        let resolved = false;
        const timeout = setTimeout(() => {
          if (resolved) return;
          resolved = true;
          console.log("LovableSheet: auth state wait timed out (no session).");
          resolve(null);
        }, 2000);

        // Subscribe to auth state changes and resolve early if a session arrives.
        const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
          if (resolved) {
            try {
              listener?.subscription?.unsubscribe?.();
            } catch (_) {}
            return;
          }
          resolved = true;
          clearTimeout(timeout);
          try {
            listener?.subscription?.unsubscribe?.();
          } catch (_) {}
          console.log("LovableSheet: onAuthStateChange delivered session:", session);
          resolve(session?.user ?? null);
        });
      });
    } else {
      console.log("LovableSheet: session found from getSession()", user);
    }

    // requireAdmin will show content or handle unauthorized state.
    // If the user is null we intentionally return so the page doesn't force a redirect
    // before the onAuthStateChange handler below can act on later changes.
    if (!requireAdmin(user)) {
      return;
    }

    // Initialize boards and load saved boards (admin-only features)
    initializeStickyBoards();
    await fetchBoards();

    // Subscribe to auth state changes to handle sign-out or role changes.
    const { data: listener } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;

      // If requireAdmin fails for the current user, redirect appropriately.
      if (!requireAdmin(currentUser)) {
        if (!currentUser) {
          const redirectUrl = \`login.html?redirect=\${encodeURIComponent(PAGE_PATH)}\`;
          redirectTo(redirectUrl);
        } else {
          redirectTo(ACCOUNT_PAGE_PATH);
        }
        return;
      }

      // Re-initialize admin UI bits if necessary.
      initializeStickyBoards();
      fetchBoards();
    });

    authSubscription = listener?.subscription || null;
  } catch (err) {
    console.error("LovableSheet initialization failed:", err);
    handleUnauthorized("We couldn't verify your admin access. Please try signing in again.");
  }
}`;

// Replace the content between startIndex and endIndex (inclusive of braces)
const replaced = content.slice(0, startIndex) + newInit + content.slice(endIndex + 1);
fs.writeFileSync(filePath, replaced, "utf8");

console.log("Updated init() in", filePath);
console.log("Please review changes, run tests if available, and commit.");

process.exit(0);
