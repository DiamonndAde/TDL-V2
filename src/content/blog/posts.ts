import type { Post } from "@/lib/blog/types";

/**
 * Local blog posts, read only by src/lib/blog (the boundary check enforces it).
 *
 * TODO(client): Q34 — all three are SAMPLE posts written for the demo in TDL's voice, on general, evergreen HR
 * topics. They carry no statistics, no client names, no tax or pension rates and no deadlines (Nigerian rules
 * change), and need TDL's approval, edits or replacement before launch.
 */
export const localPosts: Omit<Post, "readingMinutes">[] = [
  {
    slug: "what-to-look-for-in-an-hr-outsourcing-partner",
    title: "What to look for in an HR outsourcing partner",
    excerpt:
      "Handing your people operations to another firm is a decision about trust. Here is what to ask before you sign, and what the answers should sound like.",
    date: "2026-10-26",
    cover: "blog:what-to-look-for-in-an-hr-outsourcing-partner",
    body: [
      {
        type: "p",
        text: "Outsourcing HR is not the same as buying software or hiring a cleaner. You are asking another firm to look after the people who run your business: their contracts, their pay, their records and, often, their day-to-day problems. When it works, your managers get their time back and your staff barely notice the change. When it does not, everyone notices. These are the questions we would ask if we were in your seat.",
      },
      { type: "h2", text: "Do they already run work like yours?" },
      {
        type: "p",
        text: "Ask what kinds of roles, sites and headcounts the partner manages today, not what they could manage in theory. A firm that runs field staff across several states has solved problems that a firm used to one office has not met yet: getting documents from people who are rarely at a desk, handling different working patterns, keeping one standard across locations.",
      },
      { type: "h2", text: "Who will you actually deal with?" },
      {
        type: "p",
        text: "Find out who your named contact is, who covers for them, and how quickly they answer. A partner that sends a senior team to the pitch and a rotating inbox after the contract is signed will cost you more in follow-up than it saves in fees.",
      },
      { type: "h2", text: "How do they handle what goes wrong?" },
      {
        type: "p",
        text: "Every HR operation meets disciplinary cases, disputes and mistakes. Ask the partner to walk you through how they handled a difficult case, step by step. Listen for a documented process, fair treatment of the employee, and a clear point at which you are told and asked to decide.",
      },
      { type: "h2", text: "What do they report, and how often?" },
      {
        type: "p",
        text: "You should be able to see what is happening without asking. Agree at the start which reports you will receive, how often, and in what form. Good partners suggest this before you do.",
      },
      {
        type: "ul",
        items: [
          "A regular summary of headcount, joiners and leavers.",
          "Open employee-relations cases and where each one stands.",
          "Payroll and statutory remittance confirmations, where they run payroll for you.",
          "Anything that needs your decision, flagged rather than buried.",
        ],
      },
      { type: "h2", text: "How do they look after your data?" },
      {
        type: "p",
        text: "Your partner will hold personal information about every one of your staff. Ask how it is stored, who can see it, how access is removed when someone leaves, and how they comply with Nigeria's data protection rules. A firm that takes this seriously will answer in detail and will have the paperwork to show it.",
      },
      { type: "h2", text: "Can you leave cleanly?" },
      {
        type: "p",
        text: "It is a fair question to ask on the first day. Find out what happens to your records and your staff files if the arrangement ends, and how long a handover takes. A partner confident in its work will make leaving straightforward, because it does not expect you to want to.",
      },
      {
        type: "p",
        text: "If you are weighing up HR outsourcing and want to talk through how it would work for your organisation, we are glad to have that conversation, with no obligation either way.",
      },
    ],
  },
  {
    slug: "running-payroll-across-more-than-one-state",
    title: "Running payroll across more than one state",
    excerpt:
      "Once your staff work in more than one state, payroll stops being one calculation run many times. What changes, and how to stay in control.",
    date: "2026-10-26",
    cover: "blog:running-payroll-across-more-than-one-state",
    body: [
      {
        type: "p",
        text: "Many organisations start with everyone in one city. Then a second office opens, a project needs people on another site, or the field team spreads out. Payroll that used to be a single routine becomes several, and the differences between them are where mistakes creep in.",
      },
      { type: "h2", text: "Where your people work matters" },
      {
        type: "p",
        text: "Personal income tax in Nigeria is administered by the states, and the state that is owed depends on where an employee is resident. When staff are spread across states, deductions have to be remitted to the right authority for each person, and that has to stay right when people move. The rules and rates are set by law and change from time to time, so they should be checked against current guidance rather than copied from last year's spreadsheet.",
      },
      { type: "h2", text: "Keep one source of truth" },
      {
        type: "p",
        text: "The most common problem we see is not a wrong calculation but two lists that disagree: HR has one record of who works where, and payroll has another. Decide which record is the master, make every change there first, and let payroll follow it.",
      },
      {
        type: "ul",
        items: [
          "Record each employee's state of residence and work location, with the date of any change.",
          "Make transfers between sites a formal change, not an email.",
          "Close the HR record for a leaver before the payroll run, not after.",
        ],
      },
      { type: "h2", text: "Run to a calendar" },
      {
        type: "p",
        text: "Each payroll run has a cut-off for changes, a review, an approval and a payment date, and each statutory remittance has its own due date. Put all of them on one calendar that everyone involved can see. A missed cut-off is easy to recover from; a missed remittance can bring penalties.",
      },
      { type: "h2", text: "Check before you pay" },
      {
        type: "p",
        text: "Before approving a run, compare it with the previous month. Large changes in gross pay, new names, missing names and changes to bank details all deserve a second look. This takes minutes and catches most of the errors that would otherwise take weeks to unwind.",
      },
      { type: "h2", text: "Keep the records" },
      {
        type: "p",
        text: "Keep payslips, remittance evidence and approvals for every run, filed so that anyone can find them. When a question comes from an employee, an auditor or a tax authority, a complete record turns a long argument into a short answer.",
      },
      {
        type: "p",
        text: "Running payroll for staff in several states is routine work for us. If yours is becoming harder to keep straight, talk to us about how we would take it on.",
      },
    ],
  },
  {
    slug: "why-background-checks-matter-before-an-offer",
    title: "Why background checks matter before an offer",
    excerpt:
      "A strong interview tells you how someone presents. A background check tells you whether what they told you is true. Why the check belongs before the offer, not after.",
    date: "2026-10-26",
    cover: "blog:why-background-checks-matter-before-an-offer",
    body: [
      {
        type: "p",
        text: "Most hiring mistakes are not about skill. They come from something that was said in an application or an interview and never checked: a qualification that was not finished, a previous role that was smaller than described, a reason for leaving that was not the real one. A background check is how you find out before it becomes your problem.",
      },
      { type: "h2", text: "What a check covers" },
      {
        type: "p",
        text: "The right checks depend on the role, but most pre-employment screening looks at the same few things.",
      },
      {
        type: "ul",
        items: [
          "Identity and address: that the person is who they say they are and lives where they say they do.",
          "Education and professional qualifications, confirmed with the institution that awarded them.",
          "Employment history: dates, roles and, where possible, the reason for leaving.",
          "References, from people who actually managed the candidate.",
          "Criminal record checks, where the role and the law make them appropriate.",
        ],
      },
      { type: "h2", text: "Why before the offer" },
      {
        type: "p",
        text: "Once an offer is accepted, the candidate may resign from their current job, and withdrawing becomes harder for everyone. Making the offer conditional on satisfactory checks, and completing them before the start date, protects both sides. The candidate knows exactly what will be checked, and you are not unpicking a decision after someone has started.",
      },
      { type: "h2", text: "Be fair and be clear" },
      {
        type: "p",
        text: "Tell candidates which checks you will run and ask for their consent. Handle what you collect as personal data: keep it secure, use it only for the hiring decision, and keep it no longer than you need to. If a check turns up something that concerns you, give the candidate a chance to explain before you decide. Sometimes there is a simple answer.",
      },
      { type: "h2", text: "Match the check to the role" },
      {
        type: "p",
        text: "A role that handles cash, sensitive data or vulnerable people calls for deeper checks than one that does not. Decide the level for each kind of role in advance, write it down, and apply it consistently, so that every candidate for the same job is treated the same way.",
      },
      {
        type: "p",
        text: "We run pre-employment background checks as part of our recruitment service and on their own. If you would like checks completed before your next offer goes out, get in touch.",
      },
    ],
  },
];
