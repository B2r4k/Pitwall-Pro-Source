async function get() {
  const res = await fetch('https://raw.githubusercontent.com/kensta/pygpro/master/gpro.py');
  const text = await res.text();
  console.log(text.substring(0, 1000));
}
get();
