export default function WhitePaper() {
  return (
    <main className="max-w-6xl py-[60px] mx-auto px-6">
      <div className="mx-auto max-w-4xl text-center mb-12">
        <h1 className="text-4xl mb-12 font-semibold">
          OpenMind — White Paper (v3): Mastery, Certificates, and the Value
          Cycle
        </h1>
      </div>
      <hr className="mb-12" />
      <h2 className="font-semibold text-2xl mt-10 mb-4">Abstract</h2>
      <p>
        Education has an incentives problem. Systems are rewarded for minutes
        and coverage; learners are rewarded for tests they soon forget. OpenMind
        flips the incentives: we only win when the learner reaches mastery — and
        we mint a verifiable, on‑chain certificate that encodes those results.
        Here's the point: when you master something real, you mint a verifiable,
        on‑chain certificate that carries your results. It's portable, durable,
        and instantly verifiable by schools and employers.
      </p>
      <br />
      <p>
        This paper explains (1) our brain‑aware learning model and
        parent‑approved AI tutor, and (2) the{" "}
        <strong>Certificate Value Cycle —</strong> the engine that aligns
        creators, learners, and the platform around real learning. When learners
        succeed, value accrues to them first, creators second, and the platform
        last. <strong>Mastery is the growth hack.</strong>
      </p>
      <br />
      <p>
        <strong>Why now:</strong> Global outcomes fell (PISA 2022). Edtech
        impact is mixed (UNESCO 2023). The answer isn't more screens — it's
        aligned incentives and brain‑aware practice.
      </p>
      <hr className="mt-12 mb-12" />
      <h2 className="text-2xl mt-10 mb-4 font-semibold">
        1) What's Broken (and Fixable)
      </h2>
      <p>
        Think of school like a gym that celebrates attendance instead of
        strength. Platforms that prize "time on device" are that gym. Meanwhile,
        public curricula are routinely politicised, so teachers tiptoe around
        topics and students practice compliance more than reasoning. Add tools
        that ignore how memory works and we get the results we see: high effort,
        low transfer.
      </p>
      <br />
      <p>Our way forward addresses three main issues:</p>
      <br />
      <ul className="list-disc pl-8 space-y-2">
        <li>
          <strong>Minutes over mastery.</strong> Time‑on‑device is easy to
          count; competence isn't. We flip that.
        </li>
        <li>
          <strong>Politics over pedagogy.</strong> We remove ideological
          tug‑of‑war from core concepts so learners practice reasoning, not
          posture‑taking.
        </li>
        <li>
          <strong>Brain‑blind design.</strong> Forgetting wins without
          retrieval, spacing, worked examples, and interleaving. We bake them
          in.
        </li>
      </ul>
      <hr className="mt-12 mb-12" />
      <h2 className="text-2xl mb-4 font-semibold">
        2) The Learning Model (Brain‑Aware by Construction)
      </h2>
      <p>
        Retrieval practice strengthens memory like a muscle. Spaced repetition
        keeps forgetting from winning. Worked examples model thinking before we
        fade support. Interleaving makes transfer happen. We use these on
        purpose, with short cycles that don't exhaust attention.
      </p>
      <br />
      <p>
        Every unit ships <strong>Learning Science Notes</strong> so learners,
        teachers, and parents can see the why behind the design.
      </p>
      <br />
      <p>
        The AI Personal Tutor is not a free‑form "friend app." It's a coach
        that:
      </p>
      <br />
      <ul className="list-disc pl-8 space-y-2">
        <li>Motivates and narrates progress</li>
        <li>Digests concepts into plain language</li>
        <li>Generates fresh examples that match the learner's context</li>
        <li>Designs real‑world experiments and activities</li>
        <li>Shares related resources to extend learning</li>
      </ul>
      <br />
      <p>
        <strong>Guardrails:</strong> teacher/parent in the loop, explainable
        steps, age gating and quiet hours, privacy by default, and no
        'AI‑detector policing.' Instead, we keep process evidence (drafts,
        attempts, retrieval traces) that proves the work is yours.
      </p>

      <hr className="mt-12 mb-12" />

      <h2 className="font-semibold text-2xl mt-10 mb-4">
        3) The Certificate Value Cycle (the Engine)
      </h2>
      <p>
        <strong>Short version:</strong> when you learn → verify → mint, the
        whole system gets better — and the value accrues to the people doing the
        learning and creating.
      </p>
      <br />
      <h3 className="text-xl mt-6 mb-3 font-semibold">
        Step‑by‑step (course‑level flow):
      </h3>
      <ol className="list-decimal pl-8 space-y-3">
        <li>
          <strong>Learn:</strong> The learner completes a course path built on
          retrieval + spacing + worked examples.
        </li>
        <li>
          <strong>Verify mastery:</strong> The system checks spaced retrieval
          thresholds and task performance (with process evidence). No mastery,
          no minting.
        </li>
        <li>
          <strong>Mint:</strong> The learner mints a course certificate on
          Polygon. Minting needs:
          <ul>
            <li>
              A course token (granted upon finishing the final node/assessment)
            </li>
            <li>
              A small amount of in‑game currency (to cover minting fees and art
              rights)
            </li>
          </ul>
        </li>
        <li>
          <strong>Get in‑game currency:</strong> three options that preserve
          equity and control:
          <ul>
            <li>Watch ads (kept separate from learning paths)</li>
            <li>Buy currency directly</li>
            <li>Subscribe to a premium plan that includes infinite currency</li>
          </ul>
        </li>
        <li>
          <strong>Wallet creation:</strong> a personal wallet is created at the
          first mint (custodial with export).
        </li>
        <li>
          <strong>Certificate design & rarity:</strong> each course has a
          limited collection ("drop") with art that is identical per rarity tier
          but course‑specific and easily identifiable (serialised; course
          metadata; learner proofs). Drops are limited; once they sell out,
          they're gone.
        </li>
        <li>
          <strong>Primary market:</strong> initial mint goes to the learner.
          Portions of mint proceeds (after fees) flow to creators
          (teachers/authors/artists) and the platform.
        </li>
        <li>
          <strong>Secondary market (optional):</strong> certificates are
          soulbound by default for fraud prevention and dignity; the learner can
          enable transfer later. If traded or gifted, creators may receive
          royalties. We do not market certificates as investments; there are no
          guarantees of value.
        </li>
        <li>
          <strong>Use & display:</strong> certificates are verifiable
          credentials with on‑chain integrity and off‑chain privacy. Learners
          share them with schools/employers or display at home.
        </li>
        <li>
          <strong>Growth loop:</strong> proud learners bring in more learners
          (social sharing, referrals). Creator income funds more and better
          courses. The platform reinvests in pedagogy and safety. Mastery fuels
          the flywheel.
        </li>
      </ol>
      <hr className="mt-12 mb-12" />

      <h2 className="font-semibold text-2xl mt-10 mb-4">
        4) Why Certificates Can Accrue Cultural Value (Without Speculation)
      </h2>
      <p>
        Imagine you could see the verifiable certificate from a first physics
        class, complete with learning traces and early notes. Even if the
        learner later becomes "Einstein‑level," the certificate's value isn't
        hype; it's provenance — a signed artefact of real work at a real time.
      </p>
      <p>
        That's why we anchor proofs on‑chain and keep details private off‑chain:
        durable verification without leaking personal data.
      </p>
      <br />
      <p>
        We design for <strong>use first</strong> (study validation, employment)
        and <strong>cultural value second</strong> (display, collection, gifting
        across generations). Like all culture, some items become mementos that
        matter. Use first, culture second — cultural value is a by‑product of
        provenance.
      </p>
      <hr className="mt-12 mb-12" />

      <h2 className="font-semibold text-2xl mt-10 mb-4">
        5) On‑Chain Design & Privacy (What We Publish, What We Don't)
      </h2>
      <ul className="list-disc pl-8 space-y-2">
        <li>
          <strong>Standards:</strong> W3C Verifiable Credentials (VC 2.0) for
          the credential; ERC‑721 for the certificate token.
        </li>
        <li>
          <strong>On‑chain:</strong> metadata pointers + integrity hashes;
          issuer/creator IDs; timestamp; course + rarity;
          revocation/supersession flags.
        </li>
        <li>
          <strong>Off‑chain (with holder consent):</strong> detailed score
          vectors, artefacts, and process evidence — shared via signed links;
          never dumped on‑chain.
        </li>
        <li>
          <strong>Revocation/Correction:</strong> no silent edits. We issue a
          superseding certificate and flag the old one in a public issuer
          registry.
        </li>
        <li>
          <strong>Minors:</strong> Certificates can be held and displayed;
          transfers are restricted to guardians until age of majority.
        </li>
      </ul>
      <hr className="mt-12 mb-12" />

      <h2 className="font-semibold text-2xl mt-10 mb-4">
        6) Roles & Incentives (Aligned, on Purpose)
      </h2>
      <ul className="list-disc pl-8 space-y-2">
        <li>
          <strong>Learners</strong> earn recognition that travels and endures.
          Minting is unlocked by mastery, not minutes.
        </li>
        <li>
          <strong>Creators</strong> (teachers, authors, artists) are paid on
          primary mints and (optionally) via royalties; they also gain
          reputation via a public creator profile tied to audited courses.
        </li>
        <li>
          <strong>Parents & Schools</strong> get dashboards with explainable AI
          steps, weekly summaries, and one‑click verification of results.
        </li>
        <li>
          <strong>The Platform</strong> only grows when the others do — measured
          by verified mastery, certificate verifications, and long‑term
          retention.
        </li>
      </ul>
      <hr className="mt-12 mb-12" />

      <h2 className="font-semibold text-2xl mt-10 mb-4">
        7) Product System (How It's Built)
      </h2>
      <ul className="list-disc pl-8 space-y-2">
        <li>
          <strong>Learner App:</strong> mastery journeys, retrieval calendar,
          worked examples, lab activities, AI tutor with explainable steps.
        </li>
        <li>
          <strong>Authoring Studio:</strong> bias‑checks, multi‑review workflow,
          and embedded Learning Science Notes for each unit.
        </li>
        <li>
          <strong>Org Console:</strong> cohort analytics, standards mapping,
          verification reports.
        </li>
        <li>
          <strong>Wallet & Credentials:</strong> issue/export verifiable
          credentials; custody with export; rotation and recovery; consented
          verification links.
        </li>
      </ul>
      <hr className="mt-12 mb-12" />

      <h2 className="font-semibold text-2xl mt-10 mb-4">
        8) Governance, Safety, and Parent Trust
      </h2>
      <ul className="list-disc pl-8 space-y-2">
        <li>
          Human‑in‑the‑loop for sensitive content; age‑appropriate defaults;
          clear appeals.
        </li>
        <li>
          Data minimisation and regional hosting options; never sell personal
          data; no third‑party ad tracking.
        </li>
        <li>
          Transparent operations: public changelog for content and safety;
          red‑team prompts and publish outcomes.
        </li>
        <li>
          <strong>Parent visibility:</strong> Weekly summary that shows exactly
          what the AI did — prompts, sources, and practice — for their child.
        </li>
      </ul>
      <hr className="mt-12 mb-12" />

      <h2 className="font-semibold text-2xl mt-10 mb-4">
        9) Impact & What We'll Measure
      </h2>
      <ul className="list-disc pl-8 space-y-2">
        <li>
          <strong>Mastery lift:</strong> % hitting retrieval thresholds at
          7/14/30/90 days.
        </li>
        <li>
          <strong>Transfer:</strong> performance on interleaved vs. blocked
          tasks.
        </li>
        <li>
          <strong>Verification:</strong> certificates verified by
          schools/employers (count and share of active learners).
        </li>
        <li>
          <strong>Equity:</strong> use in low‑bandwidth contexts.
        </li>
        <li>
          <strong>Trust:</strong> parent/teacher satisfaction; incident rates.
        </li>
        <li>
          <strong>Creator sustainability:</strong> creator payouts;
          time‑to‑revision on substantiated flags.
        </li>
      </ul>
      <hr className="mt-12 mb-12" />

      <h2 className="font-semibold text-2xl mt-10 mb-4">
        Appendix A — Certificate Value Cycle
      </h2>
      <p>
        1) Learn → 2) Verify → 3) Mint (course token + in‑game currency) → 4)
        Wallet auto‑created → 5) Limited drop issued → 6) Primary proceeds split
        (creator/platform) → 7) Optional secondary with royalties → 8)
        Share/verify/display → 9) Referrals and enrolment lift → 10) Reinvest.
      </p>
      <br />
      <p>
        <strong>Notes:</strong>
      </p>
      <ul className="list-disc pl-8 space-y-2">
        <li>Ads never influence learning pathways.</li>
        <li>
          Drops are course‑specific and rarity‑based; art is identical within a
          tier but clearly identifiable across courses.
        </li>
        <li>Limited collections mean scarcity is policy, not speculation.</li>
      </ul>
      <hr className="mt-12 mb-12" />

      <h2 className="font-semibold text-2xl mt-10 mb-4">
        Appendix B — On‑Chain & VC Spec (Outline)
      </h2>
      <ul className="list-disc pl-8 space-y-2">
        <li>
          <strong>Token:</strong> ERC‑721 with creator royalties (EIP‑2981);
          soulbound by default; learner can enable transfer.
        </li>
        <li>
          <strong>VC Claims:</strong> issuer DID, subject DID, achievement,
          score digest, timestamps, process‑evidence digest.
        </li>
        <li>
          <strong>Privacy:</strong> off‑chain artefacts in signed storage;
          consented access; on‑chain hash for integrity.
        </li>
        <li>
          <strong>Revocation:</strong> superseding issue + public flag.
        </li>
      </ul>
      <hr className="mt-12 mb-12" />

      <h2 className="font-semibold text-2xl mt-10 mb-4">
        Appendix C — Glossary
      </h2>
      <ul className="list-disc pl-8 space-y-2">
        <li>
          <strong>Course token:</strong> Non‑transferable grant issued after
          passing the final assessment; required to mint a certificate; limited
          per learner per course.
        </li>
        <li>
          <strong>In‑game currency:</strong> Utility credits used to cover
          mint/art costs; obtained via ads, direct purchase, or a premium plan
          that includes infinite in‑game currency.
        </li>
        <li>
          <strong>Soulbound (default):</strong> Non‑transferable until the owner
          explicitly enables transfer.
        </li>
        <li>
          <strong>Process evidence:</strong> Drafts, attempts, and retrieval
          traces that demonstrate authentic work.
        </li>
        <li>
          <strong>VC 2.0:</strong> W3C Verifiable Credentials, the open standard
          for portable, cryptographically signed credentials.
        </li>
      </ul>
      <hr className="mt-12 mb-12" />

      <h2 className="font-semibold text-2xl mt-10 mb-4">Closing</h2>
      <p>
        If school has felt like a place where showing up mattered more than
        growing up, this is your way forward. We align the economics of learning
        to the act of learning itself. When you master something real, you get a
        credential that lasts, creators get paid to make more of what works, and
        the rest of us get a smarter world.
      </p>
      <p>
        <strong>Mastery is the point. Everything else should orbit it.</strong>
      </p>
    </main>
  );
}
