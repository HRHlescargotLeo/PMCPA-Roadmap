/* data.js — data for the PMCPA prototypes.
   As published on pmcpa.org.uk: Code sections and clause titles, training dates, performance figures,
   ongoing-case totals. The full 2024 Code, its Q&As, guidance and the cases listed under each clause come
   from code-data.js (read 6 November 2026). Three completed cases (Case/0395/12/24, Case/0440/01/25,
   Case/0466/01/25) are real, using the report format the PMCPA supplied (case-reports.js).
   Invented for the prototypes: every other company name, every CASE/9xxx and AUTH/9xxx reference,
   and their rulings, summaries and ongoing cases. */
(function () {
  'use strict';

  var SECTIONS = [
    { id: 'P', name: 'ABPI Principles', range: '' },
    { id: '1', name: 'Overarching requirements', range: 'Clauses 1–10' },
    { id: '2', name: 'Promotion to health professionals and other relevant decision makers', range: 'Clauses 11–17' },
    { id: '3', name: 'Interactions with health professionals, other relevant decision makers and healthcare organisations', range: 'Clauses 18–22' },
    { id: '4', name: 'Interactions with health professionals, other relevant decision makers, healthcare organisations, patient organisations and the public', range: 'Clauses 23–25' },
    { id: '5', name: 'Specific requirements for interactions with the public, including patients and journalists, and patient organisations', range: 'Clauses 26–27' },
    { id: '6', name: 'Annual disclosure requirements', range: 'Clauses 28–31' }
  ];

  var T = [
    'Scope of the Code and Definition of Certain Terms', 'Upholding Confidence in the Industry', 'Obligations', 'Responsibilities',
    'High Standards and Suitability', 'Information, Claims, Comparisons and Disparagement', 'Use of Quotations', 'Certification and Examination',
    'Training', 'Events/Meetings and Hospitality', 'Marketing Authorisation and Temporary Supply Authorisation',
    'Prescribing Information and Other Obligatory Information', 'Abbreviated Advertisements', 'Information, Claims and Comparisons',
    'High Standards, Format and Suitability', 'Material and Distribution', 'Representatives', 'Information, Claims and Comparisons',
    'Prohibition on Inducements and Inappropriate Payments and the Provision of Items to Health Professionals and Other Relevant Decision Makers',
    'Collaborative Working with Organisations', 'Provision of Medicines and Samples', 'Non-Interventional Studies of Marketed Medicines',
    'Donations and Grants', 'Contracted Services',
    'Relationships with Health Professionals, Other Relevant Decision Makers, Healthcare Organisations and Patient Organisations',
    'Relations with the Public, Including Patients and Journalists', 'Relationships with Patient Organisations',
    'Annual Disclosure of Transfers of Value to Health Professionals, Other Relevant Decision Makers and Healthcare Organisations',
    'Annual Disclosure of Contracted Services, Donations, Grants and Sponsorship (including in relation to events/meetings) Provided to Patient Organisations',
    'Annual Disclosure of Contracted Services Provided by the Public, Including Patients and Journalists',
    'Timings, Duration and Retention of Disclosure Information'
  ];
  function sectionOf(n) { return n <= 10 ? '1' : n <= 17 ? '2' : n <= 22 ? '3' : n <= 25 ? '4' : n <= 27 ? '5' : '6'; }
  var CLAUSES = T.map(function (t, i) { return { n: i + 1, title: t, section: sectionOf(i + 1) }; });
  /* Search keywords from supplementary information headings (illustrative). */
  CLAUSES[25].kw = 'social media press releases journalists patients the public';
  CLAUSES[11].kw = 'black triangle adverse event reporting';

  /* The Code text, glossary (Clause 1 definitions), Q&As and guidance as published: see code-data.js. */
  var CODE = window.PM_CODE || { clauses: [], qas: [], guidance: [], glossary: {} };
  var GLOSSARY = CODE.glossary;
  var QAS = CODE.qas;
  var GUIDANCE = CODE.guidance;

  /* Sample completed cases. Invented companies and references. */
  var CTYPES = {
    hp: 'Health professional', pub: 'Member of the public', anon: 'Anonymous complainant',
    co: 'Pharmaceutical company', va: 'Voluntary admission', ex: 'Ex-employee', nc: 'Named, contactable complainant'
  };
  function C(id, ref, ctype, resp, headline, summary, breach, nobreach, code, received, completed, appeal, sanctions, complainantCo) {
    return { id: id, ref: ref, ctype: ctype, respondent: resp, complainantCo: complainantCo || '', headline: headline, summary: summary,
      breach: breach, nobreach: nobreach, code: code, received: received, completed: completed, appeal: appeal, sanctions: sanctions };
  }
  var CASES = [
    /* Real cases, in the PMCPA's new report format (see case-reports.js). */
    C('0395', 'CASE/0395/12/24', 'nc', 'CSL Vifor', 'Allegations regarding information contained on the Vifor Vault website', 'This complaint related to materials on CSL Vifor’s “Vifor Vault” – a website designed for health professionals, which housed materials related to CSL Vifor’s medicines and therapy areas.', ['6.5', '16.1', '26.1'], ['5.1', '8.5'], 2024, '2024-12-12', '2025-11-27', 'No appeal', ['Undertaking']),
    C('0466', 'CASE/0466/01/25', 'va', 'Pierre Fabre Ltd', 'A video on the website of a medical journal', 'This voluntary admission related to a video that appeared on the website of a medical journal. Pierre Fabre submitted that the video had, in error, been promoted to UK health professionals by email.', ['5.1', '5.6', '8.1', '11.2', '12.1', '12.6', '15.6'], ['2'], 2024, '2025-01-31', '2025-11-20', 'No appeal', ['Undertaking']),
    C('0440', 'CASE/0440/01/25', 'nc', 'CSL Vifor', 'Allegations relating to a meeting venue', 'This complaint related to an advisory board held in Los Angeles and attended by a UK health professional.', [], ['2', '5.1', '10.1'], 2021, '2025-01-16', '2025-11-20', 'No appeal', []),
    C('9071', 'CASE/9071/03/26', 'hp', 'Alder Therapeutics', 'Superlative claim in a leavepiece', 'A leavepiece called an asthma inhaler “the most effective option”; the Panel ruled the superlative unsubstantiated.', ['14.4', '6.1'], [], 2024, '2026-03-04', '2026-09-30', 'No appeal', ['Undertaking']),
    C('9068', 'CASE/9068/02/26', 'anon', 'Brightwater Pharma', 'Promotion on LinkedIn before marketing authorisation', 'A medical director’s LinkedIn post promoted an unlicensed indication to the public; breaches including Clause 2 were ruled.', ['2', '3.1', '5.1', '26.1'], [], 2024, '2026-02-19', '2026-09-25', 'Appeal by respondent – Panel rulings upheld', ['Undertaking', 'Public reprimand', 'Advertisement']),
    C('9064', 'CASE/9064/02/26', 'co', 'Calderbank Biosciences', 'Comparison with a competitor’s biosimilar', 'An intercompany complaint about a comparison chart; the Panel found the comparison misleading in one respect but not in two others.', ['14.1'], ['14.2', '6.1'], 2024, '2026-02-02', '2026-09-12', 'No appeal', ['Undertaking'], 'Dunmore Medicines'),
    C('9059', 'CASE/9059/01/26', 'hp', 'Elmstead Pharma UK', 'Data on file not provided within ten working days', 'A GP asked for data on file cited in an email and waited six weeks; the Panel ruled a breach of Clause 14.3.', ['14.3'], ['5.1'], 2024, '2026-01-21', '2026-08-28', 'No appeal', ['Undertaking']),
    C('9055', 'CASE/9055/01/26', 'va', 'Fernhill Health', 'Voluntary admission: uncertified email campaign', 'The company told the PMCPA that an email to nurses had gone out before final certification.', ['8.1', '5.1'], [], 2024, '2026-01-09', '2026-07-31', 'No appeal', ['Undertaking']),
    C('9050', 'CASE/9050/12/25', 'pub', 'Greyfriars Bio', 'Disease awareness campaign alleged to promote a medicine', 'A member of the public said a bus-stop campaign promoted a prescription-only medicine; the Panel ruled no breach.', [], ['26.1', '26.2', '5.1'], 2024, '2025-12-15', '2026-07-17', 'No appeal', []),
    C('9046', 'CASE/9046/12/25', 'ex', 'Hartland Pharmaceuticals', 'Hospitality at an advisory board', 'A former employee alleged excessive hospitality at an overseas advisory board; breaches were ruled and the case was reported to the Appeal Board.', ['2', '10.1', '24.1', '5.1'], ['19.1'], 2024, '2025-12-01', '2026-07-03', 'Reported to Appeal Board – audit required', ['Undertaking', 'Audit', 'Public reprimand', 'Advertisement']),
    C('9041', 'CASE/9041/11/25', 'hp', 'Dunmore Medicines', 'Missing prescribing information on a congress stand', 'A consultant said digital screens on a congress stand had no prescribing information; the Panel agreed for two of four screens.', ['12.1', '14.5'], ['5.1'], 2024, '2025-11-18', '2026-06-19', 'No appeal', ['Undertaking']),
    C('9037', 'CASE/9037/10/25', 'anon', 'Alder Therapeutics', 'Grant to a hospital trust without a written agreement', 'An anonymous complainant alleged a grant was made without a contract; the Panel ruled no breach on the evidence provided.', [], ['23.1', '5.1'], 2024, '2025-10-27', '2026-05-29', 'Appeal by complainant – Panel rulings upheld', []),
    C('9033', 'CASE/9033/10/25', 'co', 'Brightwater Pharma', 'Claims about speed of onset', 'An intercompany complaint about “works from day one”; the Panel ruled the claim misleading and not capable of substantiation.', ['6.1', '14.4'], [], 2024, '2025-10-06', '2026-05-15', 'Appeal by respondent – Panel rulings overturned in part', ['Undertaking'], 'Calderbank Biosciences'),
    C('9029', 'CASE/9029/09/25', 'hp', 'Fernhill Health', 'Representative call frequency', 'A practice manager complained about repeated unsolicited visits; the Panel ruled no breach.', [], ['17.1', '17.2'], 2024, '2025-09-22', '2026-04-24', 'No appeal', []),
    C('9026', 'CASE/9026/09/25', 'pub', 'Hartland Pharmaceuticals', 'Press release to consumer media', 'A press release to national newspapers made claims a member of the public considered promotional; a breach of Clause 26.2 was ruled.', ['26.2', '5.1'], ['2'], 2024, '2025-09-08', '2026-04-10', 'No appeal', ['Undertaking']),
    C('9022', 'CASE/9022/08/25', 'va', 'Greyfriars Bio', 'Voluntary admission: disclosure data error', 'The company reported transfers of value had been disclosed against the wrong organisations.', ['28.1'], [], 2024, '2025-08-14', '2026-03-20', 'No appeal', ['Undertaking']),
    C('9018', 'CASE/9018/07/25', 'hp', 'Calderbank Biosciences', 'References missing from a slide deck', 'Slides at a sponsored meeting quoted studies without references; breach of 14.2 ruled, other allegations not upheld.', ['14.2'], ['14.1', '10.1'], 2024, '2025-07-30', '2026-02-27', 'No appeal', ['Undertaking']),
    C('9015', 'CASE/9015/07/25', 'anon', 'Elmstead Pharma UK', 'Patient organisation agreement', 'A complaint that support to a patient charity was not covered by a written agreement; the Panel ruled a breach.', ['27.2', '5.1'], [], 2024, '2025-07-07', '2026-02-13', 'No appeal', ['Undertaking']),
    C('9011', 'CASE/9011/06/25', 'co', 'Dunmore Medicines', 'Quotation from a conference abstract', 'An intercompany complaint about an out-of-context quotation; the Panel ruled no breach.', [], ['7.1', '6.1'], 2024, '2025-06-16', '2026-01-23', 'No appeal', [], 'Brightwater Pharma'),
    C('9007', 'CASE/9007/05/25', 'ex', 'Alder Therapeutics', 'Training on the Code for field teams', 'A former employee said new representatives were sent out before Code training; breaches of 9.1 and 17.1 ruled.', ['9.1', '17.1', '5.1'], [], 2024, '2025-05-12', '2025-12-12', 'No appeal', ['Undertaking', 'Corrective statement']),
    C('9003', 'CASE/9003/04/25', 'hp', 'Greyfriars Bio', 'Abbreviated advertisement in a journal', 'A pharmacist said a journal advertisement exceeded the content allowed in an abbreviated advertisement; breach ruled.', ['13.1'], [], 2024, '2025-04-03', '2025-11-21', 'No appeal', ['Undertaking']),
    C('8998', 'CASE/8998/03/25', 'pub', 'Fernhill Health', 'Response to a patient enquiry', 'A patient said a reply to her enquiry recommended a medicine; the Panel ruled no breach.', [], ['26.4', '26.2'], 2024, '2025-03-18', '2025-10-31', 'No appeal', []),
    C('8994', 'CASE/8994/02/25', 'hp', 'Hartland Pharmaceuticals', 'Samples provided without a written request', 'A hospital doctor said samples were left without a signed request; breach ruled.', ['21.1'], [], 2024, '2025-02-10', '2025-09-26', 'No appeal', ['Undertaking']),
    C('8990', 'CASE/8990/01/25', 'co', 'Elmstead Pharma UK', 'Non-interventional study alleged to be promotional', 'An intercompany complaint that a study was disguised promotion; the Panel ruled breaches including Clause 2, upheld on appeal.', ['2', '22.1', '5.1'], [], 2024, '2025-01-14', '2025-08-29', 'Appeal by respondent – Panel rulings upheld', ['Undertaking', 'Public reprimand', 'Advertisement'], 'Greyfriars Bio'),
    C('8986', 'CASE/8986/11/24', 'hp', 'Brightwater Pharma', 'Benefit/risk presented in a webinar', 'A consultant said a webinar understated side effects; the Panel ruled the material unbalanced.', ['14.4', '6.1'], [], 2024, '2024-11-20', '2025-06-27', 'No appeal', ['Undertaking']),
    C('8441', 'AUTH/8441/06/23', 'hp', 'Calderbank Biosciences', 'Email to health professionals without consent', 'Under the 2021 Code: emails sent without prior permission; breach ruled.', ['9.9'], [], 2021, '2023-06-05', '2024-01-26', 'No appeal', ['Undertaking']),
    C('8417', 'AUTH/8417/02/23', 'anon', 'Dunmore Medicines', 'Meeting venue alleged to be lavish', 'Under the 2021 Code: the venue was ruled appropriate; no breach.', [], ['10.1', '22.1'], 2021, '2023-02-13', '2023-09-29', 'No appeal', []),
    C('8352', 'AUTH/8352/09/22', 'co', 'Alder Therapeutics', 'Head-to-head claim from a subgroup analysis', 'Under the 2021 Code: claims based on a subgroup were ruled misleading.', ['7.2', '7.3'], ['7.4'], 2021, '2022-09-19', '2023-04-14', 'Appeal by respondent – Panel rulings upheld', ['Undertaking'], 'Hartland Pharmaceuticals'),
    C('8211', 'AUTH/8211/03/21', 'pub', 'Greyfriars Bio', 'Social media post shared by an employee', 'Under the 2019 Code: an employee’s share of a product post was ruled promotion to the public.', ['26.1', '9.1'], ['2'], 2019, '2021-03-08', '2021-11-05', 'No appeal', ['Undertaking']),
    C('8110', 'AUTH/8110/06/20', 'hp', 'Fernhill Health', 'Adverse event reporting statement missing', 'Under the 2019 Code: a website omitted the adverse event reporting statement; breach ruled.', ['4.10', '9.1'], [], 2019, '2020-06-22', '2021-01-29', 'No appeal', ['Undertaking']),
    C('7965', 'AUTH/7965/10/18', 'ex', 'Hartland Pharmaceuticals', 'Certification of meeting materials', 'Under the 2016 Code: materials used at meetings had not been certified; breaches including Clause 2 ruled.', ['2', '14.1', '9.1'], [], 2016, '2018-10-01', '2019-05-17', 'Reported to Appeal Board – audit required', ['Undertaking', 'Audit', 'Public reprimand']),
    C('7802', 'AUTH/7802/01/17', 'hp', 'Elmstead Pharma UK', 'Use of the word “new”', 'Under the 2016 Code: a product described as new after 12 months on the market; breach ruled.', ['7.11'], [], 2016, '2017-01-16', '2017-06-23', 'No appeal', ['Undertaking'])
  ];

  var ONGOING = [
    { ref: 'CASE/9102/09/26', title: 'Health professional v Brightwater Pharma', stage: 1, received: '2026-09-15', updated: '2026-09-29' },
    { ref: 'CASE/9097/08/26', title: 'Voluntary admission by Alder Therapeutics', stage: 2, received: '2026-08-27', updated: '2026-09-22' },
    { ref: 'CASE/9090/07/26', title: 'Calderbank Biosciences v Elmstead Pharma UK', stage: 3, received: '2026-07-14', updated: '2026-09-30' },
    { ref: 'CASE/9084/06/26', title: 'Anonymous complainant v Hartland Pharmaceuticals', stage: 4, outcome: 'Breach ruled', received: '2026-06-03', updated: '2026-09-18' },
    { ref: 'CASE/9079/05/26', title: 'Member of the public v Fernhill Health', stage: 6, outcome: 'No breach ruled', received: '2026-05-11', updated: '2026-10-02' },
    { ref: 'CASE/9075/04/26', title: 'Ex-employee v Greyfriars Bio', stage: 5, outcome: 'Breach ruled', received: '2026-04-20', updated: '2026-09-25' },
    { ref: 'CASE/9074/04/26', title: 'Health professional v Dunmore Medicines', stage: 6, outcome: 'Breach ruled', received: '2026-04-14', updated: '2026-09-29' }
  ];
  var STAGES = ['Received', 'Case preparation', 'Referred to the Panel', 'Assigned to Panel members', 'Ruled: awaiting undertaking or appeal', 'Processing appeal', 'Case report pending'];

  /* As published: 2025 Annual Report news post (1 July 2026) and Ongoing cases (30 Sept 2026). */
  var PERFORMANCE = {
    rulings: [{ label: '2024', value: 104 }, { label: '2025', value: 161 }],
    open: [{ label: 'Start of 2025', value: 155 }, { label: 'End of 2025', value: 81 }, { label: '30 June 2026', value: 65 }, { label: '30 Sept 2026', value: 67 }],
    upheld: 98,
    snapshots: {
      '2026-06-30': { label: '30 June 2026', prep: 26, panel: 22, assigned: 17, undertaking: 9, appeal: 4, sanction: 0 },
      '2026-09-30': { label: '30 September 2026', prep: 23, panel: 20, assigned: 24, undertaking: 6, appeal: 6, sanction: 2 }
    }
  };

  var TRAINING = [
    { date: '11 May 2026', status: 'past' },
    { date: '12 May 2026', status: 'past' },
    { date: '5 November 2026', status: 'full' },
    { date: '6 November 2026', status: 'full' }
  ];

  window.PM = {
    SECTIONS: SECTIONS, CLAUSES: CLAUSES, CODE: CODE, GLOSSARY: GLOSSARY, QAS: QAS, GUIDANCE: GUIDANCE,
    CASES: CASES, CTYPES: CTYPES, ONGOING: ONGOING, STAGES: STAGES, PERFORMANCE: PERFORMANCE, TRAINING: TRAINING
  };
})();
