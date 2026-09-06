// Address points for explicitly sourced school additions. Does not geocode visitors.
import { writeFileSync, readFileSync } from 'node:fs';
const requests = [
  { id:'official-pensacola-christian-academy', name:'Pensacola Christian Academy', address:'10 Brent Lane', city:'Pensacola', state:'FL', zip:'32503', sourceUrl:'https://www.pensacolachristianacademy.com/' },
  { id:'official-lighthouse-pensacola', name:'Lighthouse Private Christian Academy - Pensacola', address:'1100 W Scott St', city:'Pensacola', state:'FL', zip:'32501', sourceUrl:'https://lighthousepca.com/pensacola-k-12th-campus/' },
  { id:'official-lighthouse-gulf-breeze', name:'Lighthouse Private Christian Academy - Gulf Breeze', address:'1530 New Hope Rd', city:'Gulf Breeze', state:'FL', zip:'32563', sourceUrl:'https://lighthousepca.com/gulf-breeze-high-school/' }
];
const east=JSON.parse(readFileSync('content/schools/map-private-resources-east.json','utf8'));
const west=JSON.parse(readFileSync('content/schools/map-private-resources-west.json','utf8'));
for(const resource of [...east.schools,...Object.values(west.byNcesId)]){
  const current=resource.locationUnconfirmed?resource.currentAddress:resource.officialAddress;
  if(current)requests.push({id:resource.ncesId,ncesId:resource.ncesId,name:resource.name,...current,sourceUrl:resource.sourceUrl});
}
const schools=[];
for(const school of requests){
  const params=new URLSearchParams({address:[school.address,school.city,school.state,school.zip].join(' '),benchmark:'Public_AR_Current',format:'json'});
  const geocoderUrl='https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?'+params;
  const response=await fetch(geocoderUrl,{signal:AbortSignal.timeout(25000)});
  if(!response.ok)throw Error('Census geocoder HTTP '+response.status);
  const result=await response.json();
  const matches=result.result?.addressMatches;
  if(matches?.length!==1)throw Error('Expected one address match for '+school.name);
  const match=matches[0];
  if(match.addressComponents?.state!==school.state||match.addressComponents?.zip!==school.zip)throw Error('Geocoder did not match the expected state and ZIP for '+school.name);
  const lat=match.coordinates?.y,lng=match.coordinates?.x;
  if(!Number.isFinite(lat)||!Number.isFinite(lng)||lat<30||lat>31||lng< -88||lng> -86)throw Error('Out-of-region school location');
  schools.push({...school,lat,lng,geocoderUrl,matchedAddress:match.matchedAddress,tigerLine:match.tigerLine,benchmark:result.result.input.benchmark,locationNote:'Approximate address point from the Census geocoder; confirm the campus entrance with the school.'});
}
const output={retrieved:new Date().toISOString(),sourceKind:'official school address plus Census address geocoding',schools};
writeFileSync('content/schools/map-private-location-updates.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(schools.map(({id,matchedAddress,lat,lng})=>({id,matchedAddress,lat,lng})),null,2));
