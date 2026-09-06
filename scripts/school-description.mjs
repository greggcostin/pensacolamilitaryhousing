// Choose complete sentences instead of cutting text or school names at a character limit.
export function schoolDescription(school, county) {
  const name = school.display;
  const grade = school.g2026 ? `2025-26 Florida DOE grade: ${school.g2026}.` : 'No 2025-26 Florida DOE grade reported.';
  const candidates = [
    `${name}, ${county}. ${grade} View grade history and achievement data; confirm attendance zones with the district.`,
    `${name}. ${grade} Explore official grade history and achievement data, plus questions to ask the district about attendance zones.`,
    `${name}. ${grade} Review official grade history, achievement data, and district attendance-zone guidance.`,
    `${name}: review official Florida DOE grades, achievement data, and questions to ask about current attendance zones.`,
  ];
  const description = candidates.find(text => text.length >= 120 && text.length <= 165);
  if (!description) throw new Error(`Write a complete school description for ${name}; none fits 120-165 characters.`);
  return description;
}
