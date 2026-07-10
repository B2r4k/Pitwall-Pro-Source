fetch('https://api.jolpi.ca/ergast/f1/current/next.json')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data).slice(0, 500)))
  .catch(console.error);
