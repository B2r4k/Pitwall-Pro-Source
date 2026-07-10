async function fetchPage() {
    try {
        const res = await fetch("https://www.gpro.net/gb/forum/ViewTopic.asp?TopicId=33177");
        const text = await res.text();
        console.log(text.substring(0, 1000));
    } catch (e) {
        console.log("Error", e);
    }
}
fetchPage();
