export const EVENT_DATE = new Date('2026-10-26T12:00:00+05:30')
export const EVENT_DATES_DISPLAY = '26, 27 & 28 October 2026'

export const tracks = [
  { name: 'Hardware / IoT Track', icon: '⚙️', description: 'Build AI-powered solutions for diagnostics, drug discovery, and clinical decision support.', color: '#ffffff', gradient: 'from-zinc-800 via-zinc-900 to-black' },
  { name: 'AI / Software Track', icon: '💻', description: 'Innovate in biotechnology — from gene editing tools to synthetic biology platforms.', color: '#e5e7eb', gradient: 'from-neutral-800 via-neutral-900 to-black' },
  { name: 'HealthTech / Interoperability Track', icon: '🏥', description: 'Push the boundaries of brain-computer interfaces, neural imaging, and cognitive enhancement.', color: '#d1d5db', gradient: 'from-gray-800 via-gray-900 to-black' },
  { name: 'Advanced / Hybrid Track', icon: '🧪', description: 'Reimagine digital health infrastructure — EHR systems, telemedicine, and patient portals.', color: '#9ca3af', gradient: 'from-stone-800 via-stone-900 to-black' },
  { name: 'DragonForge Open', icon: '🐉', description: 'Open innovation track — build anything that revolutionizes healthcare. No limits.', color: '#f3f4f6', gradient: 'from-slate-800 via-slate-900 to-black' },
]

export const timelineData = [
  { day: 'Day 1 (26 Oct)', time: '08:00 AM', title: 'Gates Open — Registration', description: 'Check in, grab your swag kit, and meet your fellow warriors.', type: 'milestone' },
  { day: 'Day 1 (26 Oct)', time: '10:00 AM', title: 'Opening Ceremony', description: 'The dragon awakens. Keynote, track reveals, and rules of engagement.', type: 'ceremony' },
  { day: 'Day 1 (26 Oct)', time: '11:00 AM', title: 'Hacking Begins ⚔️', description: 'Forge your teams. Choose your path. Let the code flow.', type: 'action' },
  { day: 'Day 1 (26 Oct)', time: '08:00 PM', title: 'Mentor Round 1', description: 'Industry experts roam the halls — seek their wisdom.', type: 'support' },
  { day: 'Day 2 (27 Oct)', time: '02:00 AM', title: 'Midnight Fuel 🍜', description: 'Ramen station opens. The dragon feeds its warriors.', type: 'food' },
  { day: 'Day 2 (27 Oct)', time: '10:00 AM', title: 'Workshop: AI in Medicine', description: 'Deep-dive session on deploying ML models in clinical settings.', type: 'workshop' },
  { day: 'Day 2 (27 Oct)', time: '04:00 PM', title: 'Midpoint Check-in', description: 'Progress presentations. Get feedback. Pivot if needed.', type: 'milestone' },
  { day: 'Day 2 (27 Oct)', time: '09:00 PM', title: 'Night Owl Sessions', description: 'Special lightning talks and energy booster activities.', type: 'support' },
  { day: 'Day 3 (28 Oct)', time: '09:00 AM', title: 'Final Sprint 🏁', description: 'Last 4 hours. Polish, debug, and prepare your pitch.', type: 'action' },
  { day: 'Day 3 (28 Oct)', time: '01:00 PM', title: 'Submissions Close', description: 'Pencils down. Upload your project. Breathe.', type: 'milestone' },
  { day: 'Day 3 (28 Oct)', time: '02:00 PM', title: 'Demo & Judging', description: 'Present your creation to the council of judges.', type: 'ceremony' },
  { day: 'Day 3 (28 Oct)', time: '05:00 PM', title: 'Awards Ceremony 🏆', description: 'The dragon crowns its champions. Prizes, glory, and celebration.', type: 'ceremony' },
]

export const judges = [
  { id: 1, name: 'Hackathon Keynote & Kickoff', img: '/images/event/photo_1.jpeg' },
  { id: 2, name: 'Team Ideation & Brainstorming', img: '/images/event/photo_2.jpeg' },
  { id: 3, name: 'Medical Mentorship Session', img: '/images/event/photo_3.jpeg' },
  { id: 4, name: 'Hardware & IoT Prototyping', img: '/images/event/photo_4.jpeg' },
  { id: 5, name: 'Late Night Coding & Fuel', img: '/images/event/photo_5.jpeg' },
  { id: 6, name: 'AI Model Optimization & Testing', img: '/images/event/photo_6.jpeg' },
  { id: 7, name: 'Jury Evaluation & Live Demos', img: '/images/event/photo_7.jpeg' },
  { id: 8, name: 'SRM Faculty Guidance', img: '/images/event/photo_8.jpeg' },
  { id: 9, name: 'Cross-Domain Collaboration', img: '/images/event/photo_9.jpeg' },
  { id: 10, name: 'Clinical Tech Discussion', img: '/images/event/photo_10.jpeg' },
  { id: 11, name: 'Innovation Showcase', img: '/images/event/photo_11.jpeg' },
  { id: 12, name: 'Grand Finale & Celebrations', img: '/images/event/photo_12.jpeg' },
  { id: 13, name: 'Closing Ceremony & Swag', img: '/images/event/photo_13.jpeg' },
  { id: 14, name: 'Winners & Award Trophies', img: '/images/event/photo_14.jpg' },
]

export const prizes = [
  { title: '1st Prize', japaneseTitle: '1等賞', place: 'Winner', amount: '₹30,000', description: 'The supreme champion — awarded to the team that embodies innovation, execution, and impact.', color: '#ffffff', icon: '🏆' },
  { title: '2nd Prize', japaneseTitle: '2等賞', place: 'Runner Up', amount: '₹20,000', description: 'Swift, clever, and lethal — for the team that dazzles with ingenuity.', color: '#d1d5db', icon: '🥈' },
  { title: '3rd Prize', japaneseTitle: '3等賞', place: 'Second Runner Up', amount: '₹15,000', description: 'The pack leader — relentless execution meets raw power.', color: '#9ca3af', icon: '🥉' },
]

export const stats = [
  { value: '50', label: 'Hours of Hacking', suffix: '' },
  { value: '200', label: 'Hackers Expected', suffix: '+' },
  { value: '1', label: 'Lakhs in Prizes', suffix: 'L+' },
  { value: '20', label: 'Innovation Domains', suffix: '' },
]

export const sponsors = {
  collaboration: [
    { name: 'StartupTN', logo: '/images/startuptn-logo.png' },
  ],
  gold: [
    { name: 'R Shivakumar Foundation', logo: '/images/rs-foundation-logo.jpeg' },
  ],
  silver: [
    { name: 'SRM Trichy Arts & Science College', logo: '/images/inst-1.png' },
    { name: 'SRM Trichy College of Nursing', logo: '/images/inst-2.png' },
    { name: 'Trichy SRM Medical College Hospital & Research Centre', logo: '/images/inst-3-new.jpg' },
    { name: 'SRM Institute of Science & Technology Tiruchirappalli', logo: '/images/inst-4-new.jpg' },
    { name: 'SRM TRP Engineering College', logo: '/images/inst-5.jpg' },
  ],
}

export const faqs = [
  { question: 'Are registrations still open?', answer: 'Online registrations are now officially closed. Our evaluation panel is reviewing all submitted abstracts. Shortlisted teams and results will be announced soon!' },
  { question: 'When is MEDAITHON\'26 taking place?', answer: 'MEDAITHON\'26 will be held on 26, 27, and 28 October 2026 — an intense 50-hour sprint where engineering and healthcare meet to forge innovative medical solutions.' },
  { question: 'Who can participate in MEDAITHON\'26?', answer: 'Engineering students passionate about healthcare innovation. Teams must register exactly 3 Engineering Students online (1 Team Leader + 2 Team Members). On-site, 1 MBBS student and 1 Nursing student will be assigned to each team by MEDAITHON organizers.' },
  { question: 'Do I need prior medical knowledge?', answer: 'Not at all! We welcome developers, designers, data scientists, and domain experts. Interdisciplinary teams tend to build the best solutions. We\'ll have mentors from both tech and medical backgrounds.' },
  { question: 'What should I bring?', answer: 'Your laptop, charger, and warrior spirit. We provide meals, snacks, WiFi, power strips, and sleeping arrangements. Hardware kits will be available for IoT/embedded projects.' },
  { question: 'Is there a registration fee?', answer: 'MEDAITHON\'26 is completely free to attend. Food, swag, and resources are on us. All we ask is your full 50-hour commitment.' },
  { question: 'Can I start working on my project beforehand?', answer: 'No pre-built projects allowed. You may research and ideate, but all code must be written during the hackathon. Open-source libraries and APIs are fair game.' },
  { question: 'How does judging work?', answer: 'Projects are evaluated on Innovation (30%), Technical Execution (25%), Impact & Feasibility (25%), and Presentation (20%). Each team gets 5 minutes to demo + 3 minutes Q&A with judges.' },
]

export const socials = [
  { name: 'Instagram', url: '#', icon: 'instagram' },
  { name: 'Twitter', url: '#', icon: 'twitter' },
]