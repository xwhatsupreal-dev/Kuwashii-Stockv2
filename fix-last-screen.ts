import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const loadingScreenTimer = `  // Loading Screen Timer
  useEffect(() => {
    if (appScreen === "LOADING") {
      const timer = setTimeout(() => {
        setAppScreen("SELECT");
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [appScreen]);`;

const newLoadingScreenTimer = `  // Loading Screen Timer
  useEffect(() => {
    if (appScreen === "LOADING") {
      const timer = setTimeout(() => {
        let finalScreen = "SELECT";
        try {
          const stored = localStorage.getItem("KUWASHII_LAST_SCREEN");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (
              parsed.expiry > Date.now() &&
              ["ASTD", "AOTR", "ROV"].includes(parsed.screen)
            ) {
              finalScreen = parsed.screen;
            } else {
              localStorage.removeItem("KUWASHII_LAST_SCREEN");
            }
          }
        } catch (e) {}
        setAppScreen(finalScreen as any);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [appScreen]);

  // Save Last Screen Strategy
  useEffect(() => {
    if (["ASTD", "AOTR", "ROV"].includes(appScreen)) {
      const TH_OFFSET = 7 * 60 * 60 * 1000;
      const now = Date.now();
      const thTimeMs = now + TH_OFFSET;
      const daysSinceEpoch = Math.floor(thTimeMs / 86400000);
      const nextMidnightThMs = (daysSinceEpoch + 1) * 86400000;
      const expiry = nextMidnightThMs - TH_OFFSET;

      localStorage.setItem(
        "KUWASHII_LAST_SCREEN",
        JSON.stringify({
          screen: appScreen,
          expiry: expiry,
        })
      );
    }
  }, [appScreen]);`;

if (content.includes(loadingScreenTimer)) {
    content = content.replace(loadingScreenTimer, newLoadingScreenTimer);
    fs.writeFileSync('src/App.tsx', content);
    console.log('Done inserting save screen strategy.');
} else {
    console.log('Could not find loading screen timer.');
}
