// July 2026 Class I schedule. Illustrations use whole 1,000-gallon increments.
export function navarreUtilityIllustration(gallons, data) {
  if (!Number.isFinite(gallons) || gallons < 0 || gallons > 100000 || gallons % 1000 !== 0) throw new RangeError('Enter 0 to 100,000 gallons in steps of 1,000.');
  const w=data?.water,s=data?.sewer;
  if(!w||!s||w.effective!=='2026-07'||s.effective!=='2026-07'||![w.first3000GallonsMinimum,w.next3000Per1000,w.over6000Per1000,s.first3000GallonsMinimum,s.over3000Per1000].every(n=>Number.isFinite(n)&&n>=0))throw Error('The reviewed schedule is unavailable.');
  const waterCents=Math.round(w.first3000GallonsMinimum*100)+Math.min(Math.max(gallons-3000,0),3000)/1000*Math.round(w.next3000Per1000*100)+Math.max(gallons-6000,0)/1000*Math.round(w.over6000Per1000*100);
  const sewerCents=Math.round(s.first3000GallonsMinimum*100)+Math.max(gallons-3000,0)/1000*Math.round(s.over3000Per1000*100);
  return {gallons,water:waterCents/100,sewer:sewerCents/100,total:(waterCents+sewerCents)/100};
}
