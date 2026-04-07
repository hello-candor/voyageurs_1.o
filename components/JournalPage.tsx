import React, { useState, useEffect, useMemo } from 'react';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { AboutUsModal } from './AboutUsModal';
import { TermsModal } from './TermsModal';

// --- Types ---
interface BlogPost {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  image?: string;
  edition: string;
  date: string;
  content: React.ReactNode;
}

// --- Content Data ---
const BLOG_POSTS: BlogPost[] = [
  {
    id: 'planning',
    category: 'Travel Strategy',
    edition: 'Edition 01',
    date: '2026-04-06',
    title: 'The Ultimate Guide to Stress-Free Group Travel Planning',
    excerpt: 'The art of the shared journey: How to coordinate a group trip without the headache, decision fatigue, or the notorious "arrival scramble."',
    readTime: '5 min read',
    image: '/assets/post_1_planning_1775509306917.png',
    content: (
      <>
        <p className="first-letter:float-left first-letter:text-7xl first-letter:pr-4 first-letter:font-serif first-letter:text-[#1A1A1A] first-line:uppercase first-line:tracking-widest text-xl leading-relaxed mb-8 text-[#3A3A3A] font-normal">
          We’ve all been there: a 20-person WhatsApp thread that moves faster than you can read, three different versions of a "final" spreadsheet, and that one friend who still hasn't confirmed if they’re actually coming.
        </p>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          Group travel is one of life’s greatest joys—a chance to build lifelong memories with your favorite people—but the logistics can often feel like a thankless full-time job. The complexity grows exponentially with every guest added; what starts as a simple dinner plan can quickly devolve into a logistical puzzle involving dietary restrictions, transport availability, and differing budget expectations.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          At Voyageurs, we believe the planning phase shouldn't be the price you pay for a great vacation. It should be the exciting preamble to the experience itself—the digital "lobby" where the excitement begins. When the logistics are invisible, the connection becomes the focus. Here is our definitive guide to organizing a group trip that actually feels like a holiday for the organizer, too.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">1. Centralize the Chaos: The Single Source of Truth</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          The biggest mistake in group travel is "fragmented information." If the flight details are in an email, the hotel address is in a chat, and the dinner reservations are on a scrap of paper, things will inevitably go wrong. This fragmentation leads to "decision fatigue," a psychological state where guests (and organizers) become so overwhelmed by choices and missing data that they stop enjoying the trip. Guests end up constantly asking the organizer for information that has already been shared, leading to burnout for the person in charge.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          By using a dedicated <strong className="font-medium text-[#1A1A1A]">group travel app</strong> like Voyageurs, you establish a "Single Source of Truth." This isn't just about a static list of events; it's a dynamic hub. When a flight is delayed or a gate changes, the information is updated for the whole group simultaneously. Beyond just schedules, this hub stores critical "peace of mind" data: emergency contacts, local embassy addresses, and digital copies of vital documents like visas or vaccination records. Guests can access maps, check-in instructions, and contact details in one elegant, shared interface, empowering them to be self-sufficient and giving the organizer a much-needed break from being the "human help desk."
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">2. Designate a "North Star" and Embrace "White Space"</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          While collaboration is key, every great trip needs a clear vision—a "North Star." Without a primary goal or theme, group trips can feel aimless. We recommend establishing "Anchor Events"—the non-negotiable experiences, like a big welcome dinner, a specific guided day trip, or a sunset boat cruise—that everyone is expected to attend. These anchors provide the skeletal structure around which the rest of the trip is built, giving the group a shared sense of purpose.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          However, the secret to a happy group is knowing when to let go. Travelers have vastly different energy levels and interests; the "Go-Go-Go" explorer and the "Poolside Lounger" often find themselves at odds in traditional planning. Intentionally leave "White Space" in the schedule. Voyageurs allows you to suggest optional activities—like a morning yoga class or a specific local market—that guests can opt into via the app. This creates a "choose your own adventure" feel where no one feels "trapped" by a rigid itinerary, yet everyone comes back together for the high-impact Anchor Events.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">3. Handle Logistics Early (And Automatically)</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          Shuttles, airport transfers, and room allocations are where groups often splinter. The "arrival scramble"—standing at the airport baggage claim trying to figure out who is sharing which Uber—is a notorious mood-killer. It’s the first impression of the trip, and if it’s chaotic, that stress lingers. By using the Voyageurs <strong className="font-medium text-[#1A1A1A]">Logistics Manager</strong>, you can move from reactive to proactive planning.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          Guests can input their own arrival times directly into their profiles. Our system then automatically clusters guests arriving at similar times, suggesting shared transport options and calculating the most efficient routes to the accommodation. It effectively solves the "Traveling Salesman Problem" for your friend group. This ensures that the moment your guests touch down, they feel looked after and directed, rather than abandoned in a foreign transit hub.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">4. The Golden Rule: Radical Transparency</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          Most group travel tension stems from uncertainty—usually regarding money, timing, or expectations. When information is "gatekept" by a single organizer, guests feel anxious and less invested; when it’s transparent, they feel like stakeholders. This transparency fosters a sense of collective ownership over the trip's success.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          When everyone can see the live itinerary, the guest list, and the estimated budget in real-time, that tension vanishes. If a guest sees that a dinner is expensive, they can plan accordingly or opt for a lighter lunch. With Voyageurs, every guest is a participant, not just a passenger. By surfacing the "why" behind the "what," you build a culture of trust that makes the actual travel much smoother.
        </p>
      </>
    )
  },
  {
    id: 'events',
    category: 'Experiential Travel',
    edition: 'Edition 01',
    date: '2026-04-05',
    title: 'How to Host a Flawless Destination Event',
    excerpt: 'Beyond the venue: Crafting an unforgettable destination celebration through elegant digital design and curated local experiences.',
    readTime: '6 min read',
    image: '/assets/post_2_event_v2_1775509468200.png',
    content: (
      <>
        <p className="first-letter:float-left first-letter:text-7xl first-letter:pr-4 first-letter:font-serif first-letter:text-[#1A1A1A] first-line:uppercase first-line:tracking-widest text-xl leading-relaxed mb-8 text-[#3A3A3A] font-normal">
          Hosting a milestone event—be it a 40th birthday in Montpellier, a corporate retreat in the Tuscan hills, or an intimate destination wedding—is about far more than just picking a beautiful location.
        </p>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          It is an exercise in "Experience Design." When your guests are flying across oceans and taking time out of their busy lives to celebrate with you, the experience starts the moment they receive the digital invitation.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          To host like a pro, you must look beyond the day of the event and consider the entire guest journey from "Arrival to Afterglow." This involves managing the logistical friction of international travel so your guests can arrive in a state of "celebration readiness." Here is how to ensure your destination celebration is remembered for all the right reasons.
        </p>

        <div className="my-16 p-10 bg-[#FDFBF7] border border-[#EAE6DF] rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#1A1A1A]"></div>
            <h4 className="text-2xl font-serif text-[#1A1A1A] mb-4">Set the Tone with Digital Elegance</h4>
            <p className="text-lg text-[#3A3A3A] font-normal leading-relaxed">
                Traditional paper invites are a beautiful touch for the mantelpiece, but they are practically useless once a guest is trying to find a specific taxi stand at 11 PM in a foreign city. A modern destination event requires a digital companion that is as sophisticated as the event itself. You need a platform that bridges the gap between the formal invitation and the real-world execution.
            </p>
            <p className="text-lg text-[#3A3A3A] font-normal leading-relaxed mt-4">
                Voyageurs offers a unique <strong>WebOS spatial interface</strong>—a pocket-sized concierge for every guest. Instead of digging through PDFs, screenshots, or buried emails, your guests have a live, interactive portal. Using a card-based layout, the app adapts to their current location and time, surfacing the "Next Event" or "Current Map" automatically. It transforms the guest's phone from a source of distraction into a high-end tool of navigation and information.
            </p>
        </div>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">Curate the Local Experience with AI Precision</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          Your guests aren't just there for your event; they are there for the destination. However, the last thing a guest wants to do after a long flight is spend hours filtering through thousands of conflicting reviews on TripAdvisor or Yelp. This often leads to guests defaulting to the nearest tourist trap simply because it’s easy. As a host, you can provide them with curated local gems that reflect your personal taste and the spirit of the celebration.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          Use our <strong>AI Concierge, Céleste</strong>, to provide hyper-local, real-time advice. Unlike a static guidebook, Céleste is context-aware. She can recommend the best flat white in the old town based on current opening hours, suggest a hidden courtyard bar that’s perfect for the evening's specific weather, or even help with a quick translation for a pharmacy run. By providing these curated "micro-experiences," you turn a simple trip into a bespoke vacation for everyone involved, reinforcing your role as a thoughtful and generous host.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">The Magic of Pre-Event Connection</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          A common challenge with large events is that guests come from different chapters of your life—childhood friends, college roommates, and work colleagues—and they might not know each other. This often leads to "social silos" during the first few days of a trip, where groups stick to who they know, missing out on the broader magic of the gathering.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          A <strong>Guest Registry</strong> within Voyageurs helps break the ice before the first cork is even popped. Guests can see photos and short bios of who else is attending, find common interests, or see who is flying in from the same hub. If three guests realize they are staying at the same boutique hotel or arriving at the airport within the same hour, they can coordinate a shared breakfast or a walk through the city using the built-in chat. By the time your welcome dinner starts, the group already feels like a cohesive community rather than a collection of strangers.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">Real-Time Communication for a Changing World</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          No matter how well you plan, destination events are subject to the whims of the world. A sudden rainstorm might move a sunset cocktail hour indoors, or a local festival might close a particular street, requiring a last-minute change in transport. In these high-stakes moments, email is too slow and group chats are far too chaotic, as important updates get buried under "Thanks!" and "LOL" stickers.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          Voyageurs features a <strong>Broadcast System</strong> that allows hosts to send instant, chic updates directly to guests’ devices. These notifications appear as high-priority alerts, ensuring that everyone is on the same page within seconds. Whether it's a reminder about a specific dress code requirement for a cathedral visit or a live update on the shuttle's location, you can communicate with authority and grace. This ensures that "pivoting" never feels like "panicking," maintaining the premium atmosphere of your event.
        </p>
      </>
    )
  },
  {
    id: 'finance',
    category: 'Travel Finance',
    edition: 'Edition 01',
    date: '2026-04-04',
    title: 'Money Matters: Solving the Awkwardness of Shared Travel Expenses',
    excerpt: 'The end of "who owes what". Master shared travel expenses with smart ledgers, selective splitting, and one-tap netting.',
    readTime: '5 min read',
    image: '/assets/post_3_expenses_v2_1775509483758.png',
    content: (
      <>
        <p className="first-letter:float-left first-letter:text-7xl first-letter:pr-4 first-letter:font-serif first-letter:text-[#1A1A1A] first-line:uppercase first-line:tracking-widest text-xl leading-relaxed mb-8 text-[#3A3A3A] font-normal">
          There is one part of group travel that is universally dreaded: the "Financial Post-Mortem." Trying to remember who paid for the oysters on Friday, who covered the three bottles of wine for the Saturday gala, or who tipped the tour guide can sour the final moments of an otherwise beautiful trip.
        </p>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          This "money friction" can lead to awkward follow-up texts weeks after the vacation has ended, and in some cases, can even strain long-standing friendships.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          At Voyageurs, we’ve built the antidote to the awkward money talk. We believe that financial transparency is the foundation of travel harmony. When the math is handled by an impartial third party (the app), the "awkwardness" evaporates, leaving only the memories.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">1. Snap It, Don’t Note It: Live Expense Tracking</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          The days of keeping a physical envelope of crumpled, coffee-stained receipts or a manual list in a Notes app are over. Manual methods are prone to "human error" and often lead to forgotten expenses, which usually means the most generous person in the group ends up subsidizing everyone else.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          With Voyageurs, the moment the bill arrives, you simply snap a photo. Our <strong>Smart Shared Ledger</strong> uses advanced OCR (Optical Character Recognition) to instantly extract the total, the merchant, the date, and even the local tax. By recording expenses in real-time, you ensure that the data is 100% accurate. More importantly, it creates a "live pulse" of the trip's spending, allowing everyone to see exactly where the budget is going while it's still happening.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">2. Selective Splitting: Fairness in the Details</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          Not every expense involves every person in the group, and a simple "divide by X" often feels unfair, leading to quiet resentment. Perhaps only four people went on that premium vineyard tour while the rest spent the afternoon at a free museum. Or perhaps one family in the group required a larger suite while the solo travelers shared a standard room.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          Voyageurs allows for <strong>Selective Splitting</strong>. You can create specific "Coordinated Groups" within your trip—for example, a "Wine Tour Group" or a "Late Night Pizza Crew." This ensures that costs are only allocated to those who actually participated. Whether it’s splitting a dinner bill by what people actually ordered or adjusting accommodation costs by room size and amenities, our ledger handles the complex permutations so you don't have to. It turns "splitting the bill" from a math problem into a fair agreement.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">3. Settle Up with a Single Tap: The "Netting" Advantage</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          The most awkward part of shared expenses is the actual transfer of money. No one likes being a "debt collector" for their friends, and no one likes receiving multiple small requests from different people. We've streamlined this by integrating with major payment handles like Venmo, CashApp, and PayPal, but we've also added a layer of intelligence.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          Once the trip is over, Voyageurs doesn't just show you every individual debt; it calculates a "Net Settlement." This algorithm minimizes the number of transfers required by offsetting what you owe against what you are owed. It might reduce a dozen complex IOUs across the group into just a few simple transactions. Guests can then settle their final share with a single tap from within the app UI. It’s fast, private, and completely removes the need for those "Hey, did you get my Venmo?" follow-up texts.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">4. Budget with Precision: The Trip Estimator</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          The best way to avoid money stress is to eliminate surprises. Most groups don't know the true cost of their trip until it’s already over and the credit card statements start rolling in. This "post-trip shock" is a major source of travel anxiety. Our <strong>Trip Estimator</strong> flips this dynamic, turning the budget into a planning tool rather than a post-trip autopsy.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          You can build a draft itinerary and see the per-person cost adjust in real-time as you add activities, meals, or hotel nights. This allows the group to have an honest, mature conversation about the budget <em>before</em> the first booking is made. If the vineyard tour is too expensive, the group can decide together to swap it for a beach day. When everyone has agreed on the estimated cost upfront, every dollar spent feels like a shared choice rather than a mounting, unknown burden.
        </p>
      </>
    )
  },
  {
    id: 'ai-concierge',
    category: 'Technology',
    edition: 'Edition 01',
    date: '2026-04-03',
    title: 'AI-Powered Exploration: The Rise of the Context-Aware Travel Companion',
    excerpt: 'Beyond the algorithm: How AI is personalizing the group experience.',
    readTime: '4 min read',
    image: '/assets/post_4_ai_concierge_v3_1775512249830.png',
    content: (
      <>
        <p className="first-letter:float-left first-letter:text-7xl first-letter:pr-4 first-letter:font-serif first-letter:text-[#1A1A1A] first-line:uppercase first-line:tracking-widest text-xl leading-relaxed mb-8 text-[#3A3A3A] font-normal">
          For years, "AI in travel" meant little more than chatbots that couldn't understand complex questions or generic recommendation engines that suggested the same five tourist traps to everyone. These tools often felt like fancy search bars rather than genuine assistants. At Voyageurs, we believe AI shouldn't just be a tool; it should be a context-aware companion that understands the unique pulse of your specific group.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          Enter <strong>Céleste</strong>, our advanced AI concierge. Céleste doesn't just pull data from a static database; she synthesizes the real-time context of your trip—weather, local events, group energy levels, and past preferences—to provide insights that feel human.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">The Power of Context-Awareness</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          Traditional travel apps are static. They know where a restaurant is, but they don't know that it's currently raining, that your group has two toddlers in tow, and that you’ve just finished an exhausting three-hour walking tour. Céleste does. By integrating with live weather data and your group’s specific itinerary, Céleste can suggest a "Plan B" before you even realize you need one.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          For example, if a museum strike is announced in Paris, Céleste proactively notifies the group and suggests a nearby private gallery or a boutique cooking class that fits the group's "History & Art" preference profile. She understands that a rainy afternoon with kids requires a different recommendation than a rainy afternoon for a bachelor party. This "environmental intelligence" ensures that your trip keeps moving, no matter what the world throws at it.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">Personalization at Scale: Solving the "Common Interest" Puzzle</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          The fundamental challenge of group travel is that "the group" is actually a collection of individuals with competing desires. How do you satisfy the foodie who wants a six-course tasting menu, the hiker who wants to be on the trail by 6 AM, and the history buff who wants to spend four hours in a library?
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          Through our <strong>Smart Itinerary Personalization</strong>, Céleste analyzes individual Guest Profiles to identify "Common Interest Clusters." Instead of forcing everyone into a one-size-fits-all schedule, she might suggest a free afternoon where the hikers are directed to a coastal trail while the foodies receive a curated list of the best pâtisseries in the Arrondissement. This isn't just a list; it's a strategy for group harmony. By providing personalized "side-quests," Voyageurs ensures that everyone feels their individual interests are being honored.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">Eliminating the Language Barrier with Cultural Nuance</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          Traveling in a foreign country adds a layer of friction that can dampen the spirits of even the most seasoned explorer. Ordering food or finding a pharmacy shouldn't feel like a high-stakes negotiation. Céleste acts as a real-time linguistic and cultural bridge.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          Need to explain a severe peanut allergy to a chef in a rural Thai village? Or perhaps you need to negotiate a late checkout in Italian? Céleste provides culturally nuanced translations and etiquette tips that go beyond literal word-for-word conversion. She explains the <em>how</em> and <em>why</em> of local customs, ensuring your group moves through the world with confidence, respect, and a sense of belonging. It’s like having a local friend in your pocket, 24/7.
        </p>
      </>
    )
  },
  {
    id: 'corporate',
    category: 'Enterprise',
    edition: 'Edition 01',
    date: '2026-04-02',
    title: 'The Corporate Offsite: Building Culture Through Seamless Logistics',
    excerpt: 'Culture in motion: Why logistics are the secret to a successful remote team retreat.',
    readTime: '5 min read',
    image: '/assets/post_5_corporate_offsite_1775512099205.png',
    content: (
      <>
        <p className="first-letter:float-left first-letter:text-7xl first-letter:pr-4 first-letter:font-serif first-letter:text-[#1A1A1A] first-line:uppercase first-line:tracking-widest text-xl leading-relaxed mb-8 text-[#3A3A3A] font-normal">
          In the era of remote and hybrid work, the corporate offsite has transitioned from a luxury to an absolute necessity. It is the primary vehicle for building "Social Capital"—the trust, shared context, and connection that fuels long-term productivity. However, a poorly organized retreat can have the opposite effect, creating "logistical resentment" that overshadows the bonding activities. If the CEO is late because the shuttle was lost, or if the engineering team is annoyed because their dietary needs weren't met, the "culture building" has already failed.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          At Voyageurs, we specialize in the "Invisible Infrastructure" of professional travel. We handle the friction so your team can focus on the mission. Here is how to ensure your next offsite builds culture rather than frustration.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">Professionalizing the Participant Experience: The Mission Hub</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          When employees travel for work, their expectations for efficiency and clarity are significantly higher than on a personal vacation. They aren't looking for an adventure; they are looking for a productive experience. Using our <strong>WebOS Dashboard</strong>, companies can provide a centralized "Mission Hub."
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          This isn't just a digital itinerary; it’s a comprehensive portal containing workshop materials, bios for external speakers, Slack-integrated chat channels, and real-time updates on meeting room locations. By removing the "where do I go next?" and "what's the Wi-Fi password?" anxiety, you allow your team to arrive with their brains fully switched on, ready to engage with the retreat's primary objectives.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">Balancing Productivity and Connection: Dynamic Block Scheduling</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          The most common mistake in offsite planning is over-scheduling. A retreat that feels like a multi-day meeting is exhausting, not inspiring. On the flip side, a trip with no structure can feel like a waste of company time. Voyageurs helps organizers strike the perfect balance through <strong>Dynamic Block Scheduling</strong>.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          You can designate "Deep Work" sessions as Anchor Events while using the app to facilitate "Micro-Bonding" during free periods. For example, if five team members realize via the app that they all want to try local bouldering during a two-hour break, Voyageurs helps them coordinate transport and booking without requiring an HR manager to intervene. This "organic coordination" is where the most valuable team connections are often made.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">Enterprise-Grade Logistics Management and Finance</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          Coordinating 50+ employees arriving from different global hubs, all with different time zones and flight schedules, is a mathematical nightmare for even the most experienced EA. Our <strong>Logistics Manager</strong> automates this complexity by clustering arrivals and managing ground transportation in real-time. If a flight is delayed, the shuttle driver is notified automatically, and the arrival group is updated.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          Furthermore, for the finance department, our <strong>Corporate Shared Ledger</strong> provides a transparent, audit-ready record of all group expenses. Every dinner bill and taxi fare is OCR-scanned and categorized instantly. This eliminates the weeks of painful reimbursement paperwork and manual receipt-matching that often follow a retreat. With Voyageurs, the trip ends when the plane touches down, not when the last expense report is filed.
        </p>
      </>
    )
  },
  {
    id: 'social',
    category: 'Social Dynamics',
    edition: 'Edition 01',
    date: '2026-04-01',
    title: 'Solo, But Together: How Technology Fosters Community in Group Travel',
    excerpt: 'Combating the loneliness of modern travel by using intelligent profiles and curated chats to accelerate the "Community Cycle."',
    readTime: '4 min read',
    image: '/assets/post_6_solo_together_1775512115645.png',
    content: (
      <>
        <p className="first-letter:float-left first-letter:text-7xl first-letter:pr-4 first-letter:font-serif first-letter:text-[#1A1A1A] first-line:uppercase first-line:tracking-widest text-xl leading-relaxed mb-8 text-[#3A3A3A] font-normal">
          There is a growing paradox in modern travel: we are more connected than ever, yet many travelers—especially those joining organized groups or retreats alone—feel a profound sense of isolation. The "first-day awkwardness" is a real psychological barrier that can prevent deep connections from forming until the trip is nearly over. People often leave a group trip wishing they had spoken to that interesting person across the table sooner.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          Voyageurs was built to accelerate the "Community Cycle." We believe that technology should serve as a catalyst for real-world connection, not a replacement for it. We use data to bridge the gap between "stranger" and "friend."
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">Profiles with Purpose: Beyond the Small Talk</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          Connection starts with commonality, but small talk is a slow way to find it. Our <strong>Guest Profiles</strong> go beyond names and photos. We encourage users to share their "Travel Intentions"—are they looking for deep philosophical conversation, quiet reflection, or high-adrenaline adventure? Do they prefer early morning coffee runs or late-night cocktail bars?
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          By surfacing these intentions early, Voyageurs allows guests to find their "sub-tribes" within the larger group. When a solo traveler sees that three others are also early-morning runners or avid photography enthusiasts, a connection is made before the first breakfast is even served. This "pre-arrival familiarity" lowers the social stakes and makes the first meeting feel like a reunion rather than an introduction.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">The Safe Space for Communication: Curated Interaction</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          Public social media is too noisy for trip coordination, and WhatsApp is often too invasive, requiring you to share your phone number with people you've just met. Voyageurs provides a <strong>Curated Chat System</strong> that is trip-specific, context-aware, and privacy-first.
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          Guests can share photos, coordinate dinner plans, or ask questions in a focused environment that respects their boundaries. Because the chat is integrated with the itinerary, a message about "Who's going to the museum?" includes a direct link to the museum's location and tickets, turning casual conversation into immediate action. It removes the friction of coordination, leaving more room for genuine conversation.
        </p>

        <h3 className="text-3xl font-serif text-[#1A1A1A] mb-6 mt-16">Fostering Long-Term Connections: The "Afterglow" Effect</h3>
        <p className="text-lg leading-relaxed mb-6 text-[#3A3A3A] font-normal">
          The magic of a great trip shouldn't end at the airport gate. Many group travel apps "die" the moment the trip concludes, leaving the photos and memories scattered across various devices and platforms. Voyageurs is designed to preserve and nurture the "Afterglow."
        </p>
        <p className="text-lg leading-relaxed mb-12 text-[#3A3A3A] font-normal">
          Our <strong>Shared Gallery</strong> and <strong>Trip Archive</strong> features allow groups to revisit memories, share high-resolution photos, and maintain the connections they’ve built in a dedicated space. We help groups transition from "people who traveled together" to a "long-term community." By providing a permanent, digital home for the trip's unique story, we ensure that the social capital built during the journey continues to pay dividends long after everyone has returned home.
        </p>
      </>
    )
  }
];

export const JournalPage: React.FC = () => {
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Filter / Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeEdition, setActiveEdition] = useState<string>('All');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'Date (Newest)' | 'Date (Oldest)' | 'Title (A-Z)'>('Date (Newest)');

  const filteredAndSortedPosts = useMemo(() => {
    let result = BLOG_POSTS;

    if (activeEdition !== 'All') {
      result = result.filter(post => post.edition === activeEdition);
    }
    
    if (activeCategory !== 'All') {
      result = result.filter(post => post.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(q) || 
        post.excerpt.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'Date (Newest)') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'Date (Oldest)') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'Title (A-Z)') return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [searchQuery, activeEdition, activeCategory, sortBy]);

  const editions = ['All', ...Array.from(new Set(BLOG_POSTS.map(p => p.edition)))];
  const categories = ['All', ...Array.from(new Set(BLOG_POSTS.map(p => p.category)))];

  const isDefaultView = activeEdition === 'All' && activeCategory === 'All' && searchQuery === '' && sortBy === 'Date (Newest)';
  const displayPosts = isDefaultView ? BLOG_POSTS : filteredAndSortedPosts;

  useEffect(() => {
    const handleScroll = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (scrollPx / winHeightPx) * 100;
      setScrollProgress(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Inject high-end fonts to guarantee the editorial aesthetic
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleArticleClick = (id: string) => {
    setActiveArticleId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHomeClick = () => {
    setActiveArticleId(null);
    setSearchQuery('');
    setActiveEdition('All');
    setActiveCategory('All');
    setSortBy('Date (Newest)');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeArticle = BLOG_POSTS.find((post: BlogPost) => post.id === activeArticleId);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] font-sans selection:bg-[#EAE6DF] selection:text-[#1A1A1A]">
      
      {/* --- Global Navigation --- */}
      <nav className="fixed w-full top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#EAE6DF]">
        <div className="px-6 py-5 max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={handleHomeClick} className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A] hover:text-[#A68966] transition-colors">
              HOME
            </button>
            {activeArticle && (
              <>
                <span className="text-[#595959] text-xs">/</span>
                <span className="text-[#A68966] text-xs uppercase tracking-[0.2em] font-bold truncate max-w-[120px] lg:max-w-[250px]" title={activeArticle.title}>
                  {activeArticle.title}
                </span>
              </>
            )}
          </div>
          <h1 
            onClick={handleHomeClick} 
            className="text-2xl md:text-3xl font-serif font-bold tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            VOYAGEURS <span className="font-sans font-thin uppercase italic">JOURNAL</span>
          </h1>
          <div className="flex items-center space-x-4">
            <a href="/" className="hidden md:inline-block border border-[#1A1A1A] text-[#1A1A1A] px-5 py-2 text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#1A1A1A] hover:text-white transition-all">
              Discover App
            </a>
          </div>
        </div>
        {activeArticle && (
          <div className="h-[3px] bg-transparent w-full absolute bottom-0 left-0">
            <div className="h-full bg-[#1A1A1A] transition-all duration-150 ease-out" style={{ width: `${scrollProgress}%` }}></div>
          </div>
        )}
      </nav>

      <main className="pt-24 pb-24">
        {/* --- INDEX VIEW --- */}
        {!activeArticle && (
          <div className="animate-[fadeIn_0.6s_ease-out_forwards]">
            
            {isDefaultView && (
              <>
                {/* HERO: Cover Story (Uses Article 1) */}
                <header className="max-w-7xl mx-auto px-6 mb-12 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
                  <div className="lg:col-span-6 order-2 lg:order-1">
                    <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#595959] mb-6 block">{displayPosts[0].edition} • Cover Feature</span>
                    <h2 
                      className="text-5xl md:text-7xl font-serif font-bold leading-[1.1] mb-8 text-[#1A1A1A]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {displayPosts[0].title}
                    </h2>
                    <p className="text-xl text-[#333333] leading-relaxed mb-10 font-normal">
                      {displayPosts[0].excerpt}
                    </p>
                    <button 
                      onClick={() => handleArticleClick(displayPosts[0].id)} 
                      className="group inline-flex items-center space-x-4 border-b border-[#1A1A1A] pb-2 hover:opacity-70 transition-all"
                    >
                      <span className="uppercase text-xs tracking-[0.2em] font-bold text-[#1A1A1A]">Read the Feature</span>
                      <span className="transform group-hover:translate-x-2 transition-transform">→</span>
                    </button>
                  </div>
                  
                  {/* Hero Image Placeholder (Lux Editorial Style) */}
                  <div className="lg:col-span-6 order-1 lg:order-2 h-[500px] lg:h-[700px] bg-[#EAE6DF] relative overflow-hidden flex flex-col justify-between p-8 group cursor-pointer" onClick={() => handleArticleClick(displayPosts[0].id)}>
                    {displayPosts[0].image ? (
                      <img src={displayPosts[0].image} alt={displayPosts[0].title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    ) : (
                      <div className="w-full flex justify-center items-center h-full absolute inset-0">
                        <span className="text-[12rem] font-serif text-[#FDFBF7] opacity-60" style={{ fontFamily: "'Playfair Display', serif" }}>V</span>
                      </div>
                    )}
                    <div className="relative z-10 flex justify-between w-full text-xs uppercase tracking-[0.2em] font-bold drop-shadow-md text-white/90">
                      <span>{displayPosts[0].edition}</span>
                      <span>{displayPosts[0].category}</span>
                    </div>
                  </div>
                </div>
              </header>
              </>
            )}

            {/* TOOLBAR */}
            <section className="sticky top-[73px] z-40 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-white/50 mb-12 shadow-sm transition-all pb-4 pt-4">
              <div className="max-w-7xl mx-auto px-6">
                <div className="bg-white border border-[#EAE6DF] rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
                  
                  <div className="relative w-full md:w-1/3">
                    <input 
                      type="text" 
                      placeholder="Search journal..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[#FDFBF7] border border-[#EAE6DF] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#A68966] text-[#1A1A1A] placeholder-[#595959]"
                    />
                    <svg className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#595959]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>

                  <div className="flex flex-wrap md:flex-nowrap gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#595959] whitespace-nowrap">Edition:</span>
                      <select 
                        value={activeEdition} 
                        onChange={(e) => setActiveEdition(e.target.value)}
                        className="bg-transparent text-sm font-medium text-[#1A1A1A] focus:outline-none cursor-pointer border-b border-transparent hover:border-[#A68966] transition-colors"
                      >
                        {editions.map(ed => <option key={ed} value={ed}>{ed}</option>)}
                      </select>
                    </div>

                    <div className="hidden md:block w-px h-4 bg-[#EAE6DF] my-auto"></div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#595959] whitespace-nowrap">Topic:</span>
                      <select 
                        value={activeCategory} 
                        onChange={(e) => setActiveCategory(e.target.value)}
                        className="bg-transparent text-sm font-medium text-[#1A1A1A] focus:outline-none cursor-pointer border-b border-transparent hover:border-[#A68966] transition-colors"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>

                    <div className="hidden md:block w-px h-4 bg-[#EAE6DF] my-auto"></div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#595959] whitespace-nowrap">Sort:</span>
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-transparent text-sm font-medium text-[#1A1A1A] focus:outline-none cursor-pointer border-b border-transparent hover:border-[#A68966] transition-colors"
                      >
                        <option value="Date (Newest)">Newest</option>
                        <option value="Date (Oldest)">Oldest</option>
                        <option value="Title (A-Z)">Title (A-Z)</option>
                      </select>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {isDefaultView ? (
              <>
                {/* EDITORIAL GRID (Articles 2-6) */}
                <section className="max-w-7xl mx-auto px-6 border-t border-[#EAE6DF] pt-16">
                  <div className="flex justify-between items-end mb-16">
                    <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">The Index</h3>
                    <span className="hidden md:block w-full max-w-md h-[1px] bg-[#EAE6DF] mx-6 mb-2"></span>
                    <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#595959]">Curated Perspectives</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                    {displayPosts.slice(1).map((post, index) => (
                      <article 
                        key={post.id} 
                        className="cursor-pointer group flex flex-col h-full"
                        onClick={() => handleArticleClick(post.id)}
                      >
                        {/* Placeholder Image Box */}
                        <div className="w-full aspect-[4/5] bg-[#EAE6DF] mb-6 overflow-hidden flex items-center justify-center relative transition-transform duration-700 group-hover:bg-[#dfdad1] group/img">
                          {post.image ? (
                            <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110" />
                          ) : (
                            <span className="text-6xl font-serif text-[#FDFBF7] opacity-50 transition-transform duration-700 group-hover/img:scale-110" style={{ fontFamily: "'Playfair Display', serif" }}>
                              {post.category.charAt(0)}
                            </span>
                          )}
                          <span className={`absolute top-4 left-4 z-10 text-xs uppercase tracking-[0.2em] font-bold ${post.image ? 'text-white drop-shadow-md' : 'text-[#595959]'}`}>{post.edition}</span>
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#595959]">{post.category}</span>
                            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#595959]">{post.readTime}</span>
                          </div>
                          <h4 
                            className="text-2xl font-serif text-[#1A1A1A] leading-snug mb-4 group-hover:text-[#4A5D4E] transition-colors"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {post.title}
                          </h4>
                          <p className="text-sm text-[#333333] font-normal leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              </>
            ) : (
              <section className="max-w-7xl mx-auto px-6 pt-6">
                <div className="flex justify-between items-end mb-16">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">Search Results</h3>
                  <span className="hidden md:block w-full max-w-md h-[1px] bg-[#EAE6DF] mx-6 mb-2"></span>
                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#595959]">{displayPosts.length} articles found</p>
                </div>

                {displayPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                    {displayPosts.map((post, index) => (
                      <article 
                        key={post.id} 
                        className="cursor-pointer group flex flex-col h-full"
                        onClick={() => handleArticleClick(post.id)}
                      >
                        {/* Placeholder Image Box */}
                        <div className="w-full aspect-[4/5] bg-[#EAE6DF] mb-6 overflow-hidden flex items-center justify-center relative transition-transform duration-700 group-hover:bg-[#dfdad1] group/img">
                          {post.image ? (
                            <img src={post.image} alt={post.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110" />
                          ) : (
                            <span className="text-6xl font-serif text-[#FDFBF7] opacity-50 transition-transform duration-700 group-hover/img:scale-110" style={{ fontFamily: "'Playfair Display', serif" }}>
                              {post.category.charAt(0)}
                            </span>
                          )}
                          <span className={`absolute top-4 left-4 z-10 text-xs uppercase tracking-[0.2em] font-bold ${post.image ? 'text-white drop-shadow-md' : 'text-[#595959]'}`}>{post.edition}</span>
                        </div>
                        
                        <div className="flex-grow">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#595959]">{post.category}</span>
                            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#595959]">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                          <h4 
                            className="text-2xl font-serif text-[#1A1A1A] leading-snug mb-4 group-hover:text-[#4A5D4E] transition-colors"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {post.title}
                          </h4>
                          <p className="text-sm text-[#333333] font-normal leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24">
                    <p className="text-xl font-serif text-[#595959]">No articles found matching your criteria.</p>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* --- ARTICLE READER VIEW --- */}
        {activeArticle && (
          <article className="max-w-3xl mx-auto px-6 animate-[fadeIn_0.5s_ease-out_forwards]">
            
            <header className="mb-16 border-b border-[#EAE6DF] pb-16 pt-8">
              <div className="flex items-center space-x-4 mb-8">
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A] bg-[#EAE6DF] px-3 py-1">
                  {activeArticle.category}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#595959]">
                  {activeArticle.readTime}
                </span>
              </div>
              
              <h1 
                className="text-4xl md:text-6xl font-serif font-bold text-[#1A1A1A] leading-[1.15] mb-8"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {activeArticle.title}
              </h1>
              
              <div className="flex items-center space-x-4 mb-12">
                <div className="w-12 h-12 bg-[#EAE6DF] rounded-full flex items-center justify-center border border-[#1A1A1A]/10 shadow-sm">
                  <span className="font-serif italic text-lg text-[#1A1A1A]">V</span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A]">Voyageurs Editorial</p>
                  <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#595959] mt-1">{activeArticle.edition} • {new Date(activeArticle.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              {activeArticle.image && (
                <div className="w-[100vw] relative left-1/2 -translate-x-1/2 aspect-[21/9] bg-[#EAE6DF] overflow-hidden mb-8 max-w-screen-xl">
                  <img src={activeArticle.image} alt={activeArticle.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
              )}
            </header>

            <div className="article-body">
              {activeArticle.content}
            </div>

            {/* End of Article Marker */}
            <div className="mt-24 border-t border-[#EAE6DF] pt-12">
              <div className="flex flex-col items-center justify-center mb-16">
                <span className="w-2 h-2 bg-[#1A1A1A] rounded-full mb-8"></span>
                <p className="text-xs uppercase tracking-[0.2em] font-bold text-[#595959] mb-4">Share this piece</p>
                <div className="flex space-x-6">
                  <button className="text-[#1A1A1A] hover:text-[#A68966] transition-colors"><span className="text-xs uppercase tracking-[0.2em] font-bold">X (Twitter)</span></button>
                  <button className="text-[#1A1A1A] hover:text-[#A68966] transition-colors"><span className="text-xs uppercase tracking-[0.2em] font-bold">LinkedIn</span></button>
                  <button className="text-[#1A1A1A] hover:text-[#A68966] transition-colors"><span className="text-xs uppercase tracking-[0.2em] font-bold">Copy Link</span></button>
                </div>
              </div>
              <div className="flex justify-center border-t border-[#EAE6DF] pt-12">
                <button 
                  onClick={() => setActiveArticleId(null)} 
                  className="border border-[#1A1A1A] text-[#1A1A1A] px-12 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#1A1A1A] hover:text-[#FDFBF7] transition-all"
                >
                  Return to Index
                </button>
              </div>
            </div>
          </article>
        )}
      </main>

      {/* --- Editorial Footer --- */}
      <footer className="bg-[#1A1A1A] text-[#FDFBF7] py-20 px-6 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="max-w-sm">
                <h2 className="text-3xl font-serif font-bold tracking-tight mb-6 flex items-baseline gap-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                    VOYAGEURS <span className="font-sans font-normal italic uppercase tracking-widest text-[#595959]">JOURNAL</span>
                </h2>
                <p className="text-[#595959] font-normal leading-relaxed text-sm">
                    Stories, guides, and essays on the art of group travel. A quiet space dedicated to exploring perspectives from the shared journey.
                </p>
            </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs uppercase tracking-[0.2em] text-[#333333] font-bold">
            <p>© {new Date().getFullYear()} Candor Digital Group, LLC. All rights reserved.</p>
            <div className="flex items-center gap-6 text-[#595959]">
                <button onClick={() => setShowPrivacy(true)} className="hover:text-white transition-colors">Privacy</button>
                <button onClick={() => setShowTerms(true)} className="hover:text-white transition-colors">Terms</button>
            </div>
        </div>
      </footer>

      <PrivacyPolicyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <AboutUsModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />

      {/* Global Styles for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};
