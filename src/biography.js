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
  militaryIntro: `${I.name} is a retired U.S. Air Force ${I.military.rank} and ${I.military.role} with ${I.military.yearsOfService} years of service and ${I.military.personalPcsMoves} personal PCS moves. He is a Realtor with ${I.brokerage.name}, licensed in Florida and Alabama, and leads The Costin Team.`,
  civilianIntro: `${I.name} helps buyers and sellers across Pensacola, the Emerald Coast and coastal Alabama. A Realtor with ${I.brokerage.name} and leader of The Costin Team, he is licensed in Florida and Alabama.`,
  qualifications: `Gregg holds a ${degreeNames} from the ${university}. He is also a ${drone.shortName}.`,
  civilianCareer: `Before real estate, Gregg served for ${I.military.yearsOfService} years in the U.S. Air Force, retiring as a ${I.military.rank} and ${I.military.role}. His ${I.military.personalPcsMoves} personal PCS moves inform the relocation perspective he brings to clients moving across town, across the state line or from farther away.`,
  militaryPurpose: 'His military experience shapes the practical questions he helps relocating households work through: where to live, how a school transfer affects a move, how to compare commuting options and which housing questions to resolve before a report date.',
};
BIOGRAPHY.militaryHeading = BIOGRAPHY.headingStart + BIOGRAPHY.headingEnd;

export function civilianBiographyHtml() {
  return `<section data-profile-biography aria-labelledby="gregg-biography"><h2 id="gregg-biography">Meet Gregg Costin</h2><p>${BIOGRAPHY.civilianIntro}</p><p>${BIOGRAPHY.qualifications}</p><p>His real-estate work includes helping clients compare properties, plan a sale and understand the practical considerations of Gulf Coast homeownership.</p><p>${BIOGRAPHY.civilianCareer}</p><p>For military-specific planning, his companion site, <a href="https://pensacolamilitaryhousing.com/">PensacolaMilitaryHousing.com</a>, brings together installation guides, PCS resources and housing information.</p><p><a href="/buy">Plan a home purchase</a> · <a href="/sell">Plan a home sale</a> · <a href="/neighborhoods">Compare Gulf Coast communities</a></p></section>`;
}
