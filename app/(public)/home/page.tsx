"use client";
import Link from "next/link";

const courses = [
  {
    id: "finance-fundamentals",
    title: "Finance Fundamentals",
    tag: "Adulting / Money",
    description:
      "Learn how money actually works: budgeting, debt, interest, investing, and the psychology of spending. A path from “where does my paycheck go?” to feeling in control.",
    meta: "~12 units · Adaptive quizzes · Beginner friendly"
  },
  {
    id: "brain-fallacies",
    title: "Brain Fallacies",
    tag: "Thinking / Psychology",
    description:
      "A tour of glitches in human thinking – cognitive biases, perception tricks, and why your brain confidently misleads you.",
    meta: "~10 units · Story-based · All levels"
  },
  {
    id: "driving-test-prep",
    title: "Driving Test Prep",
    tag: "Driving / Safety",
    description:
      "Prepare for your driving test with short, visual units and endless practice quizzes that adapt to your mistakes.",
    meta: "Localized curriculums · Exam-ready"
  },
  {
    id: "civic-citizenship",
    title: "Civic & Citizenship",
    tag: "Civics / Exams",
    description:
      "Learn the history, rules, and everyday realities behind official civics/citizenship tests – presented like a guided tour.",
    meta: "Built from official question banks"
  }
];

const nftCollection = [
  {
    id: "finance-legend-savings-summit",
    title: "Finance Legend – Savings Summit",
    unlockedBy: "Finance Fundamentals – Unit 4",
    mintedCount: 37
  },
  {
    id: "bias-slayer-attention-hijacks",
    title: "Bias Slayer – Attention Hijacks",
    unlockedBy: "Brain Fallacies – Unit 3",
    mintedCount: 24
  },
  {
    id: "driver-sense-road-signs",
    title: "Driver Sense – Road Signs",
    unlockedBy: "Driving Test Prep – Road Signs",
    mintedCount: 51
  },
  {
    id: "civic-keeper-constitution",
    title: "Civic Keeper – Constitution Basics",
    unlockedBy: "Civics – Unit 2",
    mintedCount: 18
  }
];

const faqs = [
  {
    question: "Is Almanac free?",
    answer:
      "During the pilot, yes. Later there may be optional paid features, but the core learning paths are designed to stay widely accessible."
  },
  {
    question: "What ages is it for?",
    answer:
      "We design for teens and adults. Younger players can use Almanac with guidance from a parent, teacher, or tutor."
  },
  {
    question: "Do I need to know anything about crypto?",
    answer:
      "No. Wallets are created automatically and everything works in the background. You can just treat NFTs as collectibles tied to your progress."
  },
  {
    question: "Can I use Almanac without NFTs?",
    answer:
      "Yes. NFTs are optional rewards. You can play, learn, and track mastery without minting anything."
  },
  {
    question: "How do you keep the AI safe and accurate?",
    answer:
      "We constrain the AI to pre-vetted curriculums, real sources, and a tutoring role. It can help explain and quiz, but not freestyle as a general chatbot inside the app."
  }
];

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-slate-50">
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-card px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
              OpenMind
            </span>
            <span className="text-sm text-muted-foreground">×</span>
            <span className="text-sm font-semibold text-foreground">
              Almanac
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a
              href="#how-it-works"
              className="hover:text-foreground transition-colors"
            >
              How it works
            </a>
            <a
              href="#content"
              className="hover:text-foreground transition-colors"
            >
              Content
            </a>
            <a href="#nfts" className="hover:text-foreground transition-colors">
              NFTs
            </a>
            <a
              href="#results"
              className="hover:text-foreground transition-colors"
            >
              Results
            </a>
            <a
              href="/OpenMind — White Paper.pdf"
              target="_blank"
              className="hover:text-foreground transition-colors"
            >
              White paper
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href={"/sign-in"}
              className="rounded-full border border-border px-4 py-2 text-sm text-foreground hover:border-muted-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href={"/sign-up"}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Play Almanac
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section id="hero" className="border-b border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:flex-row md:items-center">
            <div className="flex-1 space-y-5">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                Turn essential knowledge into a game you actually want to
                finish.
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground md:text-base">
                Almanac is a learning game powered by an AI tutor. You play
                through short, story-driven units, practice with smart quizzes,
                and unlock on-chain collectibles when you truly master the
                content.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={"/sign-up"}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Start playing
                </Link>
                <button className="text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-foreground transition-colors">
                  Read the mission
                </button>
                <span className="text-xs text-muted-foreground">
                  Free while we&apos;re in pilot.
                </span>
              </div>
            </div>

            {/* Hero visual (placeholder layout) */}
            <div className="flex-1">
              <div className="mx-auto max-w-sm rounded-3xl border border-border bg-card/60 p-4 shadow-lg">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Finance Fundamentals · Unit 3
                  </div>
                  <div className="rounded-full bg-card px-3 py-1 text-xs text-primary">
                    76% mastery
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl bg-card p-4">
                  <div className="text-xs font-semibold text-foreground">
                    Today&apos;s focus
                  </div>
                  <p className="text-xs text-muted-foreground">
                    &ldquo;Why compound interest quietly rewards patient
                    people.&rdquo;
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Next quiz: 5 questions</span>
                    <span>Streak: 6 days 🔥</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-4">
                  <div className="flex-1 rounded-2xl bg-card p-3 text-xs">
                    <div className="mb-2 text-[11px] text-muted-foreground">
                      Upcoming collectible
                    </div>
                    <div className="mb-2 h-20 rounded-xl bg-gradient-to-br from-primary/30 via-accent/20 to-chart-5/30" />
                    <div className="text-[11px] font-medium text-foreground">
                      Finance Legend – Savings Summit
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Unlock by acing Unit 4
                    </div>
                  </div>
                  <div className="flex-1 rounded-2xl bg-card p-3 text-xs">
                    <div className="mb-2 text-[11px] text-muted-foreground">
                      Session snapshot
                    </div>
                    <ul className="space-y-1 text-[11px] text-muted-foreground">
                      <li>• 3 units in progress</li>
                      <li>• 24 questions answered</li>
                      <li>• 4 wrong answers scheduled to repeat</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="what-is" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">
                Your brain deserves better than boring slides.
              </h2>
              <p className="text-sm text-muted-foreground md:text-base">
                Most people learn the same critical topics – driving rules,
                basic finance, civic tests, brain health – through dry PDFs and
                random videos. Almanac turns those curriculums into a structured
                adventure. An AI tutor walks you through the concepts, tells
                stories, asks questions, and adapts as you go.
              </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card/40 p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Structured, not chaotic
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Built on real curriculums (driving tests, finance, citizenship
                  exams, and more), broken into small, replayable units.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card/40 p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  AI tutor, not AI noise
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  The AI behaves like a committed teacher: it explains, asks,
                  listens, and pushes you – within guardrails designed for
                  learning, not distraction.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card/40 p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Collectibles as proof of skill
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Finish a unit with high mastery and you unlock an NFT linked
                  to that skill. It&apos;s a souvenir of effort, not a badge you
                  can click past.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="text-2xl font-semibold text-foreground">
              How the game works
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card/40 p-5">
                <div className="text-xs font-semibold text-primary">Step 1</div>
                <h3 className="mt-2 text-sm font-semibold text-foreground">
                  Pick a path
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Choose a course: Finance Fundamentals, Brain Fallacies,
                  Driving Test Prep, Civic &amp; Citizenship, and more. Each is
                  made of short units.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card/40 p-5">
                <div className="text-xs font-semibold text-primary">Step 2</div>
                <h3 className="mt-2 text-sm font-semibold text-foreground">
                  Learn with your tutor
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  The AI tutor narrates, quizzes you, and revisits anything you
                  miss. Wrong answers are recycled until your brain truly gets
                  it.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-card/40 p-5">
                <div className="text-xs font-semibold text-primary">Step 3</div>
                <h3 className="mt-2 text-sm font-semibold text-foreground">
                  Prove it, mint it
                </h3>
                <p className="mt-2 text-xs text-muted-foreground">
                  Finish a unit with strong mastery and you unlock its NFT.
                  Minted on Polygon, stored in a wallet we create for you in the
                  background.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={"/sign-up"}
                className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Play Almanac
              </Link>
              <span className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href={"/sign-in"}
                  className="underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Log in
                </Link>
              </span>
            </div>
          </div>
        </section>

        <section id="results" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="text-2xl font-semibold text-foreground">
              Does it actually work?
            </h2>
            <div className="mt-6 grid gap-4 rounded-3xl border border-border bg-card/60 p-5 text-xs text-muted-foreground md:grid-cols-4">
              <div>
                <div className="text-[11px] text-muted-foreground">
                  Avg. mastery gain per unit
                </div>
                <div className="mt-1 text-lg font-semibold text-primary">
                  +24%
                </div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground">
                  Units completed (last 7 days)
                </div>
                <div className="mt-1 text-lg font-semibold text-foreground">
                  3,482
                </div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground">
                  Avg. focused session length
                </div>
                <div className="mt-1 text-lg font-semibold text-foreground">
                  17 min
                </div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground">
                  Retention on review quizzes
                </div>
                <div className="mt-1 text-lg font-semibold text-primary">
                  83%
                </div>
              </div>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card/40 p-4 text-xs text-muted-foreground">
                <h3 className="text-sm font-semibold text-foreground">
                  Today&apos;s activity
                </h3>
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-[11px] text-muted-foreground">
                      Streak heroes
                    </div>
                    <ul className="mt-1 space-y-1">
                      <li>@marta · 12-day streak</li>
                      <li>@lucas · 9-day streak</li>
                      <li>@naomi · 8-day streak</li>
                    </ul>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">
                      Most completed unit this week
                    </div>
                    <p className="mt-1">
                      Brain Fallacies · Unit 3: Attention Hijacks
                    </p>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className="rounded-2xl border border-border bg-card/40 p-4 text-xs text-muted-foreground">
                <h3 className="text-sm font-semibold text-foreground">
                  From the pilot
                </h3>
                <div className="mt-4 space-y-4">
                  <blockquote className="border-l-2 border-border pl-3">
                    "It feels like having a smart teacher sitting next to you,
                    but one who never gets tired of explaining things
                    differently."
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      – Pilot player, 19
                    </div>
                  </blockquote>
                  <blockquote className="border-l-2 border-border pl-3">
                    "We used Almanac at home instead of another test-prep app.
                    My kid actually asked to keep playing."
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      – Parent in the pilot
                    </div>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="nfts" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="text-2xl font-semibold text-foreground">
              Collectibles you earn, not buy.
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Every unit in Almanac has its own collectible. Finish the unit
              with a strong mastery score and you unlock the NFT. No loot boxes,
              no "mystery crates" – just proof of effort that you can keep,
              trade, or show off.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-4">
              {nftCollection.map((nft) => (
                <article
                  key={nft.id}
                  className="flex flex-col rounded-2xl border border-border bg-card/40 p-3 text-xs"
                >
                  <div className="mb-3 h-24 rounded-xl bg-gradient-to-br from-primary/30 via-accent/20 to-chart-5/30" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {nft.title}
                  </h3>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Unlock by finishing: {nft.unlockedBy}
                  </p>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    Minted by {nft.mintedCount} players
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card/40 p-4 text-xs text-muted-foreground">
                <h3 className="text-sm font-semibold text-foreground">
                  How it works
                </h3>
                <ul className="mt-3 space-y-2">
                  <li>• Minted on Polygon for low cost and low impact.</li>
                  <li>• Wallets are created automatically; no setup needed.</li>
                  <li>• In-game tokens pay for minting and transfers.</li>
                  <li>
                    • External marketplaces are optional and can come later.
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-card/40 p-4 text-xs text-muted-foreground">
                <h3 className="text-sm font-semibold text-foreground">
                  Why NFTs at all?
                </h3>
                <p className="mt-3">
                  We use NFTs as durable, ownable records of mastery. Instead of
                  another progress bar locked inside an app, you get artifacts
                  that can live in your wallet and move with you across games
                  and platforms.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="content" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="text-2xl font-semibold text-foreground">
              What you can learn in Almanac
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              We start with topics that matter for real life and come with
              well-defined curriculums. You can use Almanac to both pass tests
              and actually understand what you&apos;re doing.
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {courses.map((course) => (
                <article
                  key={course.id}
                  className="flex flex-col rounded-2xl border border-border bg-card/40 p-4 text-sm text-muted-foreground"
                >
                  <div className="mb-2 inline-flex items-center rounded-full bg-card px-3 py-1 text-[11px] text-foreground">
                    {course.tag}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {course.title}
                  </h3>
                  <p className="mt-2 text-xs">{course.description}</p>
                  <div className="mt-3 text-[11px] text-muted-foreground">
                    {course.meta}
                  </div>
                </article>
              ))}

              <article className="flex flex-col rounded-2xl border border-dashed border-border bg-card/20 p-4 text-sm text-muted-foreground">
                <div className="mb-2 inline-flex items-center rounded-full bg-card/60 px-3 py-1 text-[11px] text-foreground">
                  In development
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  Upcoming paths
                </h3>
                <p className="mt-2 text-xs">
                  We&apos;re designing courses around biology through the brain,
                  digital hygiene, and more. The white paper explains how we
                  choose and build each new path.
                </p>
                <a href="/OpenMind — White Paper.pdf" target="_blank">
                  <button className="mt-3 self-start text-[11px] text-primary underline-offset-2 hover:underline transition-all">
                    Read the roadmap in the white paper →
                  </button>
                </a>
              </article>
            </div>

            <div className="mt-8 text-xs text-muted-foreground">
              Want to bring Almanac to your curriculum or community?{" "}
              <button className="underline underline-offset-2 hover:text-foreground transition-colors">
                Contact us
              </button>
            </div>
          </div>
        </section>

        <section id="mission" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="text-2xl font-semibold text-foreground">
              Our mission: build the tutor everyone should have had.
            </h2>
            <div className="mt-4 grid gap-6 md:grid-cols-[2fr,1.2fr]">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  AI, used well, can act as a patient personal tutor for anyone
                  with a phone. Good tutoring is not just information; it&apos;s
                  motivation, narration, and structure.
                </p>
                <p>
                  We focus on critical knowledge: money, health, civic life,
                  thinking skills – the things that quietly distort lives when
                  they&apos;re missing.
                </p>
                <p>
                  We design strict constraints and guardrails so the AI behaves
                  like a teacher you&apos;d trust with your kids, not a random
                  chatbot. Almanac exists to make that kind of tutor feel normal
                  and widely available.
                </p>
              </div>

              {/* White paper card */}
              <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  White paper
                </div>
                <h3 className="mt-2 text-base font-semibold text-foreground">
                  Why we&apos;re building Almanac, and how we keep it safe.
                </h3>
                <p className="mt-3 text-xs">
                  A deep dive into our design choices: why we picked these
                  curriculums first, how the AI tutor is constrained, and what
                  we&apos;re doing to keep Almanac useful, transparent, and
                  family-friendly.
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs">
                  <button className="rounded-full bg-foreground px-4 py-2 font-semibold text-background hover:opacity-90 transition-opacity">
                    Read online
                  </button>
                  <button className="rounded-full border border-border px-4 py-2 text-foreground hover:border-muted-foreground transition-colors">
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="parents" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="text-2xl font-semibold text-foreground">
              For parents, teachers, and guardians
            </h2>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card/40 p-4 text-sm text-muted-foreground">
                <h3 className="text-sm font-semibold text-foreground">
                  Designed to be trusted
                </h3>
                <ul className="mt-3 space-y-2 text-xs">
                  <li>• No dark patterns, no casino mechanics.</li>
                  <li>
                    • We don&apos;t sell children&apos;s data or turn their
                    attention into an ad product.
                  </li>
                  <li>• Clear progress tracking you can see together.</li>
                  <li>
                    • Content based on real, verifiable curriculums and sources.
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border bg-card/40 p-4 text-sm text-muted-foreground">
                <h3 className="text-sm font-semibold text-foreground">
                  How to use Almanac
                </h3>
                <ul className="mt-3 space-y-2 text-xs">
                  <li>
                    • Parents: play through units together, discuss examples,
                    and let the AI suggest follow-up questions.
                  </li>
                  <li>
                    • Teachers: use units as pre-class warmups or after-class
                    practice; we handle repetition, you focus on context.
                  </li>
                  <li>
                    • Tutors: assign specific units and track which questions
                    your students struggle with.
                  </li>
                </ul>
                <button className="mt-4 text-xs text-primary underline-offset-2 hover:underline transition-all">
                  Get in touch about schools →
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="border-b border-border">
          <div className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="text-2xl font-semibold text-foreground">FAQ</h2>
            <div className="mt-6 space-y-3 text-sm text-muted-foreground">
              {faqs.map((item) => (
                <details
                  key={item.question}
                  className="rounded-2xl border border-border bg-card/40 px-4 py-3 transition-colors hover:bg-card/60"
                >
                  <summary className="cursor-pointer text-sm font-medium text-foreground">
                    {item.question}
                  </summary>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <div className="font-medium text-foreground">
              Almanac by OpenMind
            </div>
            <div className="mt-1">
              NFTs powered by Polygon. Wallets are created automatically for
              players.
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <a
              href="/about"
              className="hover:text-foreground transition-colors"
            >
              About
            </a>
            <a
              href="/OpenMind — White Paper.pdf"
              target="_blank"
              className="hover:text-foreground transition-colors"
            >
              White paper
            </a>
            <a
              href="mailto:hello@openmind.cx"
              className="hover:text-foreground transition-colors"
            >
              Contact
            </a>
            <a
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
