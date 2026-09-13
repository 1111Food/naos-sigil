async function test() {
    const res = await fetch('https://www.timeapi.io/api/Time/current/coordinate?latitude=14.63&longitude=-90.50');
    const data = await res.json();
    console.log(data.timeZone);
}
test();
