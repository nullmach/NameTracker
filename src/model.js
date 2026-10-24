export const themes = [
  {id:'all',icon:'✳',name:'All names',description:'A little bit of everything'},
  {id:'nature',icon:'❀',name:'Wild & wonderful',description:'Flowers, forests, and open skies',names:'River Willow Ivy Rose Lily Violet Hazel Olive Sage Juniper Wren Iris Flora Fern Daisy Poppy Rowan Ash Aspen Reed Sky Autumn Summer Winter Brooks Robin Laurel Meadow Ocean Clementine'},
  {id:'vintage',icon:'✧',name:'Old souls',description:'Vintage charm, ready for a comeback',names:'Arthur Eleanor Florence Theodore Alice Clara Edith Walter Henry Mabel Beatrice Felix Oscar August Ada Elsie Otto Pearl Esther Louis Josephine Vera Dorothy Hugo Harvey Matilda'},
  {id:'short',icon:'◒',name:'Small & sweet',description:'Four letters or fewer'},
  {id:'literary',icon:'▤',name:'Storybook names',description:'A little literary inspiration',names:'Alice Eloise Matilda Finn Atticus Scout Holden Jane Juliet Romeo Darcy Oliver Charlotte Emma Jo Edmund Lucy Peter Wendy Beatrice Orlando Dorian Cordelia Lyra'},
  {id:'rare',icon:'◇',name:'Hidden gems',description:'Given to 5–100 babies last year'},
  {id:'popular',icon:'↗',name:'The favorites',description:'The latest top 100 for each sex'},
  {id:'historic',icon:'◷',name:'From the archives',description:'Names absent from the latest year'}
];
export const key=n=>`${n[0]}-${n[1]}`;
export function matches(n,{sex='all',theme='all',query=''},decisions={}) {
  if (decisions[key(n)] || (sex!=='all' && n[1]!==sex) || !n[0].toLowerCase().includes(query.trim().toLowerCase())) return false;
  const t=themes.find(t=>t.id===theme);
  if (t?.names) return t.names.split(' ').includes(n[0]);
  if (theme==='short') return n[0].length<=4 && n[2]>0;
  if (theme==='rare') return n[2]>=5 && n[2]<=100;
  if (theme==='popular') return n[3]>0 && n[3]<=100;
  if (theme==='historic') return n[2]===0;
  return n[2]>0;
}
export function validateBackup(value,validIds) {
  if (!value || value.version!==1 || !value.decisions || typeof value.decisions!=='object' || Array.isArray(value.decisions)) throw new Error('Choose a Little Name Club backup file.');
  return Object.fromEntries(Object.entries(value.decisions).filter(([id,v])=>validIds.has(id) && ['like','pass'].includes(v)));
}
