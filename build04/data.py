# -*- coding: utf-8 -*-
"""v0.4 data: knowledge graph (chapters + topics/concepts + book sections + figures), glossary, flashcards."""

CHAPTERS = [
 ("ch1","1. Introduction"),("ch2","2. Medical Terminology"),("ch3","3. The Subjective Sections"),
 ("ch4","4. The Physical Exam"),("ch5","5. Objective: Course, Results, A&P"),("ch6a","6A. Primary Care Clinic"),
 ("ch6b","6B. Emergency Department"),("ch7","7. Billing and Reimbursement"),("ch8","8. The Medical Note Big Picture")]

CONCEPTS=[
("scribe","Medical Scribe","role","ch1","Documents provider-patient encounters in real time into the EHR."),
("hipaa","HIPAA","rule","ch1","Federal law protecting patient health information privacy and security."),
("phi","PHI","concept","ch1","Protected Health Information — any identifiable health data."),
("min-necessary","Minimum Necessary","rule","ch1","Access only the PHI needed to do your job."),
("terminology","Medical Terminology","concept","ch2","Greek/Latin-based language of medicine: prefixes, roots, suffixes."),
("anatomy","Anatomy & Planes","concept","ch2","Directional terms (superior, proximal) and body planes."),
("abd-regions","Abdominal Regions","concept","ch2","9 regions / 4 quadrants used to localize abdominal pain."),
("skeletal","Skeletal Landmarks","concept","ch2","Bones and palpable landmarks documented in exams."),
("soap","SOAP Note","topic","ch3","Subjective, Objective, Assessment, Plan — standard note structure."),
("cc","Chief Complaint","topic","ch3","Why the patient came, ideally in quotes."),
("hpi","HPI","topic","ch3","Narrative of present illness: OLDCARTS elements."),
("ros","Review of Systems","topic","ch3","Head-to-toe symptom checklist beyond the HPI."),
("pmhx","PMHx / Meds / Allergies","topic","ch3","Past history, medications, allergies — semi-subjective context."),
("golden-rules","Golden Rules","rule","ch3","Document what is said/done; never fabricate or interpret."),
("vitals","Vital Signs","objective","ch4","BP, HR, RR, temp, SpO2, pain score — objective baseline."),
("phys-exam","Physical Exam","objective","ch4","Provider's observed findings by system; pediatric vs adult norms differ."),
("clinical-course","Clinical Course","objective","ch5","What happened during the stay: interventions, response."),
("results","Results Review","objective","ch5","Labs/imaging and provider interpretation of them."),
("ap","Assessment & Plan","topic","ch5","Diagnosis reasoning and management per problem."),
("cdm","Clinical Decision Making","concept","ch5","Risk, data reviewed, alternatives considered — drives billing level."),
("icd10","ICD-10 Coding","billing","ch5","Diagnosis codes that must be supported by documentation."),
("addendum","Addenda & Corrections","rule","ch5","Late changes are addenda with reason and author — never delete."),
("primary-care","Primary Care Clinic","setting","ch6a","Preventive medicine, chronic disease, wellness visits."),
("annual-physical","Annual Physical (AWV)","encounter","ch6a","Preventive visit: screening, immunizations, counseling."),
("prenatal","Prenatal Care","encounter","ch6a","Pregnancy tracking: dates, fundal height, fetal heart tones."),
("wcc","Well Child Checks","encounter","ch6a","Pediatric milestones, growth curves, vaccines."),
("chronic","Chronic Disease Mgmt","encounter","ch6a","Diabetes, HTN, asthma: control status and med adjustments."),
("ed","Emergency Department","setting","ch6b","Acute care: triage, resuscitation, disposition."),
("triage","Triage & ESI","concept","ch6b","Severity indexing driving wait order."),
("chest-pain","Chest Pain Workup","condition","ch6b","ECG within 10 min, troponin, rule out ACS."),
("abdo-ed","ED Abdominal Pain","condition","ch6b","Differential broad: appendicitis, stones, ectopic."),
("stroke","Stroke / CVA","condition","ch6b","Time-critical: last known well, NIHSS, tPA window."),
("ed-meds","ED Medications","concept","ch6b","Common acute meds and documentation of response."),
("em-levels","E/M Levels","billing","ch7","99202-99215 outpatient, 99281-99288 ED levels."),
("time-billing","Billing by Time","billing","ch7","Total time can determine level since 2021 rules."),
("critical-care","Critical Care Time","billing","ch7","At least 30 min continuous high-intensity care, separately billed."),
("med-necessity","Medical Necessity","billing","ch7","Services justified by symptoms/findings — documented rationale."),
("quality-measures","Quality Measures","billing","ch7","CMS/TJC core measures tied to reimbursement."),
("medicolegal","Medicolegal Record","concept","ch8","The chart is a legal document: contemporaneous, factual."),
("chart-vs-note","Note vs Chart","concept","ch8","One visit note lives inside the lifelong longitudinal chart."),
("future-readers","Future Readers","concept","ch8","Write for consultants, lawyers, patients reading later."),
]

XLINK=[("ch1-scribe","scribe","defines"),("ch1-hipaa","hipaa","explains"),("hipaa","phi","protects"),
("phi","min-necessary","limited by"),("ch2-anatomy","anatomy","teaches"),("ch2-abdominal","abd-regions","teaches"),
("ch2-skeletal","skeletal","teaches"),("ch2-language","terminology","teaches"),("ch3-golden","golden-rules","states"),
("ch3-soap","soap","introduces"),("ch3-cc","cc","details"),("ch3-hpi","hpi","details"),("ch3-ros","ros","details"),
("soap","cc","contains"),("soap","hpi","contains"),("soap","ros","contains"),("soap","phys-exam","contains"),
("soap","ap","contains"),("soap","vitals","contains"),("soap","pmhx","contains"),("hpi","cc","expands"),
("hpi","terminology","uses"),("golden-rules","soap","governs"),("ch4-vitals","vitals","details"),
("ch4-adult","phys-exam","adult exam"),("ch4-peds","phys-exam","pediatric exam"),("phys-exam","vitals","supported by"),
("phys-exam","anatomy","uses"),("ch5-course","clinical-course","details"),("ch5-results","results","details"),
("ch5-ap","ap","details"),("ch5-mdm","cdm","details"),("ch5-dx","icd10","details"),("ch5-addenda","addendum","details"),
("ap","cdm","justified by"),("ap","icd10","coded by"),("ap","results","based on"),("clinical-course","results","generates"),
("addendum","medicolegal","affects"),("ch6a-annual","annual-physical","covers"),("ch6a-prenatal","prenatal","covers"),
("ch6a-wcc","wcc","covers"),("ch6a-chronic","chronic","covers"),("primary-care","soap","uses"),
("primary-care","annual-physical","offers"),("primary-care","chronic","manages"),("primary-care","prenatal","offers"),
("primary-care","wcc","offers"),("ch6b-process","ed","walks through"),("ch6b-conditions","chest-pain","covers"),
("ch6b-conditions","stroke","covers"),("ch6b-conditions","abdo-ed","covers"),("ch6b-meds","ed-meds","covers"),
("ed","triage","starts with"),("ed","chest-pain","treats"),("ed","abdo-ed","treats"),("ed","stroke","treats"),
("ed","ed-meds","administers"),("ed","soap","uses"),("chest-pain","results","orders"),("stroke","time-billing","time-critical"),
("ch7-em","em-levels","details"),("ch7-time","time-billing","details"),("ch7-critical","critical-care","details"),
("ch7-necessity","med-necessity","details"),("ch7-cms","quality-measures","details"),
("em-levels","cdm","driven by"),("em-levels","time-billing","or"),("critical-care","time-billing","subset of"),
("med-necessity","icd10","links to"),("quality-measures","em-levels","affects"),("quality-measures","primary-care","measures"),
("ch8-note","chart-vs-note","defines"),("ch8-future","future-readers","describes"),("ch8-medicolegal","medicolegal","describes"),
("chart-vs-note","medicolegal","evidence in"),("future-readers","medicolegal","audience of"),("future-readers","addendum","constrained by"),
("icd10","ap","codes"),("chronic","em-levels","billed by"),("annual-physical","quality-measures","scored by"),
("scribe","golden-rules","obeys"),("scribe","hipaa","must follow"),("scribe","soap","writes"),
("terminology","anatomy","describes"),("anatomy","abd-regions","includes"),("anatomy","skeletal","includes")]

GLOSSARY={
"SOAP":"Subjective, Objective, Assessment, Plan — the standard medical note format.",
"HPI":"History of Present Illness — narrative of the current complaint (OLDCARTS).",
"ROS":"Review of Systems — head-to-toe inventory of positive/negative symptoms.",
"CC":"Chief Complaint — the primary reason for the encounter, often in patient's words.",
"PHI":"Protected Health Information — individually identifiable health data under HIPAA.",
"ICD-10":"International Classification of Diseases, 10th revision — diagnosis coding system.",
"E/M":"Evaluation and Management — billing category for office/ED visits (e.g., 99213).",
"MDM":"Medical Decision Making — complexity of problems, data, and risk; sets E/M level.",
"CDM":"Clinical Decision Making — same concept as MDM; documented reasoning.",
"AWV":"Annual Wellness Visit — Medicare preventive visit with screening plan.",
"WCC":"Well Child Check — scheduled pediatric preventive visit.",
"VS":"Vital Signs — BP, pulse, respirations, temperature, oxygen saturation.",
"ACS":"Acute Coronary Syndrome — heart attack/unstable angina spectrum.",
"NIHSS":"National Institutes of Health Stroke Scale — stroke severity score.",
"tPA":"Tissue plasminogen activator — clot-busting drug for ischemic stroke.",
"ESI":"Emergency Severity Index — 5-level triage acuity scale.",
"Addendum":"A later addition to a note, signed, dated, with reason; never erases originals.",
"OLDCARTS":"Onset, Location, Duration, Character, Aggravating/Relieving, Timing, Severity — HPI elements.",
"Proximal":"Closer to the trunk or point of attachment (opposite of distal).",
"Distal":"Farther from the trunk or point of attachment.",
"Superior":"Above or toward the head (cranial).","Inferior":"Below or toward the feet (caudal).",
"Tachycardia":"Heart rate over 100 bpm in adults.","Bradycardia":"Heart rate under 60 bpm in adults.",
"Dyspnea":"Shortness of breath or labored breathing.",
"Differential":"List of plausible diagnoses considered before concluding.",
"Disposition":"Where the patient goes after the ED visit (home, admit, transfer).",
"Co-sign":"Provider signature validating the scribe-documented note.",
"Syncope":"Medical term for fainting or transient loss of consciousness.",
"Emesis":"Vomiting.","Malaise":"General feeling of being unwell.",
"Pyelonephritis":"Bacterial infection of the kidney (a 'kidney infection').",
"Nephrolithiasis":"Kidney stones.","Pancreatitis":"Inflammation of the pancreas; check lipase.",
"Cholelithiasis":"Gallstones; biliary colic worse after fatty food.",
"Rales":"Crackles — abnormal popping lung sounds on auscultation.",
"Rhonchi":"Low-pitched snoring/gurgling lung sounds.","Wheezing":"High-pitched whistling breathing sound.",
"Edema":"Swelling caused by excess fluid, not redness.","Erythema":"Redness of the skin.","Cerumen":"Earwax.",
"Umbilicus":"The navel / belly button.","Inguinal":"Relating to the groin.",
"Occipital":"Back of the head.","Frontal":"Forehead region.","Parietal":"Top/side scalp.","Temporal":"Side of the head.",
"Volar":"Palm side of the hand (plantar = sole of foot).","Radial":"Thumb side of the forearm/hand.",
"Ulnar":"Little-finger side of the forearm/hand.","Hallux":"The big toe.",
"-sclerosis":"Suffix meaning HARDENING (contrast -malacia = softening).",
"prn":"Latin pro re nata — 'as needed'.",
"DEXA":"Dual-energy X-ray absorptiometry — bone-density scan.",
"Alendronate":"Bisphosphonate medication for osteoporosis.",
"Metformin":"First-line oral medication for type II diabetes.",
"Atorvastatin":"Statin medication for cholesterol (not diabetes).",
"Coumadin":"Brand name for warfarin, an anticoagulant.",
"D-dimer":"Clot-breakdown lab marker; screens for DVT/PE.",
"Troponin":"Blood marker detecting heart-muscle damage.",
"Lipase":"Enzyme lab test diagnosing pancreatitis.",
"PHQ-9":"Nine-item depression screen (PHQ-2 is its short version; GAD-7 screens anxiety).",
"Pantoprazole":"Proton pump inhibitor reducing stomach acid.",
"McBurney's point":"RLQ tenderness landmark for appendicitis.",
"FAST exam":"Focused Assessment with Sonography in Trauma — record each view seen."}

FLASHCARDS=[{"front":"What does SOAP stand for?","back":"Subjective, Objective, Assessment, Plan.","tag":"Ch.3 Notes"},
{"front":"Name the OLDCARTS elements.","back":"Onset, Location, Duration, Character, Aggravating/Relieving factors, Timing, Severity.","tag":"Ch.3 HPI"},
{"front":"What is PHI?","back":"Protected Health Information — any individually identifiable health data governed by HIPAA.","tag":"Ch.1 HIPAA"},
{"front":"Rule for corrections after a note is signed?","back":"Never delete — write an addendum that is dated, timed, attributed, and states the reason.","tag":"Ch.5 Addenda"},
{"front":"Normal adult vitals: BP, HR, RR, SpO2?","back":"About 120/80 (<130/80), 60–100 bpm, 12–20/min, at least 95% on room air.","tag":"Ch.4 Vitals"},
{"front":"How many abdominal quadrants and regions?","back":"4 quadrants (umbilical cross) or 9 regions (two horizontal + two vertical lines).","tag":"Ch.2 Anatomy"},
{"front":"Proximal vs. distal?","back":"Proximal = closer to trunk/attachment; distal = farther (elbow is proximal to wrist).","tag":"Ch.2 Terms"},
{"front":"What drives E/M level selection since 2021 (outpatient)?","back":"Medical Decision Making or total time on the date of the encounter.","tag":"Ch.7 Billing"},
{"front":"ED critical care time threshold?","back":"At least 30 minutes of continuous, high-intensity care; independently billed.","tag":"Ch.7 Billing"},
{"front":"Door-to-ECG target for chest pain?","back":"Within 10 minutes of arrival (ACS rule-out).","tag":"Ch.6B ED"},
{"front":"What is 'medical necessity'?","back":"The service must be justified by the patient's signs/symptoms/diagnosis — documented so payers accept it.","tag":"Ch.7 Billing"},
{"front":"Who are the future readers of a chart?","back":"Consultants, other providers, auditors/payers, lawyers, and the patient themselves.","tag":"Ch.8 Big Picture"},
{"front":"Can a scribe write that the exam was 'normal'?","back":"Only if the provider stated it; scribes record exactly what is said or done — never assume.","tag":"Ch.3 Golden Rules"},
{"front":"What is the minimum necessary standard?","back":"Access/use/disclose only the PHI required for the task at hand.","tag":"Ch.1 HIPAA"},
{"front":"Medical term for fainting?","back":"Syncope.","tag":"Ch.3 Symptoms"},
{"front":"Rales are better known as…?","back":"Crackles — brief popping sounds on inspiration.","tag":"Ch.4 Lungs"},
{"front":"Which lab diagnoses pancreatitis?","back":"Lipase (often with amylase).","tag":"Ch.6B Labs"},
{"front":"Classic appendix pain location?","back":"Right lower quadrant (McBurney's point).","tag":"Ch.6B ED"},
{"front":"Low TSH means…?","back":"Hyperthyroidism (high TSH suggests hypothyroidism).","tag":"Ch.6A Chronic"}]

def build(meta):
    """meta: {'labels':{ch:label}, 'sections':[(ch,secId,title)], 'figures':[(ch,cap)]}"""
    N=[];L=[]
    def node(i,l,t,ch,d=""): N.append({"id":i,"label":l,"type":t,"ch":ch,"desc":d})
    ch_labels = meta['labels']
    for cid,label in CHAPTERS:
        node(cid, label.split('. ',1)[-1], "chapter", cid, "Chapter of the book.")
    for c in CONCEPTS: node(*c)
    for ch,sid,title in meta['sections']:
        node(sid, title, "section", ch, "Book section of %s." % ch_labels.get(ch,ch))
    for i,(ch,cap) in enumerate(meta['figures']):
        fid="%s-fig%d"%(ch,i+1)
        node(fid,cap,"figure",ch,"Illustration referenced in %s."%ch_labels.get(ch,ch))
    ids={n["id"] for n in N}
    def link(a,b,r):
        if a in ids and b in ids: L.append([a,b,r])
    for ch,sid,title in meta['sections']: link(ch,sid,"contains")
    for i,(ch,cap) in enumerate(meta['figures']): link(ch,"%s-fig%d"%(ch,i+1),"illustrates")
    for a,b,r in XLINK: link(a,b,r)
    return {"kg":{"nodes":N,"links":L},"glossary":GLOSSARY,"flashcards":FLASHCARDS}
