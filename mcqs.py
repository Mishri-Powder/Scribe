# -*- coding: utf-8 -*-
"""MCQ answer keys + study links, authored against the Scribe0.1 chapter quizzes.

Each entry aligns 1:1 with the questions extracted from the book source
(Scribe0.1.html), in order. 'a' lists correct option indices, 'why' explains
the answer, 'links' point at section ids inside the book for study jumps."""

MCQS = {
"ch1": [
 {"a":[3],"why":"Names, phone numbers and addresses are all identifiers — everything about the patient's care counts as PHI.","links":["ch1-hipaa"]},
 {"a":[2],"why":"Scribes may not relay verbal orders to staff; that is a licensed-clinician task. They do document exams and dictated A&P, and may flag incomplete charts.","links":["ch1-scribe","ch3-golden"]},
 {"a":[1],"why":"False — HIPAA permits access for treatment, payment and operations without explicit consent (minimum-necessary still applies).","links":["ch1-hipaa"]},
 {"a":[0],"why":"PHI = Protected Health Information.","links":["ch1-hipaa"]},
 {"a":[1],"why":"False — there is no universal scribe certification/license; requirements vary by employer and state.","links":["ch1-scribe"]},
 {"a":[1],"why":"False — the role is not nationally standardized; duties differ widely between employers.","links":["ch1-scribe"]},
 {"a":[0],"why":"True — never discuss work or patients on social media; even vague posts risk a HIPAA violation.","links":["ch1-hipaa","ch1-scribe"]}],
"ch2": [
 {"a":[0],"why":"The big toe sits toward the body midline — medial. (Recall: hallux = great toe.)","links":["ch2-anatomy"]},
 {"a":[2],"why":"'Volar' describes the palm surface of the hand. Dorsal/posterior would be the back of the hand; plantar is reserved for the sole.","links":["ch2-upper","ch2-foot"]},
 {"a":[3],"why":"The umbilicus is the technical name for the belly button.","links":["ch2-abdominal"]},
 {"a":[1],"why":"False — the knee is PROXIMAL to the foot; distal means farther from the trunk.","links":["ch2-anatomy","ch2-lower"]},
 {"a":[1],"why":"False — the thumb is on the radial aspect; the ulna runs along the little-finger side.","links":["ch2-upper","ch2-hand"]},
 {"a":[0],"why":"Occipital = back of the head; frontal = forehead; parietal = top; temporal = sides.","links":["ch2-head"]},
 {"a":[2],"why":"A fingerprint is on the distal (fingertip) volar (palm-side) phalanx.","links":["ch2-hand"]},
 {"a":[3],"why":"The costovertebral angle (CVA) is on the BACK — flank percussion for kidney tenderness. The others are anterior landmarks.","links":["ch2-thorax","ch2-skeletal"]},
 {"a":[1],"why":"False — -sclerosis means HARDENING (e.g., multiple sclerosis); -malacia means softening.","links":["ch2-language"]},
 {"a":[3],"why":"Periumbilical = around the navel — the classic low-central abdominal descriptor (think early appendicitis). Umbilical names the point itself; suprapubic is lower.","links":["ch2-abdominal"]},
 {"a":[2],"why":"Hepat/o = liver (hepatitis, hepatology). Cardio=heart, nephro=kidney, dermat=skin.","links":["ch2-language"]},
 {"a":[2],"why":"Inguinal = the groin region (think: inguinal hernia).","links":["ch2-abdominal","ch2-lower"]},
 {"a":[0],"why":"True — prn is Latin pro re nata, 'as needed'.","links":["ch2-language"]}],
"ch3": [
 {"a":[0],"why":"'Urinary tract infection' is a DIAGNOSIS, not a complaint. The CC should be the patient's problem in their words (dysuria, frequency, cough).","links":["ch3-cc","ch3-golden"]},
 {"a":[3],"why":"Syncope = medical term for fainting. Emesis=vomiting, dyspnea=breathlessness, malaise=general unwell feeling.","links":["ch3-hpi","ch3-ros"]},
 {"a":[1],"why":"'Severe' describes pain INTENSITY, not quality. Sharp/burning/dull are quality descriptors.","links":["ch3-hpi"]},
 {"a":[3],"why":"All three — malaise, fever and fatigue ARE constitutional symptoms in the ROS.","links":["ch3-ros"]},
 {"a":[1],"why":"False — patients frequently miss OTC meds, supplements, eye drops or recent changes; verify with bottles/lists.","links":["ch3-ros"]},
 {"a":[1],"why":"False — the CC is the immediate complaint; the reason for visit can include follow-up/routine purposes.","links":["ch3-cc"]},
 {"a":[1],"why":"False — a side effect (e.g., ACE-inhibitor cough) is not an allergy; document which it is and the reaction.","links":["ch3-ros","ch3-golden"]}],
"ch4": [
 {"a":[0],"why":"Rales = crackles (also called coarse crackles). Rhonchi = snoring sounds, wheezing = whistling, sputum = mucus.","links":["ch4-adult"]},
 {"a":[1],"why":"2+ is normal pulse amplitude; 1+ diminished, 3+/4+ bounding.","links":["ch4-vitals","ch4-adult"]},
 {"a":[1],"why":"Tachycardia = fast heart rate (>100 adults). Tachypnea = fast breathing; bradycardia = slow; hypoxia = low O2.","links":["ch4-vitals","ch2-language"]},
 {"a":[2],"why":"Cerumen = earwax — that belongs to the EAR exam, not the neck (tenderness, lymphadenopathy, thyromegaly are neck findings).","links":["ch4-adult"]},
 {"a":[1],"why":"False — edema is SWELLING from fluid; redness is erythema.","links":["ch4-adult","ch2-language"]},
 {"a":[3],"why":"All of the above — inspection, auscultation and palpation (plus percussion) make up the physical exam.","links":["ch4-adult"]},
 {"a":[1],"why":"False — SYMPTOMS (subjective) belong in the HPI/ROS; the exam documents SIGNS (objective findings).","links":["ch3-soap","ch4-adult"]}],
"ch5": [
 {"a":[0],"why":"The course section captures everything during the stay: labs, imaging, therapies, consults AND re-evaluations.","links":["ch5-course"]},
 {"a":[2],"why":"ICD = International Classification of Diseases (currently ICD-10-CM).","links":["ch5-dx"]},
 {"a":[3],"why":"All of the above — acute/chronic, stable/unstable, well/poorly-controlled qualify each diagnosis.","links":["ch5-ap"]},
 {"a":[1],"why":"An addendum is used for changes made AFTER the note is signed; earlier changes are edited within the draft.","links":["ch5-addenda"]},
 {"a":[1],"why":"False — documentation must still state what results were reviewed and their interpretation.","links":["ch5-results"]},
 {"a":[1],"why":"False — list every diagnosis addressed; under-documenting hides medical necessity and harms billing/care.","links":["ch5-dx","ch7-necessity"]},
 {"a":[0],"why":"True — spell out start/continue/discontinue and exact doses to prevent medication errors.","links":["ch5-meds","ch5-plan"]}],
"ch6a": [
 {"a":[1],"why":"Post-menopausal women have the highest osteoporosis risk — bone-density (DEXA) screening focuses there.","links":["ch6a-bone"]},
 {"a":[3],"why":"All of the above — calcium, vitamin D and alendronate (a bisphosphonate) are standard osteoporosis care.","links":["ch6a-bone"]},
 {"a":[2],"why":"Monofilament testing screens diabetic PERIPHERAL NEUROPATHY (loss of protective sensation).","links":["ch6a-chronic"]},
 {"a":[3],"why":"Urine microalbumin detects early diabetic nephropathy. A1c=glycemic control, lipids=cholesterol, monofilament=neuropathy.","links":["ch6a-chronic"]},
 {"a":[1],"why":"False — hypertension is diagnosed on repeated measurements across visits, not one reading (though ≥180/120 acts sooner).","links":["ch6a-chronic"]},
 {"a":[0],"why":"Atorvastatin treats cholesterol (statin), not diabetes. Glimepiride/glipizide (sulfonylureas) and metformin are diabetes meds.","links":["ch6a-chronic","ch2-language"]},
 {"a":[3],"why":"Pyelonephritis = kidney infection (pyelo=pelvis, nephro=kidney, -itis=inflammation). Nephrosis = kidney degeneration; nephrolithiasis = stones.","links":["ch6a-acute","ch2-language"]},
 {"a":[3],"why":"Hydrochlorothiazide is a diuretic for blood pressure — not an opioid. Dilaudid, morphine, hydrocodone are opioids.","links":["ch6a-chronic","ch6b-meds"]},
 {"a":[3],"why":"PHQ-2 and PHQ-9 screen depression (GAD-7 screens anxiety — the depression pair is PHQ-2; PHQ-9).","links":["ch6a-complex"]},
 {"a":[1],"why":"PSA screening is NOT a routine recommendation for a 70-year-old (shared decision-making generally ends by then); DEXA, colonoscopy and mammogram screening do apply.","links":["ch6a-annual"]},
 {"a":[1],"why":"False — LOW TSH suggests HYPERthyroidism; high TSH suggests hypothyroidism.","links":["ch6a-chronic","ch2-language"]}],
"ch6b": [
 {"a":[3],"why":"Pyelonephritis = kidney infection.","links":["ch6b-conditions","ch2-language"]},
 {"a":[3],"why":"Colitis causes LOWER abdominal (often LLQ) pain with stool changes — not epigastric. PUD, pancreatitis and gallstones are classic epigastric/RUQ.","links":["ch6b-conditions","ch2-abdominal"]},
 {"a":[0],"why":"Lipase (with amylase) diagnoses pancreatitis. Troponin=heart, D-dimer=clot, ALP=biliary/liver.","links":["ch6b-conditions"]},
 {"a":[1],"why":"Coumadin (warfarin) is an anticoagulant — bleeding risk for HEMORRHAGIC stroke. The others don't raise it.","links":["ch6b-conditions","ch6b-meds"]},
 {"a":[2],"why":"Most PE clots originate in deep leg veins (DVT) that embolize to the lungs.","links":["ch6b-conditions"]},
 {"a":[0],"why":"Troponin detects trace myocardial cell death — the ACS biomarker.","links":["ch6b-conditions","ch5-results"]},
 {"a":[3],"why":"Appendicitis classically localizes to the RIGHT LOWER QUADRANT (McBurney's point).","links":["ch6b-conditions","ch2-abdominal"]},
 {"a":[1],"why":"Pantoprazole is a proton pump inhibitor (-prazole). Zantac (ranitidine) is an H2 blocker.","links":["ch6b-meds","ch2-language"]},
 {"a":[0],"why":"True — fatty-food-triggered pain suggests biliary colic/cholecystitis (gallbladder squeezes against stones).","links":["ch6b-conditions"]},
 {"a":[0],"why":"D-dimer detects clot breakdown products — a sensitive screen for DVT/PE.","links":["ch6b-conditions"]},
 {"a":[0],"why":"True — both are embolic events: clots traveling to lung (PE) or brain (stroke).","links":["ch6b-conditions"]},
 {"a":[1],"why":"False — procedure documentation must record what was viewed/seen in detail ('no free fluid in the four views'), not just a conclusion.","links":["ch6b-note","ch3-golden"]},
 {"a":[1],"why":"False — a GI bleed can still be possible; denial of visible blood doesn't exclude occult bleeding.","links":["ch6b-conditions","ch3-ros"]}],
"ch7": [
 {"a":[1],"why":"False — E/M level 5 is HIGH complexity, not moderate.","links":["ch7-em","ch7-mdm"]},
 {"a":[2],"why":"A level-5 ED history requires ROS of 10 systems (complete review).","links":["ch7-edem","ch3-ros"]},
 {"a":[2],"why":"Performing a discrete procedure such as intubation is separately billable — it does not count inside critical-care time. Trauma, respiratory failure and acute MI define qualifying crit-care presentations.","links":["ch7-critical","ch7-procedure"]},
 {"a":[1],"why":"False — a bare 'normal EKG' isn't a billable interpretation; the provider must document a formal read.","links":["ch7-ekg"]},
 {"a":[1],"why":"False — even though MDM/time drives the level, the medically appropriate history & exam remain part of the note and support the service.","links":["ch7-em","ch7-summary"]},
 {"a":[1],"why":"False — CMS payers tie reimbursement and penalties to quality-measure performance.","links":["ch7-cms"]},
 {"a":[1],"why":"False — providers can bill BOTH the E/M (when significant, separately identifiable) and the procedure.","links":["ch7-procedure"]},
 {"a":[1],"why":"False — informed consent documenting risks/benefits/alternatives is required before procedures.","links":["ch7-procedure"]}]}
