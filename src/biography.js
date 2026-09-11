// Public biography facts come from the same generated identity record as JSON-LD.
import { IDENTITY as I } from './entityData.js';

const degrees = I.credentials.filter(c => c.category === 'degree');
const degreeNames = degrees.map(c => c.shortName || c.name).join(' and a ');
const university = degrees[0]?.by.name;
const drone = I.credentials.find(c => c.name === 'FAA Part 107 Certified Drone Pilot');
if (degrees.length !== 2 || degrees.some(c => c.by.name !== university) || !drone) {
  throw new Error('The confirmed biography requires both degrees and the Part 107 credential.');
}

export const BIOGRAPHY = {
  headingStart: 'From the flight deck to your ',
  headingEnd: 'front door.',
  militaryIntro: `${I.name}'s U.S. Air Force career spanned ${I.military.careerLength}, from enlisted service to retirement as a ${I.military.rank}. He served as an ${I.military.role} and completed ${I.military.personalPcsMoves} personal PCS moves. He is a Realtor with ${I.brokerage.name}, licensed in Florida and Alabama, and leads The Costin Team.`,
  civilianIntro: `${I.name} helps buyers and sellers across Pensacola, the Emerald Coast and coastal Alabama. A Realtor with ${I.brokerage.name} and leader of The Costin Team, he is licensed in Florida and Alabama.`,
  qualifications: `Gregg holds a ${degreeNames} from the ${university}. He is also a ${drone.shortName}.`,
  civilianCareer: `Before real estate, Gregg completed a U.S. Air Force career spanning ${I.military.careerLength}, from enlisted service to retirement as a ${I.military.rank}. He served as an ${I.military.role}. His ${I.military.personalPcsMoves} personal PCS moves inform the relocation perspective he brings to clients moving across town, across the state line or from farther away.`,
  militaryPurpose: 'His military experience shapes the practical questions he helps relocating households work through: where to live, how a school transfer affects a move, how to compare commuting options and which housing questions to resolve before a report date.',
  storyOpening: "My journey into real estate didn't start with a lifelong passion for houses; it started with a vow.",
  clientOrigin: "When I bought my very first home early in my career, I was completely burned by a horrible agent. The experience left such a deep mark on me that I made a promise right then and there: I would self-educate to the absolute highest level so I would never have to rely on another real estate agent again. As I bought and sold properties across the entire United States during every military PCS move, I mastered the process from the ground up. I have experienced firsthand what it's like to have a terrible agent, which means I know exactly what it takes to be an exceptional one.",
  clientCommitment: "That experience sets the standard for how I serve my clients today: explain the details, research the property and market, prepare carefully for negotiations, and stay involved through closing. I want you to understand the trade-offs in each decision and have an advocate who takes your priorities seriously.",
  militaryFoundation: 'That standard of excellence is rooted deeply in my military background. Over the course of my career in the United States Air Force, I evolved from hands-on technical expertise to high-level strategic planning.',
  militaryTechnicalCareer: 'I began at the tip of the spear in nuclear deterrence as a 2M0 cruise missile technician, ensuring the readiness of payloads on the B-52 Stratofortress. After completing my studies at the University of Tampa, I commissioned as an officer and took to the skies. As a Navigator and Combat Systems Officer (CSO) aboard the E-3 AWACS, I managed complex tactical routing and electronic warfare across multiple deployments to combat zones including Iraq, Afghanistan, and Syria, as well as strategic hubs across the Middle East and the Pacific.',
  militaryLeadership: 'My career culminated in the senior echelons of military strategy as the Chief of Integrated Air and Missile Defense (IAMD) Plans for CENTCOM A5, where I architected theater-wide defense strategies to protect our forward-deployed forces.',
  teamPromise: 'Today, I bring that military planning experience to your home purchase or sale. We work through your priorities, budget and timeline, examine the property and market, and prepare for the decisions ahead. You get clear communication and an advocate who pays attention to the details that affect your move.',
  militaryPcsExperience: "When I say I understand the stress of a PCS move, I mean it. My family and I have lived it: packing up, finding homes from overseas, navigating schools and neighborhoods sight-unseen. Now I channel that experience into making your transition as smooth as possible.",
  militaryNetworks: 'I work with VeteranPCS, TIER 1 PCS, and the M.O.R.E. Network to support military moves. My Zillow profile provides client review history. Separately, my reported Pensacola MLS standing was #34 among 4,100+ Realtors by sales volume and transactions as of August 1, 2026.',
  civilianService: 'For buyers, Gregg brings local neighborhood research, ownership-cost planning and a clear offer strategy. For sellers, he combines comparable-sales pricing, professional property marketing and a plan for negotiations and closing.',
};
BIOGRAPHY.militaryHeading = BIOGRAPHY.headingStart + BIOGRAPHY.headingEnd;

export function civilianBiographyHtml() {
  return `<section data-profile-biography aria-labelledby="gregg-biography"><h2 id="gregg-biography">Meet Gregg Costin</h2><p>${BIOGRAPHY.civilianIntro}</p><p>${BIOGRAPHY.qualifications}</p><p>${BIOGRAPHY.civilianService}</p><p>${BIOGRAPHY.civilianCareer}</p><p>GreggCostin.com connects <a href="/neighborhoods">Gulf Coast neighborhood guides</a>, a <a href="/schools">school finder</a> and <a href="/mortgage-calculators">mortgage calculators</a> with practical buyer and seller guidance. For military-specific planning and Gregg's full military background, his companion site, <a href="https://pensacolamilitaryhousing.com/about">PensacolaMilitaryHousing.com</a>, brings together installation guides, PCS resources and housing information.</p><p><a href="/buy">Plan a home purchase</a> · <a href="/sell">Plan a home sale</a> · <a href="/contact">Talk with Gregg about your move</a></p></section>`;
}
