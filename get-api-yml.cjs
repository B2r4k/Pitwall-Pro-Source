async function run() {
    const res = await fetch('https://api.gpro.net/gpro-public-api.yml');
    console.log(await res.text());
}
run();
