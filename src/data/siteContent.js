// Central place for the placeholder copy used across the site.
// Swap these values out once you're ready to make the site your own —
// nothing else in the code needs to change.

export const business = {
  name: "DS Training",
  trainerName: "David",
  tagline: "Strength, coached with care.",
  location: "Chiswick & Bush Hill Park",
  email: "hello@dstraining.example",
  phone: "07479 256790",
  instagram: "https://instagram.com",
};

export const trainingLocations = [
  {
    id: "chiswick",
    name: "Chiswick",
    copy: "In-person sessions in Chiswick.",
    photo: "/images/chiswick.jpg",
  },
  {
    id: "bush-hill-park",
    name: "Bush Hill Park",
    copy: "In-person sessions in Bush Hill Park.",
    photo: "/images/bush-hill-park.jpg",
  },
];

export const prompts = [
  "Want to feel better in your everyday?",
  "Ready to build strength that actually lasts?",
  "Tired of programmes that don't fit your life?",
  "What would it feel like to move without pain again?",
  "Imagine finishing a session feeling stronger, not sore.",
];

export const testimonials = [
  {
    quote:
      "I used to go the gym regularly, but I found myself doing the same things over and over again, with no real structure. I was getting bored, and more importantly, I wasn't seeing the progress I wanted. David was incredibly quick to identify my strengths and weaknesses and put together a personalised training plan that has delivered amazing results in a very short space of time. What I particularly like is that the plan is constantly evolving as my strength and fitness improve, so I'm always being challenged and making progress. On top of all that, David is such a genuinely nice person to spend time with. I now actually look forward to going to the gym, which I never thought I'd say! I'm loving the results and would highly recommend David to anyone looking for a knowledgeable, motivating and personable personal trainer.",
    name: "Del S.",
    context: "In-person client",
  },
  {
    quote:
      "I came in barely able to touch my toes. Six months on I'm deadlifting more than I weigh and my back pain is gone.",
    name: "Sarah M.",
    context: "Client since 2023",
  },
  {
    quote:
      "The programming actually fits around my job and my knees. First trainer who's listened more than they've talked.",
    name: "James O.",
    context: "Online coaching client",
  },
  {
    quote:
      "I was intimidated by gyms my whole life. This is the first time training has felt like it was built for me.",
    name: "Priya K.",
    context: "In-person client",
  },
  {
    quote:
      "Twelve weeks in and I've got more energy for my kids than I've had in years. That's the real win.",
    name: "Daniel R.",
    context: "Client since 2024",
  },
  {
    quote:
      "Every session has a purpose. Nothing feels like it's just there to make me tired.",
    name: "Chloe B.",
    context: "In-person client",
  },
  {
    quote:
      "Booking a session and actually getting a plan for the week took ten minutes. It's the easiest part of my routine now.",
    name: "Marcus T.",
    context: "Online coaching client",
  },
];

// Short excerpts for the home page's scroll-in testimonial quotes — cut down
// from the full testimonials above so they read as punchy pull-quotes.
export const homeQuotes = [
  {
    quote:
      "I came in barely able to touch my toes. Six months on I'm deadlifting more than I weigh and my back pain is gone.",
    name: "Sarah M.",
    context: "Client since 2023",
  },
  {
    quote: "I now actually look forward to going to the gym, which I never thought I'd say.",
    name: "Del S.",
    context: "In-person client",
  },
];

export const pricingPlans = [
  {
    name: "Free Consultation",
    price: "£0",
    period: "one-off",
    description:
      "A no-pressure conversation about where you are, where you want to be, and whether we're a good fit.",
    features: [
      "20–30 minutes, in person, by phone, or on video",
      "Movement & goals check-in",
      "A clear next step, whatever you decide",
    ],
    cta: "Book your free consultation",
    highlight: false,
  },
  {
    name: "1:1 In Person",
    price: "£55",
    period: "per session",
    description: "Fully coached sessions, tailored programming, all equipment provided.",
    features: [
      "60-minute sessions",
      "Bespoke programme, adjusted every week",
      "Nutrition & lifestyle guidance included",
      "Packages of 6 or 12 sessions available",
    ],
    cta: "Book a session",
    highlight: true,
  },
  {
    name: "Online Coaching",
    price: "£120",
    period: "per month",
    description: "Remote programming and check-ins for people who want structure, not a gym visit.",
    features: [
      "Custom training plan, updated monthly",
      "Weekly check-ins & form review",
      "Direct messaging support",
      "Train anywhere — home or gym",
    ],
    cta: "Get started",
    highlight: false,
  },
];

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/pricing", label: "Pricing" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/booking", label: "Bookings" },
];
