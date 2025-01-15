(async function () {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.id) {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const allScripts = Array.from(document.scripts);
          for (const script of allScripts) {
            const content = script.textContent;
            const regex =
              /newrelic\.addRelease\((['"])(.*?)\1,\s*(['"])(.*?)\3\)/i;
            const match = content.match(regex);
            if (match) {
              return { name: match[2], version: match[4] };
            }
          }
          return null;
        },
      });

      const releaseInfo = results[0]?.result;
      document.getElementById("releaseInfo").textContent = releaseInfo
        ? `Release Name: ${releaseInfo.name}, Release Version: ${releaseInfo.version}`
        : "No newRelic.addRelease call found on this page.";
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
