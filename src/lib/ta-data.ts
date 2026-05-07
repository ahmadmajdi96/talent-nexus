// HireFlow mock data — the talent acquisition source of truth.
// Designed to interoperate with CoreHR (People Hub) employee + requisition shapes.

export type ReqStatus = "DRAFT" | "PENDING_APPROVAL" | "OPEN" | "ON_HOLD" | "FILLED" | "CLOSED";
export type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN";
export type Stage = "NEW" | "SCREEN" | "PHONE_INT" | "ONSITE" | "OFFER" | "HIRED" | "REJECTED";
export const STAGES: Stage[] = ["NEW", "SCREEN", "PHONE_INT", "ONSITE", "OFFER", "HIRED"];
export const STAGE_LABEL: Record<Stage, string> = {
  NEW: "New",
  SCREEN: "Screen",
  PHONE_INT: "Phone Interview",
  ONSITE: "Onsite",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

export interface Requisition {
  id: string;
  title: string;
  department: string;
  costCenter: string;
  legalEntity: string;
  location: string;
  country: string;
  level: string; // grade/band
  employmentType: EmploymentType;
  openings: number;
  hiringManagerId: string;
  hiringManagerName: string;
  recruiterId: string;
  recruiterName: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  justification: string;
  backfill: boolean;
  skills: string[];
  description: string;
  status: ReqStatus;
  approvalChain: { role: string; name: string; status: "PENDING" | "APPROVED" | "REJECTED"; at?: string }[];
  postings: { board: "Internal" | "LinkedIn" | "Indeed" | "Glassdoor" | "Referral"; postedAt?: string; live: boolean }[];
  openedAt: string;
  targetStart: string;
  candidates: number;
  workgridForecastId?: string; // linked WorkGrid project staffing forecast
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  country: string;
  source: "Career Site" | "Referral" | "Recruiter Sourced" | "Agency" | "LinkedIn" | "Indeed";
  referrerEmployeeId?: string;
  agencyId?: string;
  reqId: string;
  stage: Stage;
  rating?: 1 | 2 | 3 | 4 | 5;
  appliedAt: string;
  resume: {
    summary: string;
    skills: string[];
    experience: { title: string; company: string; from: string; to: string; summary: string }[];
    education: { school: string; degree: string; year: string }[];
    languages: string[];
  };
  scorecards: Scorecard[];
  events: { at: string; type: "STAGE_MOVE" | "EMAIL" | "CALL" | "INTERVIEW" | "NOTE" | "OFFER" | "HIRED"; text: string; actor: string }[];
  assessment?: { name: string; score: number; max: number };
  consent: { gdpr: boolean; talentPool: boolean; expiresAt: string };
  anonymousMode: boolean; // for OFCCP/EEO bias-free screening
  diversity?: { gender?: string; ethnicity?: string; veteran?: boolean; disability?: boolean }; // self-id
}

export interface Scorecard {
  id: string;
  interviewerId: string;
  interviewerName: string;
  focus: string; // e.g. "Technical", "Culture"
  competencies: { label: string; score: 1 | 2 | 3 | 4 | 5 }[];
  notes: string;
  recommendation: "STRONG_HIRE" | "HIRE" | "NO_HIRE" | "STRONG_NO_HIRE";
  submittedAt?: string;
  finalized?: boolean;
  finalizedAt?: string;
  signature?: string; // interviewer e-signature (typed name)
}

export interface HiringDecision {
  candidateId: string;
  decidedBy: string;
  decidedById: string;
  decision: "ADVANCE" | "HIRE" | "REJECT" | "HOLD";
  rationale: string;
  decidedAt: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  reqId: string;
  round: string;
  scheduledAt: string;
  durationMin: number;
  mode: "Video" | "Onsite" | "Phone";
  link?: string;
  interviewers: { id: string; name: string; focus: string; submitted: boolean }[];
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
}

export interface Offer {
  id: string;
  candidateId: string;
  reqId: string;
  baseSalary: number;
  currency: string;
  bonusPct: number;
  equity?: string;
  startDate: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  approvals: { role: string; name: string; status: "PENDING" | "APPROVED" | "REJECTED" }[];
  sentAt?: string;
  decisionAt?: string;
}

export interface Referral {
  id: string;
  reqId: string;
  candidateId: string;
  referrerEmployeeId: string;
  referrerName: string;
  bonusAmount: number;
  currency: string;
  status: "PENDING" | "ELIGIBLE" | "PAID" | "INELIGIBLE";
  submittedAt: string;
}

export interface Agency {
  id: string;
  name: string;
  contact: string;
  feePct: number;
  activeSubmissions: number;
  hires: number;
  rating: 1 | 2 | 3 | 4 | 5;
}

// ---------------- Seed data ----------------

export const requisitions: Requisition[] = [
  {
    id: "REQ-2026-0088", title: "Senior Product Designer", department: "Product", costCenter: "CC-300",
    legalEntity: "CoreFlow UK Ltd.", location: "London", country: "GB", level: "L4",
    employmentType: "FULL_TIME", openings: 1,
    hiringManagerId: "EMP-1004", hiringManagerName: "Marcus Lindberg",
    recruiterId: "EMP-1007", recruiterName: "Nora Haddad",
    salaryMin: 70000, salaryMax: 90000, currency: "GBP",
    justification: "Strategic — net new headcount to lead Design System v2 ahead of WG-PRJ-114.",
    backfill: false,
    skills: ["Figma","Design Systems","Prototyping","User Research"],
    description: "Lead the redesign of the CoreFlow Design System v2. Partner with Engineering & Product across 4 product lines.",
    status: "OPEN",
    approvalChain: [
      { role: "Hiring Manager", name: "Marcus Lindberg", status: "APPROVED", at: "2026-04-02" },
      { role: "Department Head", name: "David Chen", status: "APPROVED", at: "2026-04-03" },
      { role: "Finance", name: "Adesina Okafor", status: "APPROVED", at: "2026-04-05" },
      { role: "HR Director", name: "Amina Al-Farsi", status: "APPROVED", at: "2026-04-06" },
    ],
    postings: [
      { board: "Internal", postedAt: "2026-04-07", live: true },
      { board: "LinkedIn", postedAt: "2026-04-07", live: true },
      { board: "Indeed", postedAt: "2026-04-08", live: true },
      { board: "Glassdoor", postedAt: "2026-04-08", live: true },
      { board: "Referral", postedAt: "2026-04-07", live: true },
    ],
    openedAt: "2026-04-06", targetStart: "2026-07-01", candidates: 23,
    workgridForecastId: "WG-FCT-2026-114",
  },
  {
    id: "REQ-2026-0091", title: "Senior Backend Engineer", department: "Engineering", costCenter: "CC-200",
    legalEntity: "CoreFlow India Pvt Ltd", location: "Bangalore", country: "IN", level: "L5",
    employmentType: "FULL_TIME", openings: 2,
    hiringManagerId: "EMP-1002", hiringManagerName: "David Chen",
    recruiterId: "EMP-1007", recruiterName: "Nora Haddad",
    salaryMin: 4500000, salaryMax: 5500000, currency: "INR",
    justification: "Backfill (1) + Strategic (1) — distributed systems team scale-up.",
    backfill: true,
    skills: ["Go","Kubernetes","Kafka","PostgreSQL","gRPC"],
    description: "Build event-streaming services powering WorkGrid project staffing forecasts.",
    status: "OPEN",
    approvalChain: [
      { role: "Hiring Manager", name: "David Chen", status: "APPROVED", at: "2026-04-10" },
      { role: "Department Head", name: "David Chen", status: "APPROVED", at: "2026-04-10" },
      { role: "Finance", name: "Adesina Okafor", status: "APPROVED", at: "2026-04-12" },
    ],
    postings: [
      { board: "Internal", postedAt: "2026-04-12", live: true },
      { board: "LinkedIn", postedAt: "2026-04-12", live: true },
      { board: "Referral", postedAt: "2026-04-12", live: true },
    ],
    openedAt: "2026-04-12", targetStart: "2026-07-15", candidates: 41,
    workgridForecastId: "WG-FCT-2026-118",
  },
  {
    id: "REQ-2026-0095", title: "Account Executive — DACH", department: "Sales", costCenter: "CC-400",
    legalEntity: "CoreFlow Deutschland GmbH", location: "Berlin", country: "DE", level: "L4",
    employmentType: "FULL_TIME", openings: 1,
    hiringManagerId: "EMP-1010", hiringManagerName: "Olivia Nakamura",
    recruiterId: "EMP-1007", recruiterName: "Nora Haddad",
    salaryMin: 75000, salaryMax: 95000, currency: "EUR",
    justification: "Strategic — open DACH territory. Aligned with FY26 GTM plan.",
    backfill: false,
    skills: ["Enterprise Sales","MEDDPICC","Salesforce","German"],
    description: "Own DACH new-logo pipeline. Quota €1.4M ARR.",
    status: "OPEN",
    approvalChain: [
      { role: "Hiring Manager", name: "Olivia Nakamura", status: "APPROVED", at: "2026-04-04" },
      { role: "Finance", name: "Adesina Okafor", status: "APPROVED", at: "2026-04-08" },
    ],
    postings: [
      { board: "LinkedIn", postedAt: "2026-04-09", live: true },
      { board: "Indeed", postedAt: "2026-04-09", live: true },
    ],
    openedAt: "2026-04-08", targetStart: "2026-06-15", candidates: 32,
  },
  {
    id: "REQ-2026-0099", title: "DevOps Engineer", department: "Engineering", costCenter: "CC-200",
    legalEntity: "CoreFlow Ireland Ltd.", location: "Dublin", country: "IE", level: "L4",
    employmentType: "FULL_TIME", openings: 1,
    hiringManagerId: "EMP-1002", hiringManagerName: "David Chen",
    recruiterId: "EMP-1007", recruiterName: "Nora Haddad",
    salaryMin: 75000, salaryMax: 95000, currency: "EUR",
    justification: "Strategic — second DevOps for 24/7 coverage.",
    backfill: false,
    skills: ["AWS","Terraform","Argo CD","Observability"],
    description: "Platform reliability + CI/CD across 4 clusters.",
    status: "PENDING_APPROVAL",
    approvalChain: [
      { role: "Hiring Manager", name: "David Chen", status: "APPROVED", at: "2026-05-02" },
      { role: "Finance", name: "Adesina Okafor", status: "PENDING" },
      { role: "HR Director", name: "Amina Al-Farsi", status: "PENDING" },
    ],
    postings: [],
    openedAt: "2026-05-01", targetStart: "2026-08-15", candidates: 0,
  },
  {
    id: "REQ-2026-0102", title: "Frontend Engineer (Intern)", department: "Engineering", costCenter: "CC-200",
    legalEntity: "CoreFlow Korea Ltd.", location: "Seoul", country: "KR", level: "L1",
    employmentType: "INTERN", openings: 2,
    hiringManagerId: "EMP-1002", hiringManagerName: "David Chen",
    recruiterId: "EMP-1007", recruiterName: "Nora Haddad",
    salaryMin: 30000, salaryMax: 36000, currency: "USD",
    justification: "Strategic — university partnership pipeline.",
    backfill: false,
    skills: ["React","TypeScript","Tailwind"],
    description: "12-week summer internship with conversion potential.",
    status: "DRAFT",
    approvalChain: [
      { role: "Hiring Manager", name: "David Chen", status: "PENDING" },
    ],
    postings: [],
    openedAt: "2026-05-05", targetStart: "2026-06-20", candidates: 0,
  },
];

const fakeResume = (skills: string[], summary: string) => ({
  summary,
  skills,
  experience: [
    { title: "Senior Engineer", company: "Vega Systems", from: "2022", to: "Present", summary: "Led platform reliability." },
    { title: "Engineer II", company: "Northwind Labs", from: "2019", to: "2022", summary: "Built event-streaming pipeline." },
  ],
  education: [{ school: "Imperial College London", degree: "BSc Computer Science", year: "2019" }],
  languages: ["English"],
});

export const candidates: Candidate[] = [
  // Designer pipeline
  { id: "C-0098", firstName: "Imogen", lastName: "Walsh", email: "imogen.walsh@example.com", phone: "+44 79 4444 1212", location: "London", country: "GB", source: "Career Site", reqId: "REQ-2026-0088", stage: "NEW", appliedAt: "2026-05-04", resume: fakeResume(["Figma","Design Systems"],"7y product designer, fintech."), scorecards: [], events: [{ at: "2026-05-04", type: "STAGE_MOVE", text: "Applied via Career Site", actor: "system" }], consent: { gdpr: true, talentPool: true, expiresAt: "2027-05-04" }, anonymousMode: false },
  { id: "C-0101", firstName: "Felix", lastName: "Brand", email: "felix.brand@example.com", phone: "+44 79 7777 8181", location: "Manchester", country: "GB", source: "LinkedIn", reqId: "REQ-2026-0088", stage: "NEW", appliedAt: "2026-05-05", resume: fakeResume(["Figma","User Research"],"Designer with research background."), scorecards: [], events: [{ at: "2026-05-05", type: "STAGE_MOVE", text: "Sourced from LinkedIn", actor: "Nora Haddad" }], consent: { gdpr: true, talentPool: false, expiresAt: "2027-05-05" }, anonymousMode: true },
  { id: "C-0042", firstName: "Reina", lastName: "Patel", email: "reina.patel@example.com", phone: "+44 79 1234 0099", location: "London", country: "GB", source: "Referral", referrerEmployeeId: "EMP-1003", reqId: "REQ-2026-0088", stage: "SCREEN", rating: 4, appliedAt: "2026-04-22", resume: fakeResume(["Figma","Design Systems","Prototyping"],"Senior designer, ex-FinFlow."), scorecards: [], events: [{ at: "2026-04-22", type: "STAGE_MOVE", text: "Referred by Sarah Khan", actor: "system" }, { at: "2026-04-25", type: "STAGE_MOVE", text: "Moved to Screen", actor: "Nora Haddad" }], assessment: { name: "Design Take-home", score: 84, max: 100 }, consent: { gdpr: true, talentPool: true, expiresAt: "2027-04-22" }, anonymousMode: false, diversity: { gender: "F", ethnicity: "South Asian" } },
  { id: "C-0088", firstName: "Yusuf", lastName: "Demir", email: "yusuf.demir@example.com", phone: "+44 78 5555 0123", location: "London", country: "GB", source: "Agency", agencyId: "AG-002", reqId: "REQ-2026-0088", stage: "SCREEN", rating: 3, appliedAt: "2026-04-26", resume: fakeResume(["Figma","Brand"],"Brand+product hybrid."), scorecards: [], events: [{ at: "2026-04-26", type: "STAGE_MOVE", text: "Submitted by DesignTalent Co.", actor: "agency" }], consent: { gdpr: true, talentPool: false, expiresAt: "2027-04-26" }, anonymousMode: false },
  { id: "C-0015", firstName: "Maya", lastName: "Kowalski", email: "maya.k@example.com", phone: "+48 600 123 456", location: "Warsaw", country: "PL", source: "LinkedIn", reqId: "REQ-2026-0088", stage: "PHONE_INT", rating: 5, appliedAt: "2026-04-12", resume: fakeResume(["Figma","Design Systems","Tokens"],"Built design tokens at 3 startups."), scorecards: [], events: [], consent: { gdpr: true, talentPool: true, expiresAt: "2027-04-12" }, anonymousMode: false },
  { id: "C-0077", firstName: "Diego", lastName: "Marín", email: "diego.marin@example.com", phone: "+34 612 999 010", location: "Barcelona", country: "ES", source: "Career Site", reqId: "REQ-2026-0088", stage: "PHONE_INT", rating: 4, appliedAt: "2026-04-15", resume: fakeResume(["Figma","Motion","Prototyping"],"Designer + motion specialist."), scorecards: [], events: [], consent: { gdpr: true, talentPool: true, expiresAt: "2027-04-15" }, anonymousMode: false },
  { id: "C-0102", firstName: "Hana", lastName: "Yıldız", email: "hana.y@example.com", phone: "+90 532 111 2222", location: "Istanbul", country: "TR", source: "Referral", referrerEmployeeId: "EMP-1012", reqId: "REQ-2026-0088", stage: "ONSITE", rating: 5, appliedAt: "2026-04-08", resume: fakeResume(["Figma","Research","Accessibility","Design Systems"],"Lead designer, accessibility champion."), scorecards: [
    { id: "SC-1", interviewerId: "EMP-1004", interviewerName: "Marcus Lindberg", focus: "Design Craft", competencies: [{ label: "Visual Design", score: 5 },{ label: "Systems Thinking", score: 5 },{ label: "Communication", score: 4 }], notes: "Outstanding portfolio, very strong on tokens.", recommendation: "STRONG_HIRE", submittedAt: "2026-05-02" },
  ], events: [], consent: { gdpr: true, talentPool: true, expiresAt: "2027-04-08" }, anonymousMode: false, diversity: { gender: "F", ethnicity: "Middle Eastern" } },
  { id: "C-0081", firstName: "Aaron", lastName: "Goldberg", email: "aaron.g@example.com", phone: "+1 415 999 0001", location: "San Francisco", country: "US", source: "LinkedIn", reqId: "REQ-2026-0088", stage: "ONSITE", rating: 4, appliedAt: "2026-04-10", resume: fakeResume(["Figma","Prototyping","Leadership"],"Staff designer, ex-Atlassian."), scorecards: [], events: [], consent: { gdpr: true, talentPool: true, expiresAt: "2027-04-10" }, anonymousMode: false },
  { id: "C-0099", firstName: "Lina", lastName: "Sørensen", email: "lina.s@example.com", phone: "+45 22 33 44 55", location: "Copenhagen", country: "DK", source: "Referral", referrerEmployeeId: "EMP-1004", reqId: "REQ-2026-0088", stage: "OFFER", rating: 5, appliedAt: "2026-03-28", resume: fakeResume(["Figma","Design Systems","Leadership","User Research"],"Design systems lead, OSS contributor."), scorecards: [
    { id: "SC-2", interviewerId: "EMP-1004", interviewerName: "Marcus Lindberg", focus: "Design Craft", competencies: [{ label: "Visual Design", score: 5 },{ label: "Systems Thinking", score: 5 }], notes: "Best candidate I've seen this year.", recommendation: "STRONG_HIRE", submittedAt: "2026-04-29" },
    { id: "SC-3", interviewerId: "EMP-1003", interviewerName: "Sarah Khan", focus: "Culture", competencies: [{ label: "Collaboration", score: 5 },{ label: "Ownership", score: 5 }], notes: "Will elevate the team.", recommendation: "STRONG_HIRE", submittedAt: "2026-04-30" },
  ], events: [{ at: "2026-04-30", type: "OFFER", text: "Offer extended at GBP 88,000", actor: "Nora Haddad" }], consent: { gdpr: true, talentPool: true, expiresAt: "2027-03-28" }, anonymousMode: false, diversity: { gender: "F" } },

  // Backend pipeline
  { id: "C-0210", firstName: "Arjun", lastName: "Mehta", email: "arjun.m@example.com", phone: "+91 98 1111 2222", location: "Bangalore", country: "IN", source: "Career Site", reqId: "REQ-2026-0091", stage: "NEW", appliedAt: "2026-05-04", resume: fakeResume(["Go","Kafka","PostgreSQL"],"Backend engineer, distributed systems."), scorecards: [], events: [], consent: { gdpr: true, talentPool: true, expiresAt: "2027-05-04" }, anonymousMode: false },
  { id: "C-0211", firstName: "Wei", lastName: "Zhang", email: "wei.z@example.com", phone: "+65 8888 1212", location: "Singapore", country: "SG", source: "LinkedIn", reqId: "REQ-2026-0091", stage: "SCREEN", rating: 4, appliedAt: "2026-05-01", resume: fakeResume(["Go","Kubernetes","gRPC"],"Senior infra engineer."), scorecards: [], events: [], consent: { gdpr: true, talentPool: true, expiresAt: "2027-05-01" }, anonymousMode: false },
  { id: "C-0212", firstName: "Sneha", lastName: "Iyer", email: "sneha.iyer@example.com", phone: "+91 90 0000 1234", location: "Hyderabad", country: "IN", source: "Referral", referrerEmployeeId: "EMP-1005", reqId: "REQ-2026-0091", stage: "PHONE_INT", rating: 5, appliedAt: "2026-04-29", resume: fakeResume(["Go","Kafka","PostgreSQL","gRPC"],"6y at FinTech, scaled 10x."), scorecards: [], events: [], consent: { gdpr: true, talentPool: true, expiresAt: "2027-04-29" }, anonymousMode: false },
  { id: "C-0213", firstName: "Ravi", lastName: "Pillai", email: "ravi.p@example.com", phone: "+91 99 2222 3333", location: "Bangalore", country: "IN", source: "Agency", agencyId: "AG-001", reqId: "REQ-2026-0091", stage: "ONSITE", rating: 4, appliedAt: "2026-04-22", resume: fakeResume(["Go","Kubernetes"],"Tech lead at unicorn."), scorecards: [], events: [], consent: { gdpr: true, talentPool: false, expiresAt: "2027-04-22" }, anonymousMode: false },

  // Sales pipeline
  { id: "C-0301", firstName: "Klaus", lastName: "Müller", email: "klaus.m@example.com", phone: "+49 151 9999 1212", location: "Munich", country: "DE", source: "LinkedIn", reqId: "REQ-2026-0095", stage: "SCREEN", rating: 4, appliedAt: "2026-04-20", resume: fakeResume(["MEDDPICC","Salesforce","German"],"AE 8y, DACH territory."), scorecards: [], events: [], consent: { gdpr: true, talentPool: true, expiresAt: "2027-04-20" }, anonymousMode: false },
  { id: "C-0302", firstName: "Greta", lastName: "Bauer", email: "greta.b@example.com", phone: "+49 151 8888 0099", location: "Berlin", country: "DE", source: "Referral", referrerEmployeeId: "EMP-1009", reqId: "REQ-2026-0095", stage: "OFFER", rating: 5, appliedAt: "2026-04-12", resume: fakeResume(["Enterprise Sales","Salesforce","German","English"],"Top 1% AE, ex-Datadog."), scorecards: [
    { id: "SC-G1", interviewerId: "EMP-1010", interviewerName: "Olivia Nakamura", focus: "Sales Acumen", competencies: [{ label: "Discovery", score: 5 },{ label: "Forecasting", score: 5 }], notes: "Brought a deep deal review. Hire.", recommendation: "STRONG_HIRE", submittedAt: "2026-04-28" },
  ], events: [{ at: "2026-04-29", type: "OFFER", text: "Offer extended €92,000 + 50% OTE", actor: "Nora Haddad" }], consent: { gdpr: true, talentPool: true, expiresAt: "2027-04-12" }, anonymousMode: false, diversity: { gender: "F" } },
];

export const interviews: Interview[] = [
  { id: "INT-2026-0042", candidateId: "C-0102", reqId: "REQ-2026-0088", round: "Onsite — Design Craft", scheduledAt: "2026-05-08 14:00 BST", durationMin: 90, mode: "Video", link: "https://meet.coreflow.com/hf-0042", interviewers: [
    { id: "EMP-1004", name: "Marcus Lindberg", focus: "Design Craft", submitted: true },
    { id: "EMP-1003", name: "Sarah Khan", focus: "Systems Thinking", submitted: false },
  ], status: "SCHEDULED" },
  { id: "INT-2026-0043", candidateId: "C-0081", reqId: "REQ-2026-0088", round: "Onsite — Culture", scheduledAt: "2026-05-09 17:00 BST", durationMin: 60, mode: "Video", link: "https://meet.coreflow.com/hf-0043", interviewers: [
    { id: "EMP-1001", name: "Amina Al-Farsi", focus: "Culture & Leadership", submitted: false },
  ], status: "SCHEDULED" },
  { id: "INT-2026-0044", candidateId: "C-0212", reqId: "REQ-2026-0091", round: "Phone — Technical", scheduledAt: "2026-05-08 11:30 IST", durationMin: 45, mode: "Phone", interviewers: [
    { id: "EMP-1005", name: "Priya Rao", focus: "Systems Design", submitted: false },
  ], status: "SCHEDULED" },
  { id: "INT-2026-0045", candidateId: "C-0213", reqId: "REQ-2026-0091", round: "Onsite — Coding", scheduledAt: "2026-05-10 10:00 IST", durationMin: 120, mode: "Onsite", interviewers: [
    { id: "EMP-1005", name: "Priya Rao", focus: "Coding", submitted: false },
    { id: "EMP-1002", name: "David Chen", focus: "Architecture", submitted: false },
  ], status: "SCHEDULED" },
];

export const offers: Offer[] = [
  {
    id: "OFR-2026-0017", candidateId: "C-0099", reqId: "REQ-2026-0088",
    baseSalary: 88000, currency: "GBP", bonusPct: 12, equity: "0.04% RSU",
    startDate: "2026-07-01", status: "SENT",
    approvals: [
      { role: "Compensation", name: "Yara Saleh", status: "APPROVED" },
      { role: "HR Director", name: "Amina Al-Farsi", status: "APPROVED" },
      { role: "Finance", name: "Adesina Okafor", status: "APPROVED" },
    ],
    sentAt: "2026-04-30",
  },
  {
    id: "OFR-2026-0018", candidateId: "C-0302", reqId: "REQ-2026-0095",
    baseSalary: 92000, currency: "EUR", bonusPct: 50, equity: "0.02% RSU",
    startDate: "2026-06-15", status: "PENDING_APPROVAL",
    approvals: [
      { role: "Compensation", name: "Yara Saleh", status: "APPROVED" },
      { role: "HR Director", name: "Amina Al-Farsi", status: "PENDING" },
      { role: "Finance", name: "Adesina Okafor", status: "PENDING" },
    ],
  },
  {
    id: "OFR-2026-0016", candidateId: "C-0042", reqId: "REQ-2026-0088",
    baseSalary: 78000, currency: "GBP", bonusPct: 10, equity: "0.02% RSU",
    startDate: "2026-06-20", status: "ACCEPTED",
    approvals: [
      { role: "Compensation", name: "Yara Saleh", status: "APPROVED" },
      { role: "HR Director", name: "Amina Al-Farsi", status: "APPROVED" },
      { role: "Finance", name: "Adesina Okafor", status: "APPROVED" },
    ],
    sentAt: "2026-04-22", decisionAt: "2026-04-26",
  },
];

export const referrals: Referral[] = [
  { id: "REF-2026-031", reqId: "REQ-2026-0088", candidateId: "C-0042", referrerEmployeeId: "EMP-1003", referrerName: "Sarah Khan", bonusAmount: 3000, currency: "GBP", status: "ELIGIBLE", submittedAt: "2026-04-22" },
  { id: "REF-2026-032", reqId: "REQ-2026-0088", candidateId: "C-0102", referrerEmployeeId: "EMP-1012", referrerName: "Yara Saleh", bonusAmount: 3000, currency: "GBP", status: "PENDING", submittedAt: "2026-04-08" },
  { id: "REF-2026-033", reqId: "REQ-2026-0088", candidateId: "C-0099", referrerEmployeeId: "EMP-1004", referrerName: "Marcus Lindberg", bonusAmount: 3000, currency: "GBP", status: "PENDING", submittedAt: "2026-03-28" },
  { id: "REF-2026-034", reqId: "REQ-2026-0091", candidateId: "C-0212", referrerEmployeeId: "EMP-1005", referrerName: "Priya Rao", bonusAmount: 200000, currency: "INR", status: "PENDING", submittedAt: "2026-04-29" },
  { id: "REF-2026-029", reqId: "REQ-2026-0095", candidateId: "C-0302", referrerEmployeeId: "EMP-1009", referrerName: "Hannah Bauer", bonusAmount: 2500, currency: "EUR", status: "PENDING", submittedAt: "2026-04-12" },
];

export const agencies: Agency[] = [
  { id: "AG-001", name: "BluePeak Talent (India)", contact: "ravi@bluepeak.in", feePct: 18, activeSubmissions: 6, hires: 4, rating: 4 },
  { id: "AG-002", name: "DesignTalent Co.", contact: "team@designtalent.uk", feePct: 22, activeSubmissions: 3, hires: 1, rating: 3 },
  { id: "AG-003", name: "Berlin Sales Hunters", contact: "hi@bsh.de", feePct: 25, activeSubmissions: 2, hires: 2, rating: 5 },
];

// WorkGrid project staffing forecasts that drive prioritization
export interface StaffingForecast {
  id: string; project: string; role: string; skills: string[];
  estStart: string; durationMonths: number; priority: "HIGH" | "MEDIUM" | "LOW"; linkedReqId?: string;
}
export const staffingForecasts: StaffingForecast[] = [
  { id: "WG-FCT-2026-114", project: "Design System v2", role: "Senior Product Designer", skills: ["Design Systems","Figma","Tokens"], estStart: "2026-07-01", durationMonths: 9, priority: "HIGH", linkedReqId: "REQ-2026-0088" },
  { id: "WG-FCT-2026-118", project: "WorkGrid Streaming Core", role: "Senior Backend Engineer", skills: ["Go","Kafka","Kubernetes"], estStart: "2026-07-15", durationMonths: 12, priority: "HIGH", linkedReqId: "REQ-2026-0091" },
  { id: "WG-FCT-2026-121", project: "ANZ Market Launch", role: "Account Executive — APAC", skills: ["Enterprise Sales","MEDDPICC"], estStart: "2026-09-01", durationMonths: 18, priority: "MEDIUM" },
  { id: "WG-FCT-2026-127", project: "ML Experimentation Platform", role: "ML Platform Engineer", skills: ["Python","Ray","K8s"], estStart: "2026-10-01", durationMonths: 12, priority: "MEDIUM" },
];

// Audit log
export const auditLog = [
  { id: "AL-7012", entity: "Offer", entityId: "OFR-2026-0016", action: "ACCEPTED", actor: "candidate:C-0042", at: "2026-04-26 14:02", text: "Offer accepted by Reina Patel" },
  { id: "AL-7011", entity: "Conversion", entityId: "C-0042", action: "EVENT_SENT", actor: "system", at: "2026-04-26 14:03", text: "candidate.hired event sent to CoreHR (employee EMP-1085 provisioning)" },
  { id: "AL-7010", entity: "Requisition", entityId: "REQ-2026-0099", action: "SUBMITTED", actor: "david.chen@coreflow.com", at: "2026-05-01 10:11", text: "Requisition submitted for approval" },
  { id: "AL-7009", entity: "Scorecard", entityId: "SC-2", action: "SUBMITTED", actor: "marcus.lindberg@coreflow.com", at: "2026-04-29 16:40", text: "Onsite scorecard submitted: STRONG_HIRE" },
  { id: "AL-7008", entity: "Posting", entityId: "REQ-2026-0091", action: "PUBLISHED", actor: "nora.haddad@coreflow.com", at: "2026-04-12 11:22", text: "Published to LinkedIn, Internal, Referral" },
];

// CoreHR conversion events (the bridge to People Hub)
export type ConversionErrorCategory = "TRANSIENT" | "AUTH" | "VALIDATION" | "DUPLICATE" | "REMOTE_5XX" | "UNKNOWN";

export interface ConversionEvent {
  id: string;
  idempotencyKey: string; // deterministic per candidate.hired (candidateId + offerId)
  candidateId: string;
  candidateName: string;
  reqId: string;
  offerId: string;
  acceptedAt: string;
  status: "QUEUED" | "DELIVERED" | "EMPLOYEE_CREATED" | "FAILED" | "DUPLICATE";
  newEmployeeId?: string;
  payload: CoreHRConversionPayload;
  lastErrorCategory?: ConversionErrorCategory;
  lastErrorMessage?: string;
}

// Mirrors the CoreHR API contract (HireFlow → CoreHR candidate.hired event)
export interface CoreHRConversionPayload {
  event: "candidate.hired";
  source: "HireFlow";
  occurredAt: string;
  candidate: {
    candidateId: string;
    firstName: string;
    lastName: string;
    email: string;
    personalEmail?: string;
    phone: string;
    country: string;
    location: string;
  };
  position: {
    requisitionId: string;
    jobTitle: string;
    department: string;
    costCenter: string;
    legalEntity: string;
    grade: string;
    employmentType: EmploymentType;
    managerId: string;
  };
  offer: {
    offerId: string;
    baseSalary: number;
    currency: string;
    bonusPct: number;
    startDate: string;
  };
  recruiter: { id: string; name: string };
  diversitySelfId?: { gender?: string; ethnicity?: string };
}

export function buildConversionPayload(candidateId: string): CoreHRConversionPayload | null {
  const c = candidates.find(x => x.id === candidateId); if (!c) return null;
  const r = requisitions.find(x => x.id === c.reqId); if (!r) return null;
  const o = offers.find(x => x.candidateId === candidateId); if (!o) return null;
  return {
    event: "candidate.hired",
    source: "HireFlow",
    occurredAt: new Date().toISOString(),
    candidate: { candidateId: c.id, firstName: c.firstName, lastName: c.lastName, email: c.email, phone: c.phone, country: c.country, location: c.location },
    position: { requisitionId: r.id, jobTitle: r.title, department: r.department, costCenter: r.costCenter, legalEntity: r.legalEntity, grade: r.level, employmentType: r.employmentType, managerId: r.hiringManagerId },
    offer: { offerId: o.id, baseSalary: o.baseSalary, currency: o.currency, bonusPct: o.bonusPct, startDate: o.startDate },
    recruiter: { id: r.recruiterId, name: r.recruiterName },
    diversitySelfId: c.diversity ? { gender: c.diversity.gender, ethnicity: c.diversity.ethnicity } : undefined,
  };
}

export function makeIdempotencyKey(candidateId: string, offerId: string) {
  return `chired:${candidateId}:${offerId}`;
}

export const conversionEvents: ConversionEvent[] = [
  {
    id: "EVT-2026-0009",
    idempotencyKey: makeIdempotencyKey("C-0042", "OFR-2026-0016"),
    candidateId: "C-0042", candidateName: "Reina Patel", reqId: "REQ-2026-0088", offerId: "OFR-2026-0016",
    acceptedAt: "2026-04-26 14:02", status: "EMPLOYEE_CREATED", newEmployeeId: "EMP-1085",
    payload: buildConversionPayload("C-0042")!,
  },
];

// ===================== Background checks =====================
// Compliant with FCRA / GDPR Article 6(1)(b) — required candidate consent fields tracked.

export type BgCheckStatus =
  | "NOT_STARTED" | "CONSENT_PENDING" | "REQUESTED" | "IN_PROGRESS"
  | "ADVERSE_ACTION" | "CLEAR" | "CANCELLED";

export interface AdverseAction {
  reasons: string[]; // FCRA reasons (e.g., "Criminal record", "Misrepresented employment")
  preNoticeAt?: string; // pre-adverse action notice sent
  disputeWindowEndsAt?: string; // typically pre-notice + 5 business days
  disputed?: boolean;
  disputedAt?: string;
  disputeNotes?: string;
  finalNoticeAt?: string;
  decision?: "WITHDRAWN" | "RESCINDED_OFFER" | "PROCEED";
  decisionBy?: string;
  decisionAt?: string;
  decisionRationale?: string;
}

export interface BackgroundCheck {
  id: string;
  candidateId: string;
  reqId: string;
  vendor: "Checkr" | "Sterling" | "HireRight" | "Internal";
  vendorRequestId?: string;
  package: "Basic" | "Standard" | "Executive";
  scope: { identity: boolean; criminal: boolean; education: boolean; employment: boolean; credit: boolean; references: boolean };
  status: BgCheckStatus;
  consent: { signed: boolean; signedAt?: string; ipAddress?: string; documentUrl?: string };
  candidateData: { fullLegalName: string; dateOfBirth: string; ssnLast4?: string; addressHistory: string };
  requestedAt?: string;
  completedAt?: string;
  vendorResponse?: { reportUrl?: string; flags: string[]; raw?: string };
  recruiterNotified: boolean;
  notifications: { at: string; channel: "email" | "in_app" | "slack"; to: string; subject: string }[];
  events: { at: string; actor: string; text: string }[];
  adverseAction?: AdverseAction;
}

export const backgroundChecks: BackgroundCheck[] = [
  {
    id: "BGC-2026-0021", candidateId: "C-0099", reqId: "REQ-2026-0088", vendor: "Checkr",
    vendorRequestId: "chk_req_8h2nq", package: "Standard",
    scope: { identity: true, criminal: true, education: true, employment: true, credit: false, references: true },
    status: "IN_PROGRESS",
    consent: { signed: true, signedAt: "2026-04-30 09:12", ipAddress: "82.14.22.7", documentUrl: "/docs/consent-C-0099.pdf" },
    candidateData: { fullLegalName: "Lina Marie Sørensen", dateOfBirth: "1991-03-14", addressHistory: "7y Copenhagen, DK" },
    requestedAt: "2026-04-30 09:14",
    recruiterNotified: true,
    notifications: [
      { at: "2026-04-30 09:14", channel: "email", to: "nora.haddad@coreflow.com", subject: "BGC requested for Lina Sørensen" },
      { at: "2026-05-03 11:02", channel: "in_app", to: "EMP-1007", subject: "Checkr — education verification in progress" },
    ],
    events: [
      { at: "2026-04-30 09:12", actor: "candidate:C-0099", text: "Consent signed (FCRA disclosure + summary of rights)." },
      { at: "2026-04-30 09:14", actor: "system", text: "Submitted to Checkr (request_id chk_req_8h2nq)." },
      { at: "2026-05-03 11:02", actor: "vendor:checkr", text: "Status update: education verification in progress." },
    ],
  },
  {
    id: "BGC-2026-0019", candidateId: "C-0042", reqId: "REQ-2026-0088", vendor: "Checkr",
    vendorRequestId: "chk_req_4kf01", package: "Standard",
    scope: { identity: true, criminal: true, education: true, employment: true, credit: false, references: true },
    status: "CLEAR",
    consent: { signed: true, signedAt: "2026-04-22 10:00", ipAddress: "82.14.22.7", documentUrl: "/docs/consent-C-0042.pdf" },
    candidateData: { fullLegalName: "Reina Patel", dateOfBirth: "1990-11-02", addressHistory: "5y London, UK" },
    requestedAt: "2026-04-22 10:05", completedAt: "2026-04-25 16:40",
    vendorResponse: { reportUrl: "/reports/bgc-C-0042.pdf", flags: [] },
    recruiterNotified: true,
    notifications: [
      { at: "2026-04-25 16:42", channel: "email", to: "nora.haddad@coreflow.com", subject: "BGC CLEAR — Reina Patel — proceed with offer" },
    ],
    events: [
      { at: "2026-04-22 10:05", actor: "system", text: "Submitted to Checkr." },
      { at: "2026-04-25 16:40", actor: "vendor:checkr", text: "Report returned: CLEAR. No flags." },
    ],
  },
];

// ===================== Conversion (CoreHR) hardening =====================
// Webhook deliveries with retry & exponential backoff, signed payloads.

export interface WebhookDelivery {
  attempt: number;
  at: string;
  httpStatus: number;
  responseSnippet: string;
  signatureValid: boolean;
  durationMs: number;
}

declare module "./ta-data" {}

// extend ConversionEvent with retries/webhook log on the fly via a parallel map
export const conversionDeliveries: Record<string, WebhookDelivery[]> = {
  "EVT-2026-0009": [
    { attempt: 1, at: "2026-04-26 14:03:01", httpStatus: 502, responseSnippet: "Bad Gateway", signatureValid: true, durationMs: 4221 },
    { attempt: 2, at: "2026-04-26 14:03:11", httpStatus: 200, responseSnippet: '{"employeeId":"EMP-1085","status":"created"}', signatureValid: true, durationMs: 412 },
  ],
};

// JSON-schema style validator (lightweight, runtime, no external lib needed at module load)
export function validateConversionPayload(p: unknown): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const isStr = (v: any) => typeof v === "string" && v.length > 0;
  const isNum = (v: any) => typeof v === "number" && !Number.isNaN(v);
  if (!p || typeof p !== "object") return { ok: false, errors: ["payload missing"] };
  const x = p as any;
  if (x.event !== "candidate.hired") errors.push("event must be 'candidate.hired'");
  if (x.source !== "HireFlow") errors.push("source must be 'HireFlow'");
  if (!isStr(x.occurredAt)) errors.push("occurredAt required");
  for (const k of ["candidateId","firstName","lastName","email","phone","country","location"])
    if (!isStr(x.candidate?.[k])) errors.push(`candidate.${k} required`);
  if (x.candidate?.email && !/^.+@.+\..+$/.test(x.candidate.email)) errors.push("candidate.email invalid");
  for (const k of ["requisitionId","jobTitle","department","costCenter","legalEntity","grade","employmentType","managerId"])
    if (!isStr(x.position?.[k])) errors.push(`position.${k} required`);
  if (!isStr(x.offer?.offerId)) errors.push("offer.offerId required");
  if (!isNum(x.offer?.baseSalary) || x.offer.baseSalary <= 0) errors.push("offer.baseSalary must be > 0");
  if (!isStr(x.offer?.currency) || x.offer.currency.length !== 3) errors.push("offer.currency must be ISO-4217");
  if (!isStr(x.offer?.startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(x.offer.startDate)) errors.push("offer.startDate must be YYYY-MM-DD");
  return { ok: errors.length === 0, errors };
}

// ===================== Reactive store =====================
type Listener = () => void;
const listeners = new Set<Listener>();
export function subscribe(l: Listener) { listeners.add(l); return () => listeners.delete(l); }
function notify() { listeners.forEach(l => l()); }
let version = 0;
export function getSnapshot() { return version; }
function bump() { version++; notify(); }

// ===================== Mutators =====================
const nowIso = () => new Date().toISOString().replace("T"," ").slice(0, 19);

export function moveCandidateStage(candidateId: string, to: Stage, actor = "Nora Haddad") {
  const c = candidates.find(x => x.id === candidateId); if (!c) return;
  if (c.stage === to) return;
  const from = c.stage;
  c.stage = to;
  c.events = [{ at: nowIso(), type: "STAGE_MOVE", text: `Moved ${STAGE_LABEL[from]} → ${STAGE_LABEL[to]}`, actor }, ...c.events];
  bump();
}

export function submitScorecard(candidateId: string, payload: Omit<Scorecard, "id" | "submittedAt">) {
  const c = candidates.find(x => x.id === candidateId); if (!c) return;
  const sc: Scorecard = { ...payload, id: `SC-${Math.random().toString(36).slice(2, 7).toUpperCase()}`, submittedAt: nowIso() };
  c.scorecards = [...c.scorecards, sc];
  c.events = [{ at: nowIso(), type: "INTERVIEW", text: `Scorecard submitted by ${sc.interviewerName}: ${sc.recommendation.replace("_"," ")}`, actor: sc.interviewerName }, ...c.events];
  bump();
}

export function aggregateScorecards(c: Candidate) {
  if (!c.scorecards.length) return null;
  const all = c.scorecards.flatMap(s => s.competencies.map(x => x.score));
  const avg = all.reduce((a, b) => a + b, 0) / all.length;
  const recScore = { STRONG_HIRE: 2, HIRE: 1, NO_HIRE: -1, STRONG_NO_HIRE: -2 } as const;
  const consensus = c.scorecards.reduce((a, s) => a + recScore[s.recommendation], 0);
  const verdict = consensus >= 2 ? "Hire" : consensus <= -2 ? "No Hire" : "Mixed";
  return { count: c.scorecards.length, avg: Math.round(avg * 10) / 10, consensus, verdict };
}

export function createRequisitionFromForecast(forecastId: string, overrides?: Partial<Requisition>) {
  const f = staffingForecasts.find(x => x.id === forecastId); if (!f) return null;
  const id = `REQ-2026-${String(100 + requisitions.length).padStart(4, "0")}`;
  const r: Requisition = {
    id, title: f.role, department: overrides?.department ?? "TBD", costCenter: overrides?.costCenter ?? "CC-000",
    legalEntity: overrides?.legalEntity ?? "CoreFlow Global", location: overrides?.location ?? "Remote", country: overrides?.country ?? "GB",
    level: overrides?.level ?? "L4", employmentType: overrides?.employmentType ?? "FULL_TIME",
    openings: overrides?.openings ?? 1,
    hiringManagerId: overrides?.hiringManagerId ?? "EMP-1002", hiringManagerName: overrides?.hiringManagerName ?? "David Chen",
    recruiterId: "EMP-1007", recruiterName: "Nora Haddad",
    salaryMin: overrides?.salaryMin ?? 0, salaryMax: overrides?.salaryMax ?? 0, currency: overrides?.currency ?? "USD",
    justification: overrides?.justification ?? `Auto-generated from WorkGrid forecast ${f.id} (${f.project}).`,
    backfill: false, skills: f.skills,
    description: overrides?.description ?? `Sourced from WorkGrid project: ${f.project}. Estimated start ${f.estStart}, ${f.durationMonths} months.`,
    status: "DRAFT",
    approvalChain: [{ role: "Hiring Manager", name: overrides?.hiringManagerName ?? "David Chen", status: "PENDING" }],
    postings: [], openedAt: nowIso().slice(0, 10), targetStart: f.estStart, candidates: 0,
    workgridForecastId: f.id,
  };
  requisitions.unshift(r);
  f.linkedReqId = r.id;
  bump();
  return r;
}

export function requestBackgroundCheck(input: Omit<BackgroundCheck, "id" | "events" | "notifications" | "recruiterNotified" | "status" | "requestedAt" | "vendorRequestId">) {
  const id = `BGC-2026-${String(22 + backgroundChecks.length).padStart(4, "0")}`;
  const bgc: BackgroundCheck = {
    ...input, id,
    status: input.consent.signed ? "REQUESTED" : "CONSENT_PENDING",
    vendorRequestId: input.consent.signed ? `req_${Math.random().toString(36).slice(2, 9)}` : undefined,
    requestedAt: input.consent.signed ? nowIso() : undefined,
    recruiterNotified: true,
    notifications: [{ at: nowIso(), channel: "email", to: "nora.haddad@coreflow.com", subject: `BGC ${input.consent.signed ? "requested" : "awaiting consent"} — ${input.candidateData.fullLegalName}` }],
    events: [{ at: nowIso(), actor: "Nora Haddad", text: input.consent.signed ? `Submitted to ${input.vendor}.` : "Consent link emailed to candidate." }],
  };
  backgroundChecks.unshift(bgc);
  bump();
  return bgc;
}

export function advanceBackgroundCheck(id: string, to: BgCheckStatus, note?: string) {
  const b = backgroundChecks.find(x => x.id === id); if (!b) return;
  b.status = to;
  if (to === "CLEAR" || to === "ADVERSE_ACTION") b.completedAt = nowIso();
  b.events = [{ at: nowIso(), actor: "vendor", text: note ?? `Status → ${to}` }, ...b.events];
  b.notifications = [{ at: nowIso(), channel: "in_app", to: "EMP-1007", subject: `BGC ${id} → ${to}` }, ...b.notifications];
  bump();
}

// Categorize HTTP/transport errors so the retry policy can decide whether to back off.
export function categorizeConversionError(httpStatus: number, snippet?: string): ConversionErrorCategory {
  if (httpStatus === 0) return "TRANSIENT";
  if (httpStatus === 401 || httpStatus === 403) return "AUTH";
  if (httpStatus === 409 || /duplicate|idempot/i.test(snippet ?? "")) return "DUPLICATE";
  if (httpStatus === 422 || httpStatus === 400) return "VALIDATION";
  if (httpStatus >= 500 && httpStatus < 600) return "REMOTE_5XX";
  if (httpStatus >= 200 && httpStatus < 300) return "TRANSIENT";
  return "UNKNOWN";
}

const RETRYABLE: ConversionErrorCategory[] = ["TRANSIENT", "REMOTE_5XX"];
export const isRetryable = (cat?: ConversionErrorCategory) => !!cat && RETRYABLE.includes(cat);

export function retryConversion(eventId: string, opts?: { simulate?: { httpStatus: number; snippet?: string } }) {
  const e = conversionEvents.find(x => x.id === eventId); if (!e) return;
  const list = (conversionDeliveries[eventId] = conversionDeliveries[eventId] ?? []);
  const attempt = list.length + 1;
  let httpStatus: number; let snippet: string;
  if (opts?.simulate) { httpStatus = opts.simulate.httpStatus; snippet = opts.simulate.snippet ?? ""; }
  else { const ok = Math.random() > 0.3; httpStatus = ok ? 200 : 502; snippet = ok ? `{"employeeId":"EMP-${1090 + attempt}","status":"created"}` : "Bad Gateway"; }
  list.push({
    attempt, at: nowIso(), httpStatus,
    responseSnippet: snippet || (httpStatus < 300 ? "OK" : "error"),
    signatureValid: true,
    durationMs: 200 + Math.floor(Math.random() * 600),
  });
  if (httpStatus >= 200 && httpStatus < 300) {
    e.status = "EMPLOYEE_CREATED";
    const m = /EMP-\d+/.exec(snippet); e.newEmployeeId = e.newEmployeeId ?? (m?.[0] ?? `EMP-${1090 + attempt}`);
    e.lastErrorCategory = undefined; e.lastErrorMessage = undefined;
  } else {
    const cat = categorizeConversionError(httpStatus, snippet);
    e.lastErrorCategory = cat; e.lastErrorMessage = snippet;
    e.status = cat === "DUPLICATE" ? "DUPLICATE" : "FAILED";
  }
  bump();
}

export function emitConversion(candidateId: string) {
  const payload = buildConversionPayload(candidateId);
  if (!payload) return null;
  const v = validateConversionPayload(payload);
  if (!v.ok) return { error: "validation_failed", details: v.errors };
  const c = candidates.find(x => x.id === candidateId)!;
  const o = offers.find(x => x.candidateId === candidateId)!;
  const idemKey = makeIdempotencyKey(c.id, o.id);
  const existing = conversionEvents.find(e => e.idempotencyKey === idemKey);
  if (existing) {
    const list = (conversionDeliveries[existing.id] = conversionDeliveries[existing.id] ?? []);
    list.push({ attempt: list.length + 1, at: nowIso(), httpStatus: 409, responseSnippet: `Duplicate idempotency key ${idemKey}`, signatureValid: true, durationMs: 41 });
    if (existing.status !== "EMPLOYEE_CREATED") existing.status = "DUPLICATE";
    existing.lastErrorCategory = "DUPLICATE";
    existing.lastErrorMessage = `Duplicate – reused event ${existing.id}`;
    bump();
    return existing;
  }
  const id = `EVT-2026-${String(10 + conversionEvents.length).padStart(4, "0")}`;
  const ev: ConversionEvent = {
    id, idempotencyKey: idemKey,
    candidateId: c.id, candidateName: `${c.firstName} ${c.lastName}`,
    reqId: c.reqId, offerId: o.id, acceptedAt: nowIso(),
    status: "QUEUED", payload,
  };
  conversionEvents.unshift(ev);
  retryConversion(id);
  return ev;
}

// =============== Adverse action workflow ===============
export const ADVERSE_ACTION_REASONS = [
  "Criminal record discrepancy",
  "Misrepresented employment history",
  "Education verification failed",
  "Negative references",
  "Identity verification failed",
  "Credit report concerns",
  "Failed drug screen",
] as const;

function addBusinessDays(from: Date, days: number) {
  const d = new Date(from); let added = 0;
  while (added < days) { d.setDate(d.getDate() + 1); const wd = d.getDay(); if (wd !== 0 && wd !== 6) added++; }
  return d;
}

export function startAdverseAction(bgcId: string, reasons: string[], actor = "Nora Haddad") {
  const b = backgroundChecks.find(x => x.id === bgcId); if (!b) return;
  const dispute = addBusinessDays(new Date(), 5);
  b.status = "ADVERSE_ACTION";
  b.completedAt = b.completedAt ?? nowIso();
  b.adverseAction = {
    reasons, preNoticeAt: nowIso(),
    disputeWindowEndsAt: dispute.toISOString().replace("T", " ").slice(0, 19),
  };
  b.events = [{ at: nowIso(), actor, text: `Pre-adverse action notice issued. Reasons: ${reasons.join(", ")}. Dispute window 5 business days.` }, ...b.events];
  b.notifications = [
    { at: nowIso(), channel: "email", to: "candidate", subject: `Pre-adverse action notice — review attached report` },
    { at: nowIso(), channel: "in_app", to: "EMP-1007", subject: `BGC ${b.id} entered ADVERSE_ACTION` },
    ...b.notifications,
  ];
  auditLog.unshift({ id: `AL-${7400 + auditLog.length}`, entity: "BackgroundCheck", entityId: b.id, action: "ADVERSE_PRE_NOTICE", actor, at: nowIso(), text: `Pre-adverse notice: ${reasons.join("; ")}` });
  // Multi-channel notifications
  import("./notifications").then(({ broadcastMilestone }) => broadcastMilestone({
    milestone: "PRE_NOTICE",
    subject: `Pre-adverse action notice issued for ${b.candidateData.fullLegalName}`,
    body: `Reasons: ${reasons.join("; ")}. Dispute window ends ${b.adverseAction!.disputeWindowEndsAt}.`,
    entity: "BackgroundCheck", entityId: b.id, candidateId: b.candidateId, reqId: b.reqId,
  }));
  bump();
}

export function disputeAdverseAction(bgcId: string, notes: string) {
  const b = backgroundChecks.find(x => x.id === bgcId); if (!b || !b.adverseAction) return;
  b.adverseAction.disputed = true;
  b.adverseAction.disputedAt = nowIso();
  b.adverseAction.disputeNotes = notes;
  b.events = [{ at: nowIso(), actor: `candidate:${b.candidateId}`, text: `Dispute submitted: ${notes}` }, ...b.events];
  auditLog.unshift({ id: `AL-${7450 + auditLog.length}`, entity: "BackgroundCheck", entityId: b.id, action: "ADVERSE_DISPUTE", actor: `candidate:${b.candidateId}`, at: nowIso(), text: `Dispute logged: ${notes}` });
  import("./notifications").then(({ broadcastMilestone }) => broadcastMilestone({
    milestone: "DISPUTE_LOGGED",
    subject: `Candidate disputed adverse action — ${b.candidateData.fullLegalName}`,
    body: notes,
    entity: "BackgroundCheck", entityId: b.id, candidateId: b.candidateId, reqId: b.reqId,
  }));
  bump();
}

export function decideAdverseAction(bgcId: string, decision: NonNullable<AdverseAction["decision"]>, rationale: string, actor = "Nora Haddad") {
  const b = backgroundChecks.find(x => x.id === bgcId); if (!b || !b.adverseAction) return;
  b.adverseAction.decision = decision;
  b.adverseAction.decisionAt = nowIso();
  b.adverseAction.decisionBy = actor;
  b.adverseAction.decisionRationale = rationale;
  if (decision !== "PROCEED") b.adverseAction.finalNoticeAt = nowIso();
  b.events = [{ at: nowIso(), actor, text: `Adverse action decision: ${decision}. Rationale: ${rationale}` }, ...b.events];
  auditLog.unshift({ id: `AL-${7500 + auditLog.length}`, entity: "BackgroundCheck", entityId: b.id, action: `ADVERSE_${decision}`, actor, at: nowIso(), text: `Adverse decision ${decision} for ${b.candidateData.fullLegalName}: ${rationale}` });
  import("./notifications").then(({ broadcastMilestone }) => broadcastMilestone({
    milestone: "FINAL_DECISION",
    subject: `Final adverse action decision: ${decision} — ${b.candidateData.fullLegalName}`,
    body: rationale,
    entity: "BackgroundCheck", entityId: b.id, candidateId: b.candidateId, reqId: b.reqId,
  }));
  bump();
}

// =============== Scorecard finalization & hiring decisions ===============
export const hiringDecisions: HiringDecision[] = [];

export function finalizeScorecard(candidateId: string, scorecardId: string, signature: string) {
  const c = candidates.find(x => x.id === candidateId); if (!c) return;
  const sc = c.scorecards.find(s => s.id === scorecardId); if (!sc || sc.finalized) return;
  if (signature.trim().length < 3) return;
  sc.finalized = true; sc.finalizedAt = nowIso(); sc.signature = signature.trim();
  c.events = [{ at: nowIso(), type: "INTERVIEW", text: `Scorecard ${sc.id} finalized & signed by ${sc.signature}`, actor: sc.interviewerName }, ...c.events];
  auditLog.unshift({ id: `AL-${7600 + auditLog.length}`, entity: "Scorecard", entityId: sc.id, action: "FINALIZED", actor: sc.interviewerName, at: nowIso(), text: `Scorecard locked with signature ${sc.signature}` });
  bump();
}

export function recordHiringDecision(input: Omit<HiringDecision, "decidedAt">) {
  const c = candidates.find(x => x.id === input.candidateId); if (!c) return;
  const dec: HiringDecision = { ...input, decidedAt: nowIso() };
  hiringDecisions.unshift(dec);
  c.events = [{ at: nowIso(), type: "NOTE", text: `Hiring decision: ${dec.decision} — ${dec.rationale}`, actor: dec.decidedBy }, ...c.events];
  if (dec.decision === "REJECT") c.stage = "REJECTED";
  if (dec.decision === "HIRE") c.stage = "HIRED";
  if (dec.decision === "ADVANCE") {
    const order: Stage[] = ["NEW","SCREEN","PHONE_INT","ONSITE","OFFER","HIRED"];
    const i = order.indexOf(c.stage); if (i >= 0 && i < order.length - 1) c.stage = order[i+1];
  }
  auditLog.unshift({ id: `AL-${7700 + auditLog.length}`, entity: "Candidate", entityId: c.id, action: `DECISION_${dec.decision}`, actor: dec.decidedBy, at: nowIso(), text: dec.rationale });
  bump();
  return dec;
}
export const decisionsByCandidate = (id: string) => hiringDecisions.filter(d => d.candidateId === id);

// =============== Vendor webhook simulator ===============
export type SimulatedVendorEvent =
  | { kind: "STATUS_UPDATE"; status: BgCheckStatus; note?: string }
  | { kind: "REPORT_CLEAR"; reportUrl?: string }
  | { kind: "REPORT_FLAGS"; flags: string[]; reportUrl?: string }
  | { kind: "VENDOR_ERROR"; httpStatus: number; message: string };

export interface VendorWebhookLog {
  at: string;
  bgcId: string;
  vendor: BackgroundCheck["vendor"];
  event: SimulatedVendorEvent;
  resultingStatus: BgCheckStatus;
  notificationSent: boolean;
}
export const vendorWebhookLog: VendorWebhookLog[] = [];

export function simulateVendorWebhook(bgcId: string, event: SimulatedVendorEvent) {
  const b = backgroundChecks.find(x => x.id === bgcId); if (!b) return null;
  let next: BgCheckStatus = b.status; let note = "";
  switch (event.kind) {
    case "STATUS_UPDATE": next = event.status; note = event.note ?? `Vendor → ${event.status}`; break;
    case "REPORT_CLEAR":
      next = "CLEAR"; note = "Vendor returned CLEAR report.";
      b.vendorResponse = { reportUrl: event.reportUrl ?? `/reports/${bgcId}.pdf`, flags: [] };
      break;
    case "REPORT_FLAGS":
      next = "ADVERSE_ACTION"; note = `Vendor flagged: ${event.flags.join(", ")}`;
      b.vendorResponse = { reportUrl: event.reportUrl ?? `/reports/${bgcId}.pdf`, flags: event.flags };
      break;
    case "VENDOR_ERROR":
      note = `Vendor error ${event.httpStatus}: ${event.message}`;
      b.events = [{ at: nowIso(), actor: `vendor:${b.vendor.toLowerCase()}`, text: note }, ...b.events];
      vendorWebhookLog.unshift({ at: nowIso(), bgcId, vendor: b.vendor, event, resultingStatus: b.status, notificationSent: false });
      bump(); return b;
  }
  b.status = next;
  if (next === "CLEAR" || next === "ADVERSE_ACTION") b.completedAt = nowIso();
  b.events = [{ at: nowIso(), actor: `vendor:${b.vendor.toLowerCase()}`, text: note }, ...b.events];
  b.notifications = [{ at: nowIso(), channel: "email", to: "nora.haddad@coreflow.com", subject: `BGC ${bgcId} → ${next}` }, ...b.notifications];
  vendorWebhookLog.unshift({ at: nowIso(), bgcId, vendor: b.vendor, event, resultingStatus: next, notificationSent: true });
  bump();
  return b;
}

// helpers
export const candidatesByReq = (reqId: string) => candidates.filter(c => c.reqId === reqId);
export const reqById = (id: string) => requisitions.find(r => r.id === id);
export const candidateById = (id: string) => candidates.find(c => c.id === id);
export const offersByCandidate = (id: string) => offers.filter(o => o.candidateId === id);
export const bgChecksByCandidate = (id: string) => backgroundChecks.filter(b => b.candidateId === id);
export const conversionByCandidate = (id: string) => conversionEvents.find(e => e.candidateId === id);

