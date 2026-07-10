async function getPygpro() {
   const res = await fetch('https://api.github.com/repos/kensta/pygpro/git/trees/master?recursive=1');
   const data = await res.json();
   console.log(data);
}
getPygpro();
