const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix Back button for notifications
c = c.replace(/onClick=\{\(\) =>\n                    setAppView\(appView === "menu" \? "calculator" : "menu"\)\n                  \}/, 
`onClick={() =>
                    setAppView(
                      appView === "menu" || appView === "notifications"
                        ? "calculator"
                        : "menu"
                    )
                  }`);

// Now fix the alerts logic
const regex = /      if \(timeLeft && timeLeft\.d <= 1 && timeLeft\.d >= 0\) \{([\s\S]*?)const dynamicIds = /;

const match = c.match(regex);
if(match) {
  const newAlertsLogic = `
      if (timeLeft && timeLeft.d === 0) {
        addAlert("alert-upcoming-race", t("Upcoming Race Reminder"), t("The next race is tomorrow! Make sure your strategy is ready."));
      }

      if ((player.league === "Rookie" || player.league === "Amateur") && player.riskAggression > 60) {
        addAlert("alert-high-risk", t("High Risk Strategy Warning"), t("You have set a very high risk aggression for a lower league driver. This might result in frequent mistakes or crashes."));
      }

      if (weather.q1 === "Rain" || weather.rainProps > 0) {
        addAlert("alert-rain", t("Rain Expected"), t("Track conditions indicate rain. Make sure your pit strategy adapts to wet weather tyres."));
      }
      
      if (player.riskAggression > 50 && (weather.q1 === "Rain" || weather.rainProps > 0)) {
        addAlert("alert-extreme-risk-rain", t("Extreme Risk in Rain"), t("Taking high risks in wet conditions drastically increases the chance of a crash."));
      }

      if (activeTrack && activeTrack.wearFactor > 1.3) {
        addAlert("alert-high-wear", t("High Track Wear"), t("This track is highly demanding on tyres. Consider harder compounds or shorter stints."));
      }
      
      if (player.driverStamina < 50) {
        addAlert("alert-low-stamina", t("Driver Fatigue Warning"), t("Your driver's stamina is very low. They might make mistakes towards the end of the race."));
      }
      
      if (weather.tempBase < 15) {
        addAlert("alert-cold-track", t("Cold Track Conditions"), t("Track temperature is very low. It will be difficult to warm up harder tyre compounds."));
      } else if (weather.tempBase > 35) {
        addAlert("alert-hot-track", t("Hot Track Conditions"), t("Track temperature is very high. Tyres will overheat and degrade much faster than usual."));
      }
      
      if (player.baseFuelPerLap > 2.5) {
        addAlert("alert-high-fuel", t("High Fuel Consumption"), t("Your car consumes a lot of fuel. Be careful with tank limits on longer stints."));
      }

      const dynamicIds = `;
  c = c.replace(regex, newAlertsLogic);
  
  c = c.replace(/const dynamicIds = \["alert-upcoming-race", "alert-high-risk", "alert-rain", "alert-high-wear"\];/, 'const dynamicIds = ["alert-upcoming-race", "alert-high-risk", "alert-rain", "alert-extreme-risk-rain", "alert-high-wear", "alert-low-stamina", "alert-cold-track", "alert-hot-track", "alert-high-fuel"];');
  fs.writeFileSync('src/App.tsx', c);
  console.log("Updated alerts logic");
} else {
  console.log("Could not find alerts logic to replace");
}
