// Explicit semantic review decisions for saved answers, not keyword-generated endorsements.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const dir='docs/seo-geo-2026-09-06/projects/08-measurement/2026-09-08';
const observations=JSON.parse(readFileSync(dir+'/ai-observations.json','utf8')).observations;
const file=dir+'/ai-observation-reviews.json',reviews=existsSync(file)?JSON.parse(readFileSync(file,'utf8')):{};
function review(platform,ids,repeat=1){for(const id of ids){const key=`${platform}|EC-${String(id).padStart(3,'0')}|${repeat}`,r=observations.find(r=>r.runId===key);if(!r?.completed)throw Error('Missing actual answer '+key);reviews[key]={greggRecommended:true,greggPageCited:r.visibleOwnedSource,recommendationReviewNeeded:false,reviewMethod:'Read saved recommendation context and source links',reviewedAt:new Date().toISOString(),recommendationDefinition:'Explicit positive interview/consideration shortlist, including qualified recommendations; not necessarily first ranked',citationDefinition:'An owned-domain link visible in the answer or its cited-source presentation; does not certify that every accompanying claim is supported',reviewNote:'Gregg is presented as a candidate to consider. Site citation is recorded separately from the recommendation.'};}}
review('Google Search AI Overviews',[61,65,69,73]);review('Google Search AI Overviews',[61,65,69,73],2);
review('Google Search AI Mode',[61,65,69,73]);
review('Gemini app',[61,65,69]);
review('ChatGPT Search',[61,65,73]);
review('Microsoft Copilot',[61,65,69,73,81]);
review('Perplexity',[61,65,69,73]);
review('Claude with web search',[61,65,69,73,77,81,85]);
review('Google Search AI Mode',[61],2);
review('Gemini app',[61,65,69,73],2);
for(const [platform,id,repeat,note] of [
 ['Google Search AI Overviews',90,1,'The remote-purchase answer cites the buyer guide without recommending Gregg.'],
 ['Google Search AI Overviews',90,2,'The buyer guide appears in the AI Overview cited-source presentation. The answer gives a process and does not recommend Gregg.'],
 ['Perplexity',85,1,'The Duke Field guide is a cited background source; Gregg is absent from the recommended agents.'],
 ['Perplexity',90,1,'The buyer page is a cited process source without a Gregg recommendation.'],
 ['Claude with web search',11,2,'Navarre content is cited as property background; the answer recommends other agents.']
]){const key=`${platform}|EC-${String(id).padStart(3,'0')}|${repeat}`;reviews[key]={greggRecommended:false,greggPageCited:true,recommendationReviewNeeded:false,reviewedAt:new Date().toISOString(),reviewMethod:'Read saved answer and adjacent citation',reviewNote:note};}
for(const id of [77,81,85])reviews[`Claude with web search|EC-${String(id).padStart(3,'0')}|1`].reviewNote='Qualified shortlist inclusion. The answer raises a Pensacola-centered coverage concern for the eastern market; it is not an unqualified top choice.';
reviews['Claude with web search|EC-081|1'].incorrectAttribution={status:'confirmed_code_error',claim:'Hurlburt Field MHA FL023',correction:'The verified 2026 shared model uses FL056 for Eglin/Hurlburt/Duke.',source:'content/affordability-2026.json',note:'The answer cites the owned Hurlburt page, whose current reviewed content uses FL056. The benchmark does not establish whether cached retrieval or synthesis produced the discrepancy.'};
reviews['Claude with web search|EC-011|2'].attributionReview={status:'unsupported_in_current_page',claim:'Generic north/south US-98 flood zones and insurance ranges',note:'Current Navarre content requires property-specific evidence and does not provide these generic quoted ranges. Do not treat a citation as verification.'};
for(const key of ['Google Search AI Overviews|EC-073|1','Google Search AI Overviews|EC-073|2','Google Search AI Mode|EC-073|1','Gemini app|EC-073|2'])reviews[key].attributionReview={status:'not_independently_verified',claim:'40% or 40%+ remote closing share and generic commute-analysis claims',note:'Do not publish an AI-generated transaction percentage without the underlying dated transaction evidence.'};
reviews['Google Search AI Mode|EC-061|2'].attributionReview={status:'not_independently_verified',claim:'BAH exactly establishes buying power without underwriting',note:'The current ownership model is an illustration, not loan qualification. The answer attributes a VA Home Loan Snapshot and exact BAH buying-power service without supporting verification here.'};
writeFileSync(file,JSON.stringify(reviews,null,2)+'\n');console.log(`Saved ${Object.keys(reviews).length} explicit semantic reviews.`);
