// Presentation and next-step copy for the civilian site's existing pages.
// The renderer retains each page's H1, lead, facts, links, forms, and schema.
// `photo` is an optional fallback; never replace a page's existing editorial image.

const contact = '/contact';
const phone = 'tel:+18502665005';
const portrait = '/images/gregg-navy-no-tie.jpg';
const coast = '/images/navarre.jpg';
const valuation = 'https://greggcostin.realscout.com/whats-my-home-worth';
const homeSearch = 'https://greggcostin.realscout.com/onboarding';

// Existing real photographs, with intrinsic dimensions checked from the files.
// Captions and licenses remain sourced from content/blog/image-credits.json.
// Give the hubs distinct places and textures; preserve original article imagery.
const photoDetails = {
  [portrait]: {
    photoWidth: 1600, photoHeight: 2182,
    photoAlt: 'Gregg Costin in a navy jacket, Realtor licensed in Florida and Alabama'
  },
  [coast]: {
    photoWidth: 1600, photoHeight: 1067,
    photoAlt: 'White sand dunes and sea oats on Santa Rosa Island, Florida'
  },
  '/images/perdido-waterfront.jpg': {
    photoWidth: 1600, photoHeight: 900,
    photoAlt: 'Archival aerial view of Perdido Key and its surrounding waterways, photographed by Curtis Palmer in 2010'
  },
  '/images/three-mile-bridge.jpg': {
    photoWidth: 1600, photoHeight: 1200,
    photoAlt: 'Both spans of the Three Mile Bridge across Pensacola Bay, looking north toward Pensacola'
  },
  '/images/palafox-street.jpg': {
    photoWidth: 1600, photoHeight: 1200,
    photoAlt: 'A brick walkway, trees, and historic buildings along Palafox Street in downtown Pensacola'
  },
  '/images/destin.jpg': {
    photoWidth: 1600, photoHeight: 836,
    photoAlt: 'Boats, waterfront buildings, and turquoise water at Destin Harbor, Florida'
  },
  '/images/orange-beach-wharf.jpg': {
    photoWidth: 1080, photoHeight: 600,
    photoAlt: 'The illuminated Ferris wheel and palm-lined Main Street at The Wharf in Orange Beach, Alabama'
  }
};

const pages = {
  '/buy': {
    family: 'service',
    eyebrow: 'Your next chapter starts here',
    primary: { label: 'Explore homes', href: '/search' },
    secondary: { label: 'Plan your purchase', href: contact },
    support: {
      title: 'A home search with a plan.',
      text: 'Share your timeline, priorities, and questions. We can help you decide what to look for and what to ask before you make an offer.',
      href: contact, label: 'Talk about buying'
    }
  },
  '/sell': {
    family: 'service',
    eyebrow: 'A thoughtful plan for your next move',
    primary: { label: 'Start your home valuation', href: valuation },
    secondary: { label: 'Discuss selling', href: contact },
    support: {
      title: 'Know where to begin.',
      text: 'Start with your home, your timeline, and your goals. Then discuss pricing, preparation, and the steps toward listing.',
      href: contact, label: 'Plan your sale'
    }
  },
  '/team': {
    family: 'team',
    eyebrow: 'The people in your corner',
    primary: { label: 'Talk with our team', href: contact },
    secondary: { label: 'Read client reviews', href: '/reviews' },
    support: {
      title: 'Let us get to know your plans.',
      text: 'Buying, selling, or preparing for a move? Tell us what matters to you and where you would like help.',
      href: contact, label: 'Start a conversation'
    }
  },
  '/contact': {
    family: 'contact',
    eyebrow: 'A conversation about what comes next',
    primary: { label: 'Send a message', href: '#inquiry-form-c' },
    secondary: { label: 'Call Gregg', href: phone },
    support: {
      title: 'Still gathering information?',
      text: 'Explore answers to common questions about buying, selling, and working with our team.',
      href: '/faq', label: 'Browse common questions'
    },
    photo: portrait
  },
  '/reviews': {
    family: 'reviews',
    eyebrow: 'Local relationships. Personal experiences.',
    primary: { label: 'Talk about your move', href: contact },
    secondary: { label: 'Meet the team', href: '/team' },
    support: {
      title: 'Your plans deserve a conversation.',
      text: 'Share what you are hoping to do next. We will talk through your questions and how our team can help.',
      href: contact, label: 'Tell us about your move'
    },
    photo: portrait
  },
  '/search': {
    family: 'search',
    eyebrow: 'Find your place on the Gulf Coast',
    primary: { label: 'Set up your home search', href: homeSearch },
    secondary: { label: 'Get help with your search', href: contact },
    support: {
      title: 'The right questions make a difference.',
      text: 'Have a shortlist or a property in mind? Talk through the location, ownership costs, and next steps with our team.',
      href: contact, label: 'Talk through your shortlist'
    },
    photo: '/images/destin.jpg'
  },
  '/neighborhoods': {
    family: 'directory',
    eyebrow: 'Many places. One personal decision.',
    primary: { label: 'Explore homes', href: '/search' },
    secondary: { label: 'Talk through your priorities', href: contact },
    support: {
      title: 'Connect the place with your plans.',
      text: 'Compare housing, travel times, and ownership costs around the coast. Bring your questions and we can help you work through the details.',
      href: contact, label: 'Plan your search'
    },
    photo: '/images/perdido-waterfront.jpg'
  },
  '/resources': {
    family: 'directory',
    eyebrow: 'Good questions deserve useful answers',
    primary: { label: 'Explore the buyer guide', href: '/resources/first-time-home-buyer' },
    secondary: { label: 'Ask a question', href: contact },
    support: {
      title: 'Make the information work for you.',
      text: 'A guide is a starting point. Talk through how the details apply to your home, your search, or your next move.',
      href: contact, label: 'Talk through the details'
    },
    photo: '/images/three-mile-bridge.jpg'
  },
  '/blog': {
    family: 'directory',
    eyebrow: 'A local perspective on the bigger picture',
    primary: { label: 'Browse homeowner resources', href: '/resources' },
    secondary: { label: 'Ask our team', href: contact },
    support: {
      title: 'From information to a decision.',
      text: 'Have a question about something you read? Bring it to our team and talk through what it means for your plans.',
      href: contact, label: 'Start a conversation'
    },
    photo: '/images/palafox-street.jpg'
  },
  '/schools': {
    family: 'directory',
    eyebrow: 'Official information for your own research',
    primary: { label: 'Browse elementary schools', href: '#elementary' },
    secondary: { label: 'Find official resources', href: '/resources/useful-links' },
    support: {
      title: 'Look closely at the details.',
      text: 'Use the reports as a starting point, then confirm current attendance zones, enrollment, and programs directly with the school district.',
      href: '/resources/useful-links', label: 'Open official resources'
    }
  },
  '/gulf-shores-orange-beach': {
    family: 'area',
    eyebrow: 'Gulf Shores + Orange Beach · Coastal Alabama',
    primary: { label: 'Plan your Alabama home search', href: contact },
    secondary: { label: 'Explore more communities', href: '/neighborhoods' },
    support: {
      title: 'Take a closer look at the Alabama coast.',
      text: 'Talk through homes, condos, and the ownership details that matter to your plans in Gulf Shores and Orange Beach.',
      href: contact, label: 'Discuss the Alabama coast'
    },
    photo: '/images/orange-beach-wharf.jpg'
  },
  '/faq': {
    family: 'information',
    eyebrow: 'Clear answers for your next move',
    primary: { label: 'Ask your own question', href: contact },
    secondary: { label: 'Explore the resource library', href: '/resources' },
    support: {
      title: 'Every move comes with its own questions.',
      text: 'Tell us what you are working through. We can help you identify the next step and the information you need.',
      href: contact, label: 'Talk with our team'
    },
    photo: coast
  },
  '/privacy': {
    family: 'information',
    eyebrow: 'Your information. Your choices.',
    primary: { label: 'Ask about privacy', href: contact },
    secondary: { label: 'Return home', href: '/' },
    support: {
      title: 'Questions about your information?',
      text: 'Contact our team with a question or request about the information you share through this website.',
      href: contact, label: 'Contact our team'
    }
  },
  '/accessibility': {
    family: 'information',
    eyebrow: 'Help accessing the information you need',
    primary: { label: 'Request assistance', href: contact },
    secondary: { label: 'Call our team', href: phone },
    support: {
      title: 'Let us know where you need help.',
      text: 'If you have difficulty using a page or feature, tell us what you were trying to do so we can assist.',
      href: contact, label: 'Get in touch'
    }
  },
  '/photo-credits': {
    family: 'information',
    eyebrow: 'The people behind the pictures',
    primary: { label: 'Return to the coast', href: '/' },
    secondary: { label: 'Explore the communities', href: '/neighborhoods' },
    support: {
      title: 'A closer look at our coast.',
      text: 'Explore the community guides to learn more about the places featured across the website.',
      href: '/neighborhoods', label: 'Explore the area guides'
    }
  },
  '/404': {
    family: 'notfound',
    eyebrow: 'Let us point you in the right direction',
    primary: { label: 'Return home', href: '/' },
    secondary: { label: 'Search homes', href: '/search' },
    support: {
      title: 'Looking for something specific?',
      text: 'Contact our team for help finding a guide, a community, or information about your next move.',
      href: contact, label: 'Ask for help'
    }
  }
};

const families = {
  area: {
    family: 'area',
    eyebrow: 'Get to know the coast, one community at a time',
    primary: { label: 'Explore homes', href: '/search' },
    secondary: { label: 'Compare area guides', href: '/neighborhoods' },
    support: {
      title: 'See how the details fit your plans.',
      text: 'Talk through housing options, travel times, and ownership costs with a team that works across the coast.',
      href: contact, label: 'Talk about this area'
    }
  },
  article: {
    family: 'article',
    eyebrow: 'Local knowledge for the decisions ahead',
    primary: { label: 'Ask about your situation', href: contact },
    secondary: { label: 'Explore more resources', href: '/resources' },
    support: {
      title: 'Turn a useful read into a next step.',
      text: 'Have a question about how this applies to your plans? Bring the details to our team and talk through what comes next.',
      href: contact, label: 'Ask our team'
    }
  },
  school: {
    family: 'school',
    eyebrow: 'School facts to support your research',
    primary: { label: 'Browse all school reports', href: '/schools' },
    secondary: { label: 'Find official resources', href: '/resources/useful-links' },
    support: {
      title: 'Confirm the details directly.',
      text: 'Check current attendance zones, enrollment, and programs with the school district. A property address is the starting point for assignment questions.',
      href: '/resources/useful-links', label: 'Open official resources'
    }
  },
  information: {
    family: 'information',
    eyebrow: 'The Costin Team · Here to help',
    primary: { label: 'Contact our team', href: contact },
    secondary: { label: 'Return home', href: '/' },
    support: {
      title: 'Find the information you need.',
      text: 'Contact our team if you have a question about this page or need help with your next move.',
      href: contact, label: 'Ask a question'
    }
  }
};

function normalizePath(path) {
  let value = String(path ?? '').replaceAll('\\', '/');
  if (/^https?:\/\//i.test(value)) value = new URL(value).pathname;
  value = value.split(/[?#]/, 1)[0];
  value = value.replace(/^.*?civilian-site\//i, '');
  value = '/' + value.replace(/^\/+|\/+$/g, '').replace(/\.html$/i, '');
  return value === '/index' ? '/' : value;
}

/**
 * Accepts a clean route, a URL, or a civilian-site HTML file path.
 * Returns null for the homepage. Every other path receives a complete design
 * record with family, eyebrow, two actions, and one contextual support block.
 * When photo is present, photoWidth/photoHeight/photoAlt describe that asset.
 */
export function getInteriorDesign(path) {
  const route = normalizePath(path);
  if (route === '/') return null;
  let design = pages[route];
  if (!design) {
    const family = route.startsWith('/neighborhoods/') ? 'area'
      : route.startsWith('/schools/') ? 'school'
      : /^\/(?:resources|blog)\//.test(route) ? 'article'
      : 'information';
    design = families[family];
  }
  // Keep callers from mutating shared defaults across successive pages.
  return {
    ...design,
    ...(photoDetails[design.photo] || {}),
    primary: { ...design.primary },
    secondary: { ...design.secondary },
    support: { ...design.support }
  };
}
