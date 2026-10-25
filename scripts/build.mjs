import fs from 'node:fs/promises';
import path from 'node:path';
const source = 'data/names';
const files = (await fs.readdir(source)).filter(f => /^yob\d{4}\.txt$/.test(f)).sort();
if (!files.length) throw new Error('No national SSA files found');
const years = files.map(f => Number(f.slice(3,7)));
const latest = years.at(-1), names = new Map(), totals = [];
for (const [i,file] of files.entries()) {
  const ranks = {F:0,M:0}, sum = {F:0,M:0};
  for (const line of (await fs.readFile(path.join(source,file),'utf8')).trim().split(/\r?\n/)) {
    const [name,sex,value] = line.split(','), count = Number(value), id = `${name}-${sex}`;
    ranks[sex]++; sum[sex] += count;
    if (!names.has(id)) names.set(id,{name,sex,history:[],count:0,rank:0,peak:0,peakYear:0,total:0});
    const n = names.get(id);
    n.history.push(i,count); n.total += count;
    if (count > n.peak) { n.peak=count; n.peakYear=years[i]; }
    if (years[i]===latest) { n.count=count; n.rank=ranks[sex]; }
  }
  totals.push(sum);
}
await fs.mkdir('dist/assets/history',{recursive:true});
for (const f of ['index.html','styles.css','app.js','model.js','swipe.js']) await fs.copyFile(`src/${f}`,`dist/${f}`);
const shards = {}, catalog = [];
for (const [id,n] of names) {
  catalog.push([n.name,n.sex,n.count,n.rank,n.peakYear,n.peak,n.total]);
  const shard=n.name[0].toLowerCase();
  (shards[shard] ??= {})[id]=n.history;
}
catalog.sort((a,b)=>b[2]-a[2] || a[0].localeCompare(b[0]));
await fs.writeFile('dist/assets/catalog.json',JSON.stringify({years,latest,totals,names:catalog}));
for (const [letter,values] of Object.entries(shards)) await fs.writeFile(`dist/assets/history/${letter}.json`,JSON.stringify(values));
await fs.writeFile('dist/.nojekyll','');
console.log(`Built ${catalog.length.toLocaleString()} name/sex records, ${years[0]}–${latest}. No runtime dependencies.`);
