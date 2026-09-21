// Central place for the placeholder copy used across the site.
// Swap these values out once you're ready to make the site your own —
// nothing else in the code needs to change.

export const business = {
  name: "DS Training",
  trainerName: "David",
  tagline: "Strength, coached with care.",
  location: "Chiswick & Bush Hill Park",
  email: "davidscott_pt@outlook.com",
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
    name: "Single Session",
    price: "£60",
    period: "session",
    description: "One 55-minute 1:1 session — ideal if you want to try a session or top up between packages.",
    features: ["55-minute 1:1 session", "Fully coached, tailored to you", "No commitment"],
    cta: "Book a session",
    highlight: false,
  },
  {
    name: "Intro Offer",
    price: "£145",
    period: "3 sessions",
    description: "New to training with me? Start here — three 55-minute sessions to build your foundation.",
    features: [
      "3 x 55-minute sessions",
      "Works out at £48.33 per session",
      "The best way to get started",
    ],
    cta: "Claim the intro offer",
    highlight: true,
  },
  {
    name: "5 Session Package",
    price: "£280",
    period: "5 sessions",
    description: "A committed block of sessions at a better rate per session.",
    features: ["5 x 55-minute sessions", "£56 per session", "Book sessions as they suit you"],
    cta: "Get this package",
    highlight: false,
  },
  {
    name: "10 Session Package",
    price: "£540",
    period: "10 sessions",
    description: "Our best value package for clients training consistently.",
    features: [
      "10 x 55-minute sessions",
      "£54 per session — best value",
      "Book sessions as they suit you",
    ],
    cta: "Get this package",
    highlight: false,
  },
];

export const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/pricing", label: "Pricing" },
  { to: "/testimonials", label: "Testimonials" },
  { to: "/booking", label: "Bookings" },
  { to: "/members", label: "Members" },
];
