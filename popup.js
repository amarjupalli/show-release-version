(async function () {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const allScripts = Array.from(document.scripts);
          for (const script of allScripts) {
            const content = script.textContent;
            /**
             * This regex will match the following patterns newrelic.addRelease('name', 'version') and newrelic.addRelease("name", "version")
             * the match array will look like this:
             * 0: "newrelic.addRelease('name', 'version')"
             * 1: "'" or '"'
             * 2: "name"
             * 3: "'" or '"'
             * 4: "version
             */
            const regex =
              /newrelic\.addRelease\((['"])(.*?)\1,\s*(['"])(.*?)\3\)/i;
            const match = content.match(regex);
            if (match) {
              // return the indexes 2 and 4 of the match array to get rlease name and release version
              return { name: match[2], version: match[4] };
            }
          }
          return null;
        },
      });

      const releaseInfo = results[0]?.result;
      document.getElementById("releaseInfo").textContent = releaseInfo
        ? `${releaseInfo.name}: v${releaseInfo.version}`
        : "No release found on this page.";
    } else {
      document.getElementById("releaseInfo").textContent =
        "Unable to access the current tab.";
    }
  } catch (error) {
    document.getElementById(
      "releaseInfo",
    ).textContent = `Error: ${error.message}`;
  }
})();
