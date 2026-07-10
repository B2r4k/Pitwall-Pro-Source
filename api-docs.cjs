async function run() {
    const res = await fetch('https://api.gpro.net');
    console.log(await res.text());
}
run();
