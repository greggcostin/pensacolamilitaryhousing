import { findSchools, hasCampus, validateLocation } from './school-finder-core.js';
import { lookupHomeAddress, validateHomeAddress } from './school-address-search.js';
import { lookupDrivingRoute, clearDrivingRouteCache } from './school-driving-route.js';

const root = document.querySelector('#school-finder');
if (root) start().catch(error => {
  root.querySelector('[data-sf-app]').hidden = true;
  root.querySelector('.sf-type-shortcuts').hidden = true;
  root.querySelector('[data-sf-fallback]').textContent = 'The interactive finder is temporarily unavailable. Browse the school reports below or use the official school directories.';
  root.querySelector('[data-sf-fallback]').hidden = false;
  console.warn('School finder unavailable:', error.message);
});

async function start() {
  const response = await fetch('/assets/school-finder-data.json');
  if (!response.ok) throw Error('School directory could not load');
  const data = await response.json();
  if (!Array.isArray(data.schools) || !data.schools.length || !data.zipCenters) throw Error('School directory is incomplete');
  const get = selector => root.querySelector(selector);
  const form = get('#sf-filters');
  const results = get('#sf-results');
  const pageSize = 10;
  let current = [], pageNumber = 0, applied = {}, bounds = null, selectedId = null;
  let map = null, clusters = null, radiusLayer = null, homeMarker = null, mapOpening = null;
  let home = null, addressRequest = null, addressSequence = 0;
  let schoolSelectionSequence = 0;
  let drivingRequest=null, drivingSequence=0, drivingSchoolId=null;
  const drivingResults=new Map(), drivingLayers=[];
  const markers = new Map();
  const el = (tag, cls, text) => { const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node; };
  const link = (text, href) => {
    const anchor=el('a','',text);
    if (typeof href==='string' && (href.startsWith('/')&&!href.startsWith('//') || /^https?:\/\//.test(href))) anchor.href=href;
    if (/^https?:/.test(href||'')) {anchor.target='_blank';anchor.rel='noopener';}
    return anchor;
  };
  const option = (value,label) => { const node=el('option','',label);node.value=value;return node; };
  const area = get('#sf-area');
  const counties=el('optgroup');counties.label='Counties';
  for (const county of data.counties) counties.append(option('county:'+county.key,county.label));
  area.append(counties);
  const towns=el('optgroup');towns.label='Cities and communities';
  const cities=[...new Set(data.schools.filter(s=>s.city).map(s=>`${s.state}|${s.city}`))].sort((a,b)=>a.split('|')[1].localeCompare(b.split('|')[1]));
  for(const key of cities){const [state,city]=key.split('|');towns.append(option('city:'+key,`${city}, ${state}`));}
  area.append(towns);
  for (const zip of Object.keys(data.zipCenters).sort()) get('#sf-zips').append(option(zip,zip));
  const sourceBox=get('[data-sf-sources]');
  for (const source of data.sources) {
    const p=el('p');p.append(link(source.name,source.url),document.createTextNode(` · ${source.year}.`));sourceBox.append(p);
  }
  sourceBox.append(el('p','',data.coverageNote));
  sourceBox.append(el('p','','The directory includes dated federal records and may include separate records at the same address. Confirm current operations, program availability and admissions with the school.'));
  if(data.choiceResources?.length){const choices=el('p');choices.append(el('strong','','Choice and enrollment resources: '));data.choiceResources.forEach((item,index)=>{if(index)choices.append(document.createTextNode(' · '));choices.append(link(item.label,item.url));});sourceBox.append(choices);}
  get('[data-sf-fallback]').hidden=true;
  get('[data-sf-app]').hidden=false;
  get('.sf-type-shortcuts').hidden=false;

  const filters = () => Object.fromEntries(new FormData(form));
  function apply({fit=true,resetPage=true}={}) {
    const next=filters();next.q=next.q.trim();next.zip=next.zip.trim();
    const error=home ? '' : validateLocation(next.zip,next.radius,data.zipCenters);
    get('#sf-error').textContent=error;get('#sf-error').hidden=!error;get('#sf-zip').setAttribute('aria-invalid',String(!!error));
    if(error) {get('[data-sf-announcement]').textContent='Filters not applied. '+error;return false;}
    cancelDriving();
    applied={...next,bounds,origin:home};
    for(const button of root.querySelectorAll('[data-sf-type-choice]'))button.setAttribute('aria-pressed',String(button.dataset.sfTypeChoice===next.type));
    current=findSchools(data.schools,applied,data.zipCenters);
    if(resetPage)pageNumber=0;
    selectedId=null;schoolSelectionSequence++;
    render();
    if(map)renderMap(fit&&!bounds);
    return true;
  }
  function distanceNote(school) {
    if(school.distance===null)return '';
    return `${school.distance<.1?'< 0.1':school.distance.toFixed(1)} miles straight-line from ${home?'your searched address':`ZIP ${applied.zip} area center`}`;
  }
  function clearHome({clearInput=false,message=''}={}) {
    cancelDriving({clearResults:true});
    addressSequence++;addressRequest?.abort();addressRequest=null;home=null;
    get('[data-sf-address-submit]').disabled=false;get('[data-sf-address-submit]').textContent='Find this address ↗';
    get('[data-sf-home-active]').hidden=true;get('[data-sf-home-label]').textContent='';
    get('[data-sf-address-matches]').replaceChildren();get('[data-sf-address-matches]').hidden=true;
    get('#sf-address-status').textContent=message;get('#sf-home-address').setAttribute('aria-invalid','false');
    get('#sf-radius').querySelector('[value="exact"]').disabled=false;
    if(clearInput)get('#sf-home-address').value='';
    if(homeMarker){homeMarker.remove();homeMarker=null;}
  }
  function selectHome(match) {
    home={...match};bounds=null;
    get('#sf-zip').value='';
    if(get('#sf-radius').value==='exact')get('#sf-radius').value='10';
    get('#sf-radius').querySelector('[value="exact"]').disabled=true;
    get('#sf-sort').value='distance';
    get('[data-sf-home-label]').textContent=match.label;get('[data-sf-home-active]').hidden=false;
    get('[data-sf-address-matches]').replaceChildren();get('[data-sf-address-matches]').hidden=true;
    get('#sf-address-status').textContent='Matched by the U.S. Census Bureau. Check the address below; the red flag is an approximate address point.';
    apply();
  }
  function removeDrivingLayers() {
    for(const layer of drivingLayers)layer.remove();drivingLayers.length=0;
    get('[data-sf-driving-map-status]').textContent='';
  }
  function cancelDriving({clearResults=false}={}) {
    drivingSequence++;drivingRequest?.abort();drivingRequest=null;
    if(drivingResults.get(drivingSchoolId)?.status==='loading')drivingResults.delete(drivingSchoolId);
    drivingSchoolId=null;removeDrivingLayers();
    if(clearResults){drivingResults.clear();clearDrivingRouteCache();}
  }
  function drivingContent(school) {
    const content=document.createDocumentFragment();
    const state=drivingResults.get(school.id);
    content.append(el('span','sf-drive-eyebrow','By road from your searched address'));
    if(state?.status==='ready'){
      const route=state.route;
      const minutes=route.seconds<60?'< 1 min':`${Math.round(route.seconds/60)} min`;
      const miles=route.miles<.1?'< 0.1 mi':`${route.miles.toFixed(1)} mi`;
      content.append(el('strong','sf-drive-figures',`${miles} · about ${minutes}`));
      const limited=route.shortestLimited===true;
      content.append(el('small','sf-drive-method',`${limited?'Distance-prioritized driving estimate':'Shortest-distance driving estimate'} · no live traffic`));
      if(route.hasToll||route.hasFerry)content.append(el('small','sf-drive-method',`${route.hasToll?'Includes toll roads. ':''}${route.hasFerry?'Includes a ferry; schedules and waiting can add time.':''}`));
      if(route.snappedPoints?.some(point=>point.offsetMiles>.1))content.append(el('small','sf-drive-method','Road access is offset from a map pin. Confirm the driveway and school entrance.'));
      if(route.routeOptionsAdjusted)content.append(el('small','sf-drive-method',limited?'The service limit prevented a full shortest-route search.':'The routing service adjusted an option. Treat this as a suggested driving route.'));
      if(route.hasTimeRestrictions)content.append(el('small','sf-drive-method','This route includes time-based restrictions. Confirm access for your departure time.'));
    }else if(state?.status==='error')content.append(el('p','sf-drive-error',state.message));
    const button=el('button','sf-text-button',state?.status==='loading'?'Calculating drive…':state?.status==='ready'?'Show driving route ↗':state?.status==='error'?'Try driving estimate again ↗':'Calculate drive ↗');
    button.type='button';button.disabled=state?.status==='loading';button.addEventListener('click',()=>calculateDrive(school));content.append(button);
    return content;
  }
  function drivingPanel(school) {
    const panel=el('div','sf-drive');panel.dataset.sfDriveId=school.id;
    panel.setAttribute('aria-live','polite');panel.setAttribute('data-clarity-mask','true');panel.dataset.private='true';
    panel.append(drivingContent(school));return panel;
  }
  function refreshDrivingPanels() {
    for(const panel of root.querySelectorAll('[data-sf-drive-id]')){
      const school=current.find(item=>item.id===panel.dataset.sfDriveId);
      if(school)panel.replaceChildren(drivingContent(school));
    }
  }
  async function showDrivingRoute(school,route,sequence) {
    if(!await openMap()||sequence!==drivingSequence||!home)return;
    removeDrivingLayers();
    const L=window.L;
    drivingLayers.push(L.polyline(route.shape,{color:'#fff',weight:7,opacity:.95,interactive:false}).addTo(map));
    const line=L.polyline(route.shape,{color:'#856020',weight:4,opacity:1,interactive:false}).addTo(map);drivingLayers.push(line);
    map.fitBounds(L.latLngBounds([...route.shape,[home.lat,home.lng],[school.lat,school.lng]]),{padding:[35,35],maxZoom:15});
    get('[data-sf-driving-map-status]').textContent=`Driving route to ${school.name}. Road miles and estimated time follow this route; Google Maps may choose a different route.`;
    highlight(school);get('#sf-map-panel').scrollIntoView({block:'nearest',behavior:'auto'});
  }
  async function calculateDrive(school) {
    if(!home||!hasCampus(school))return;
    const cached=drivingResults.get(school.id);
    cancelDriving();
    const sequence=drivingSequence,origin={lat:home.lat,lng:home.lng};
    if(cached?.status==='ready'){refreshDrivingPanels();await showDrivingRoute(school,cached.route,sequence);return;}
    drivingRequest=new AbortController();drivingSchoolId=school.id;
    drivingResults.set(school.id,{status:'loading'});refreshDrivingPanels();
    try{
      const route=await lookupDrivingRoute(origin,school,{signal:drivingRequest.signal});
      if(sequence!==drivingSequence||!home)return;
      drivingResults.set(school.id,{status:'ready',route});refreshDrivingPanels();
      await showDrivingRoute(school,route,sequence);
    }catch(error){
      if(sequence!==drivingSequence||error.name==='AbortError')return;
      drivingResults.set(school.id,{status:'error',message:'Driving estimate unavailable. Try again or open Google Maps directions.'});refreshDrivingPanels();
    }finally{if(sequence===drivingSequence){drivingRequest=null;drivingSchoolId=null;}}
  }
  get('#sf-address-form').addEventListener('submit',async event=>{
    event.preventDefault();
    const address=get('#sf-home-address').value.trim();
    clearHome();bounds=null;apply({fit:false});
    const invalid=validateHomeAddress(address);
    if(invalid){get('#sf-address-status').textContent=invalid;get('#sf-home-address').setAttribute('aria-invalid','true');get('#sf-home-address').focus();return;}
    const sequence=addressSequence;
    addressRequest=new AbortController();
    get('[data-sf-address-submit]').disabled=true;get('[data-sf-address-submit]').textContent='Finding address…';
    get('#sf-address-status').textContent='Looking up the submitted address with the U.S. Census Bureau…';
    try{
      const result=await lookupHomeAddress(address,{signal:addressRequest.signal});
      if(sequence!==addressSequence)return;
      if(result.matches.length===1)selectHome(result.matches[0]);
      else if(result.matches.length>1){
        get('#sf-address-status').textContent='More than one address matched. Choose your address to compare schools.';
        const choices=get('[data-sf-address-matches]');
        for(const match of result.matches){const button=el('button','sf-address-choice',match.label);button.type='button';button.addEventListener('click',()=>selectHome(match));choices.append(button);}
        choices.hidden=false;choices.querySelector('button').focus();
      }else get('#sf-address-status').textContent=result.outsideCoverage?'This address is outside the covered counties: Escambia, Santa Rosa and Okaloosa in Florida, and Baldwin in Alabama. Try a local address or use the ZIP search.':'No address matched. Check the street number, city, state and ZIP, then try again. You can also search by ZIP code.';
    }catch(error){if(sequence===addressSequence&&error.name!=='AbortError')get('#sf-address-status').textContent=error.message;}
    finally{if(sequence===addressSequence){addressRequest=null;get('[data-sf-address-submit]').disabled=false;get('[data-sf-address-submit]').textContent='Find this address ↗';}}
  });
  get('#sf-home-address').addEventListener('input',()=>{clearHome({message:'Address changed. Submit it to calculate new distances.'});bounds=null;apply({fit:false});});
  get('[data-sf-clear-home]').addEventListener('click',()=>{clearHome({clearInput:true,message:'Address cleared. You can search by ZIP or compare a different address.'});bounds=null;apply();get('#sf-home-address').focus();});
  function gradeNote(school) {
    if(school.sector==='private')return 'Private · no state accountability grade';
    if(school.state==='AL'){
      const result=school.alabamaAccountability;
      if(school.grade)return `${school.grade} · Alabama ${school.gradeYear}${Number.isFinite(result?.score)?` · ${result.score}/100 overall score`:''}`;
      if(result?.gradeStatus==='approved-waiver')return `Alabama ${school.gradeYear} · Approved waiver (AW); no letter grade`;
      return `Alabama ${school.gradeYear||''} · School-level grade unavailable in this release`;
    }
    return school.grade ? `${school.grade} · Florida DOE ${school.gradeYear}` : school.gradeStatus ? `${school.gradeStatus} · Florida DOE ${school.gradeYear} (published status; no letter grade)` : 'No Florida letter grade in this dataset';
  }
  function schoolBadgeDescriptor(school) {
    if(school.sector==='private') {
      // Affiliation comes from the sourced directory flag, never the school name.
      const christian=school.christian===true;
      return {tone:christian?'christian':'private',glyph:christian?'CP':'P',description:christian?'Christian private school; CP identifies school type, not a grade':'Private school; P identifies school type, not a grade'};
    }
    return {tone:school.grade||'none',glyph:school.grade||'•',description:gradeNote(school)};
  }
  function gradeBadge(school) {
    const badge=schoolBadgeDescriptor(school);
    const node=el('span','sf-grade sf-grade--'+badge.tone,badge.glyph);
    node.setAttribute('aria-label',badge.description);node.title=badge.description;return node;
  }
  function tags(school) {
    const items=[];
    if(school.sector==='private')items.push('Private');else items.push(school.charter===true?'Public charter':'Public');
    if(school.sector==='private'&&school.christian===true)items.push('Christian');
    if(school.sector==='private'&&school.religiousCategory==='nonreligious')items.push('Nonreligious');
    if(school.magnet===true)items.push(school.magnetType==='program'?'Magnet program':'Magnet school');
    if(school.virtual===true)items.push('Virtual / online');
    if(school.gradeSpan)items.push('Grades '+school.gradeSpan);
    return items;
  }
  function makeCard(school) {
    const card=el('article','sf-result');card.dataset.schoolId=school.id;
    if(selectedId===school.id)card.classList.add('sf-selected');
    const head=el('div','sf-result-head'), title=el('div','sf-result-title');
    title.append(el('h3','',school.name),el('p','sf-result-meta',gradeNote(school)));
    head.append(gradeBadge(school),title);card.append(head);
    const typeTags=el('div','sf-result-tags');for(const label of tags(school))typeTags.append(el('span','',label));card.append(typeTags);
    if(school.sector==='private'&&school.religiousOrientation){const affiliation=el('p','sf-result-meta');affiliation.append(document.createTextNode('Reported affiliation: '),link(school.religiousOrientation,school.affiliationSourceUrl));card.append(affiliation);}
    if(school.magnet===true){const note=el('p','sf-result-meta');note.append(link(school.programName||'Verified magnet-school listing',school.programSourceUrl));card.append(note);}
    const address=[school.address,[school.city,school.state,school.zip].filter(Boolean).join(', ')].filter(Boolean).join(' · ');
    card.append(el('p','sf-result-address',address||'Campus address is unavailable in the linked directory.'));
    if(school.campusNote)card.append(el('p','sf-campus-note',school.campusNote));
    if(school.distance!==null)card.append(el('p','sf-result-distance',distanceNote(school)));
    if(home&&hasCampus(school))card.append(drivingPanel(school));
    if(school.virtual===true)card.append(el('p','sf-result-meta','Listed online school. The directory address is not shown as a campus.'));
    else if(!hasCampus(school))card.append(el('p','sf-result-meta','Location not confirmed; list only.'));
    if(school.insight)card.append(insightPanel(school));
    const actions=el('div','sf-result-actions');
    if(school.reportUrl)actions.append(link('Read school report ↗',school.reportUrl));
    if(hasCampus(school)) {const show=el('button','sf-text-button','Show on map ↗');show.type='button';show.addEventListener('click',()=>showSchool(school));actions.append(show);}
    if(school.website)actions.append(link('School website ↗',school.website));
    else if(school.resourceSourceUrl)actions.append(link('Official resource ↗',school.resourceSourceUrl));
    if(school.admissionsUrl)actions.append(link('Admissions & enrollment ↗',school.admissionsUrl));
    if(hasCampus(school))actions.append(directionsButton(school));
    actions.append(link('Source directory ↗',school.sourceUrl));card.append(actions);
    card.append(el('p','sf-result-meta',`${school.sourceKind==='official-school'?'School source':'Directory'}: ${school.sourceYear}${school.magnet===true&&school.programSourceYear ? ' · Program source: '+school.programSourceYear : ''}`));
    return card;
  }
  function render() {
    const pages=Math.max(1,Math.ceil(current.length/pageSize));pageNumber=Math.min(pageNumber,pages-1);
    get('[data-sf-count]').textContent=`${current.length} school record${current.length===1?'':'s'}`;
    const mapped=current.filter(hasCampus).length;
    let summary=`${mapped} mapped · ${current.length-mapped} list only`;
    if(home)summary+=applied.radius==='all'?' · distances from your searched address':` · within ${applied.radius} straight-line miles of your searched address`;
    else if(applied.zip)summary+=applied.radius==='exact'?` · ZIP ${applied.zip}`:applied.radius==='all'?` · distances from ZIP ${applied.zip}`:` · within ${applied.radius} miles of ${applied.zip}`;
    if(bounds)summary+=' · within selected map area';
    get('[data-sf-summary]').textContent=summary;
    get('[data-sf-clear-bounds]').hidden=!bounds;
    const fragment=document.createDocumentFragment();
    if(!current.length){const empty=el('div','sf-empty');empty.append(el('h3','','No schools match these filters.'),el('p','','Try a wider distance, another school type, or reset the filters to explore all covered areas.'));fragment.append(empty);}
    else for(const school of current.slice(pageNumber*pageSize,(pageNumber+1)*pageSize))fragment.append(makeCard(school));
    results.replaceChildren(fragment);results.scrollTop=0;
    get('[data-sf-prev]').disabled=pageNumber===0;get('[data-sf-next]').disabled=pageNumber>=pages-1;
    get('[data-sf-page]').textContent=current.length?`${pageNumber*pageSize+1}–${Math.min(current.length,(pageNumber+1)*pageSize)} of ${current.length}`:'0 results';
    get('[data-sf-announcement]').textContent=`${current.length} matching school records. ${summary}.`;
  }
  const pause=()=>new Promise(resolve=>requestAnimationFrame(resolve));
  const loadedScripts=new Map();
  const loadScript=src=>{
    if(loadedScripts.has(src))return loadedScripts.get(src);
    const task=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;const timer=setTimeout(()=>{script.remove();loadedScripts.delete(src);reject(Error('Map library timed out'));},15000);script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=()=>{clearTimeout(timer);script.remove();loadedScripts.delete(src);reject(Error('Map library could not load'));};document.head.append(script);});
    loadedScripts.set(src,task);return task;
  };
  function addStyle(href) {if(!document.querySelector(`link[href="${href}"]`)){const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=href;document.head.append(sheet);}}
  function openMap() {
    if(map)return Promise.resolve(true);
    if(mapOpening)return mapOpening;
    mapOpening=initializeMap().finally(()=>{mapOpening=null;});
    return mapOpening;
  }
  async function initializeMap() {
    const button=get('[data-sf-load-map]');button.disabled=true;button.textContent='Opening map…';
    try{
      addStyle('/assets/vendor/leaflet/leaflet.css');
      addStyle('/assets/vendor/leaflet/markercluster/MarkerCluster.css');
      await loadScript('/assets/vendor/leaflet/leaflet.js');
      await loadScript('/assets/vendor/leaflet/markercluster/leaflet.markercluster.js');
      get('#sf-map').hidden=false;get('[data-sf-map-gate]').hidden=true;await pause();
      const L=window.L;
      map=L.map('sf-map',{scrollWheelZoom:false,minZoom:6,maxZoom:18,zoomAnimation:!matchMedia('(prefers-reduced-motion: reduce)').matches}).setView([30.57,-87.02],9);
      // Standard viewport tiles only. Browser caching and origin Referer are retained.
      const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'}).addTo(map);
      let failures=0;
      tiles.on('tileerror',()=>{if(++failures>=2)get('[data-sf-map-status]').textContent='Some map tiles are unavailable. School markers and the complete filtered list still work.';});
      tiles.on('tileload',()=>{failures=0;get('[data-sf-map-status]').textContent='';});
      clusters=L.markerClusterGroup({showCoverageOnHover:false,removeOutsideVisibleBounds:true,animate:!matchMedia('(prefers-reduced-motion: reduce)').matches,maxClusterRadius:42,iconCreateFunction:cluster=>{
        const count=cluster.getChildCount();
        const icon=L.divIcon({html:String(count),className:'sf-marker-cluster',iconSize:[38,38]});
        const createIcon=icon.createIcon;
        icon.createIcon=function(oldIcon){const node=createIcon.call(this,oldIcon);node.setAttribute('aria-label',`${count} school records. Zoom to expand.`);return node;};
        return icon;
      }});
      map.addLayer(clusters);L.control.scale({imperial:true,metric:false,position:'bottomleft'}).addTo(map);
      get('[data-sf-map-tools]').hidden=false;get('[data-sf-fit]').hidden=false;
      renderMap(true);
      const resize=new ResizeObserver(()=>map.invalidateSize({pan:false}));resize.observe(get('#sf-map'));
      return true;
    }catch(error){
      if(map){map.remove();map=null;}
      clusters=null;homeMarker=null;radiusLayer=null;markers.clear();
      get('#sf-map').hidden=true;get('[data-sf-map-gate]').hidden=false;
      get('[data-sf-map-tools]').hidden=true;get('[data-sf-fit]').hidden=true;
      get('[data-sf-map-status]').textContent='The map could not load. Your school results are still available. Try opening the map again.';
      button.textContent='Try opening the map again';return false;
    }finally{button.disabled=false;}
  }
  function insightPanel(school) {
    const insight=school.insight, details=el('details','sf-school-insight');
    details.append(el('summary','',insight.kind==='editorial'?'School perspective':'School planning notes'));
    const body=el('div','sf-school-insight-body');
    body.append(el('strong','',insight.title),el('p','',insight.text));
    if(insight.detailUrl)body.append(link('Read the full school perspective ↗',insight.detailUrl));
    else body.append(el('small','','Based on directory information, not a campus review. Confirm current offerings directly.'));
    if(insight.sourceUrl)body.append(link(insight.kind==='editorial'?'School source ↗':'Directory / program source ↗',insight.sourceUrl));
    details.append(body);return details;
  }
  function popupFor(school) {
    const content=el('div'),heading=el('div','sf-popup-school-heading');heading.append(gradeBadge(school),el('h3','',school.name));content.append(heading,el('p','',tags(school).join(' · ')),el('p','',gradeNote(school)),el('p','',[school.address,school.city,school.state,school.zip].filter(Boolean).join(', ')));
    if(school.religiousOrientation){const affiliation=el('p');affiliation.append(document.createTextNode('Reported affiliation: '),link(school.religiousOrientation,school.affiliationSourceUrl));content.append(affiliation);}
    if(school.campusNote)content.append(el('p','',school.campusNote));
    if(school.distance!==null)content.append(el('p','sf-popup-distance',distanceNote(school)));
    if(home&&hasCampus(school))content.append(drivingPanel(school));
    if(school.magnet===true)content.append(el('p','',`${school.magnetType==='program'?'Magnet program':'Magnet school'}${school.programName?': '+school.programName:''}`));
    if(school.reportUrl)content.append(link('Read the school report ↗',school.reportUrl),el('br'));
    if(school.website)content.append(link('School website ↗',school.website),el('br'));
    else if(school.resourceSourceUrl)content.append(link('Official resource ↗',school.resourceSourceUrl),el('br'));
    if(school.admissionsUrl)content.append(link('Admissions & enrollment ↗',school.admissionsUrl),el('br'));
    content.append(directionsButton(school),el('br'));
    content.append(link('Open source directory ↗',school.sourceUrl));return content;
  }
  function directionsButton(school){
    const button=el('button','sf-text-button','Driving directions ↗');button.type='button';
    button.addEventListener('click',()=>{
      const url=new URL('https://www.google.com/maps/dir/');
      url.searchParams.set('api','1');url.searchParams.set('destination',[school.name,school.address,school.city,school.state,school.zip].filter(Boolean).join(', '));url.searchParams.set('travelmode','driving');
      if(home)url.searchParams.set('origin',`${home.lat},${home.lng}`);
      window.open(url.href,'_blank','noopener,noreferrer');
    });return button;
  }
  function highlight(school) {
    selectedId=school.id;
    const index=current.findIndex(s=>s.id===school.id);if(index<0)return;
    pageNumber=Math.floor(index/pageSize);render();
    const card=[...results.querySelectorAll('[data-school-id]')].find(card=>card.dataset.schoolId===school.id);
    if(card)results.scrollTop=card.offsetTop-results.offsetTop;
  }
  function renderMap(fit=false) {
    if(!map)return;const L=window.L;
    clusters.clearLayers();markers.clear();
    for(const school of current.filter(hasCampus)) {
      const badge=schoolBadgeDescriptor(school),markerLabel=`${school.name}: ${tags(school).join(' · ')}. ${badge.description}`;
      const icon=L.divIcon({className:'sf-marker',html:`<span class="sf-grade sf-grade--${badge.tone}" aria-hidden="true"><b>${badge.glyph}</b></span>`,iconSize:[32,36],iconAnchor:[16,32]});
      const createIcon=icon.createIcon;
      if(typeof createIcon==='function')icon.createIcon=function(oldIcon){const node=createIcon.call(this,oldIcon);node.setAttribute('aria-label',markerLabel);return node;};
      const marker=L.marker([school.lat,school.lng],{title:markerLabel,alt:markerLabel,keyboard:true,icon});
      marker.bindPopup(()=>popupFor(school));marker.on('click',()=>highlight(school));markers.set(school.id,marker);clusters.addLayer(marker);
    }
    if(radiusLayer){radiusLayer.remove();radiusLayer=null;}
    if(homeMarker){homeMarker.remove();homeMarker=null;}
    if(home){
      const popup=el('div','sf-home-popup');popup.setAttribute('data-clarity-mask','true');popup.dataset.private='true';popup.append(el('strong','','Your comparison point'),el('p','',home.label),el('small','','Approximate Census address point. Distances are straight-line estimates, not driving miles.'));
      homeMarker=L.marker([home.lat,home.lng],{title:'Your searched home address',alt:'Your searched home address',keyboard:true,zIndexOffset:1000,icon:L.divIcon({className:'sf-home-marker',html:'<span aria-hidden="true">⚑</span>',iconSize:[40,44],iconAnchor:[8,42]})}).addTo(map).bindPopup(popup);
    }
    const center=home||(applied.zip&&applied.radius!=='exact'?data.zipCenters[applied.zip]:null);
    if(center&&applied.radius!=='all')radiusLayer=L.circle([center.lat,center.lng],{radius:Number(applied.radius)*1609.344,color:home?'#a52f3b':'#9c762d',weight:2,fillColor:home?'#a52f3b':'#c9a84c',fillOpacity:.05,interactive:false}).addTo(map);
    get('[data-sf-map-count]').textContent=`${markers.size} mapped locations`;
    if(fit)fitMap();
  }
  function fitMap() {
    if(!map)return;
    if(radiusLayer){map.fitBounds(radiusLayer.getBounds(),{padding:[25,25],maxZoom:13});return;}
    const points=[...markers.values()].map(marker=>marker.getLatLng());if(homeMarker)points.push(homeMarker.getLatLng());
    if(points.length)map.fitBounds(window.L.latLngBounds(points),{padding:[35,35],maxZoom:14});
  }
  async function showSchool(school) {
    const sequence=++schoolSelectionSequence;
    if(!await openMap())return;
    if(sequence!==schoolSelectionSequence)return;
    const marker=markers.get(school.id);if(!marker)return;
    get('#sf-map-panel').scrollIntoView({block:'nearest',behavior:'auto'});
    clusters.zoomToShowLayer(marker,()=>{if(sequence!==schoolSelectionSequence)return;marker.openPopup();highlight(school);});
  }
  let debounce, selectingDirectorySchool=false;
  form.addEventListener('submit',event=>{event.preventDefault();clearTimeout(debounce);if(!apply())get('#sf-zip').focus();});
  form.addEventListener('input',event=>{if(event.target.matches('input')){if(event.target.id==='sf-zip'&&(home||addressRequest)){clearHome({clearInput:true,message:'Using ZIP search. Submit a home address to compare from a home instead.'});bounds=null;apply({fit:false});}clearTimeout(debounce);debounce=setTimeout(()=>apply(),220);}});
  // Text inputs already update on input. Re-rendering on their blur/change event
  // would remove a clicked result button between pointerdown and click.
  form.addEventListener('change',event=>{if(event.target.matches('select')){clearTimeout(debounce);apply();}});
  form.addEventListener('reset',()=>{clearTimeout(debounce);bounds=null;clearHome({clearInput:true});if(!selectingDirectorySchool)setTimeout(()=>apply(),0);});
  for(const button of root.querySelectorAll('[data-sf-type-choice]'))button.addEventListener('click',()=>{clearTimeout(debounce);get('#sf-type').value=button.dataset.sfTypeChoice;if(['private','christian'].includes(button.dataset.sfTypeChoice))get('#sf-grade').value='all';apply();});
  for(const anchor of document.querySelectorAll('[data-sf-school-link]'))anchor.addEventListener('click',async event=>{const school=data.schools.find(s=>s.id===anchor.dataset.sfSchoolLink);if(!school)return;event.preventDefault();clearTimeout(debounce);selectingDirectorySchool=true;form.reset();selectingDirectorySchool=false;bounds=null;get('#sf-query').value=school.name;apply();root.scrollIntoView({block:'start'});if(hasCampus(school))await showSchool(school);else{results.scrollIntoView({block:'center'});highlight(school);}});
  get('[data-sf-prev]').addEventListener('click',()=>{pageNumber=Math.max(0,pageNumber-1);render();});
  get('[data-sf-next]').addEventListener('click',()=>{pageNumber++;render();});
  get('[data-sf-load-map]').addEventListener('click',openMap);
  get('[data-sf-fit]').addEventListener('click',fitMap);
  get('[data-sf-clear-bounds]').addEventListener('click',()=>{bounds=null;apply();});
  get('[data-sf-search-view]').addEventListener('click',()=>{const view=map.getBounds();bounds={south:view.getSouth(),north:view.getNorth(),west:view.getWest(),east:view.getEast()};apply({fit:false});});
  apply();
  openMap();
}
