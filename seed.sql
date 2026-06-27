-- HospiTime demo seed — full realistic dataset
-- Run: psql YOUR_DATABASE_URL -f seed.sql
-- Demo credentials  →  staff@hospitime.demo / staff2@hospitime.demo  |  visitor@hospitime.demo  |  familymember@hospitime.demo
-- All passwords: demo1234

-- ============================================================
-- CLEAN SLATE (dependency order)
-- ============================================================
DELETE FROM messages;
DELETE FROM test_results;
DELETE FROM clinical_updates;
DELETE FROM vitals;
DELETE FROM medications;
DELETE FROM bookings;
DELETE FROM patients;
DELETE FROM users;

-- ============================================================
-- USERS  (14 accounts — 3 staff, 2 visitor, 9 family)
-- ============================================================
-- password_hash = bcrypt('demo1234', 12)
INSERT INTO users (id, name, email, password_hash, role, job_title, linked_patient_id, created_at) VALUES
  (1,  'Dr. Sarah Mitchell',  'staff@hospitime.demo',        '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'staff',   'Consultant Intensivist', NULL, '2026-01-10T08:00:00.000Z'),
  (2,  'James Wilson',        'visitor@hospitime.demo',      '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'visitor', NULL, NULL, '2026-02-14T09:00:00.000Z'),
  (3,  'Nurse David Chen',    'staff2@hospitime.demo',       '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'staff',   'Senior ICU Nurse', NULL, '2026-01-10T08:05:00.000Z'),
  (4,  'Emily Clarke',        'emily.clarke@email.com',      '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 2,    '2026-06-19T10:00:00.000Z'),
  (5,  'Tom Clarke',          't.clarke@email.com',          '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'visitor', NULL, NULL, '2026-06-19T10:30:00.000Z'),
  (6,  'Raj Patel',           'raj.patel@email.com',         '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 3,    '2026-06-21T09:00:00.000Z'),
  (7,  'Grace Huang',         'grace.huang@email.com',       '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 4,    '2026-06-23T08:00:00.000Z'),
  (8,  'Josef Kowalski',      'j.kowalski@email.com',        '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 5,    '2026-06-20T11:00:00.000Z'),
  (9,  'Angela Murray',       'a.murray@email.com',          '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 7,    '2026-06-22T14:00:00.000Z'),
  (10, 'Yemi Osei',           'y.osei@email.com',            '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'visitor', NULL, NULL, '2026-06-24T09:00:00.000Z'),
  (11, 'Lily Chen',           'lily.chen@email.com',         '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 9,    '2026-06-18T08:00:00.000Z'),
  (12, 'Brenda O''Brien',     'b.obrien@email.com',          '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 10,   '2026-06-25T08:30:00.000Z'),
  (13, 'Colin Blackwell',     'c.blackwell@email.com',       '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'visitor', NULL, NULL, '2026-06-24T14:00:00.000Z'),
  (14, 'Kevin Walsh',          'k.walsh@email.com',           '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 11,   '2026-06-24T09:00:00.000Z'),
  (15, 'Salma Al-Rashid',     'salma.alrashid@email.com',    '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 12,   '2026-06-22T10:00:00.000Z'),
  (16, 'Chidi Adeyemi',       'chidi.adeyemi@email.com',     '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 13,   '2026-06-25T07:00:00.000Z'),
  (17, 'Jana Novak',          'jana.novak@email.com',        '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 14,   '2026-06-23T08:30:00.000Z'),
  (18, 'Cian Brennan',        'cian.brennan@email.com',      '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 15,   '2026-06-21T11:00:00.000Z'),
  (19, 'Layla Ibrahim',       'layla.ibrahim@email.com',     '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 16,   '2026-06-24T08:00:00.000Z'),
  (20, 'Patrick Fitzgerald',  'p.fitzgerald@email.com',      '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 17,   '2026-06-26T06:30:00.000Z'),
  (21, 'Diana Thompson',      'diana.thompson@email.com',    '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 18,   '2026-06-25T09:00:00.000Z'),
  (69, 'Sarah Thompson',      'familymember@hospitime.demo', '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 1,    '2026-02-20T10:00:00.000Z');

-- Family/visitor accounts for patients 19–40
INSERT INTO users (id, name, email, password_hash, role, job_title, linked_patient_id, created_at) VALUES
  (22, 'Clara Brennan',       'c.brennan@email.com',         '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 19,   '2026-06-25T10:00:00.000Z'),
  (23, 'Deepa Sharma',        'deepa.sharma@email.com',      '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 20,   '2026-06-24T11:00:00.000Z'),
  (24, 'Fiona McGrath',       'f.mcgrath@email.com',         '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 21,   '2026-06-24T09:00:00.000Z'),
  (25, 'Lars Svensson',       'lars.svensson@email.com',     '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 22,   '2026-06-23T08:00:00.000Z'),
  (26, 'Aisha Al-Farsi',      'aisha.alfarsi@email.com',     '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 23,   '2026-06-23T09:00:00.000Z'),
  (27, 'Hans Fischer',        'hans.fischer@email.com',      '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 24,   '2026-06-24T12:00:00.000Z'),
  (28, 'Siobhan Murphy',      'siobhan.murphy@email.com',    '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 25,   '2026-06-23T10:00:00.000Z'),
  (29, 'Hiroshi Tanaka',      'h.tanaka@email.com',          '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 26,   '2026-06-22T09:00:00.000Z'),
  (30, 'Emeka Eze',           'emeka.eze@email.com',         '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 27,   '2026-06-25T07:00:00.000Z'),
  (31, 'Ana Silva',           'ana.silva@email.com',         '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 28,   '2026-06-21T10:00:00.000Z'),
  (32, 'George Thornton',     'g.thornton@email.com',        '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 29,   '2026-06-24T09:00:00.000Z'),
  (33, 'Natasha Petrov',      'n.petrov@email.com',          '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 30,   '2026-06-22T11:00:00.000Z'),
  (34, 'Ibrahim Diallo',      'ibrahim.diallo@email.com',    '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 31,   '2026-06-25T08:00:00.000Z'),
  (35, 'Sinead Brady',        'sinead.brady@email.com',      '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 32,   '2026-06-23T08:00:00.000Z'),
  (36, 'James Nakashima',     'j.nakashima@email.com',       '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 33,   '2026-06-21T09:00:00.000Z'),
  (37, 'Kenji Nakamura',      'k.nakamura@email.com',        '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 34,   '2026-06-24T08:00:00.000Z'),
  (38, 'Patricia Hughes',     'p.hughes@email.com',          '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 35,   '2026-06-26T07:00:00.000Z'),
  (39, 'Tariq Begum',         't.begum@email.com',           '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 36,   '2026-06-24T09:00:00.000Z'),
  (40, 'Mary Keane',          'm.keane@email.com',           '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 37,   '2026-06-26T07:00:00.000Z'),
  (41, 'Andrzej Kowalczyk',   'a.kowalczyk@email.com',       '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 38,   '2026-06-25T10:00:00.000Z'),
  (42, 'Ngozi Okonkwo',       'ngozi.okonkwo@email.com',     '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 39,   '2026-06-25T09:00:00.000Z'),
  (43, 'Pierre Bouchard',     'p.bouchard@email.com',        '$2b$12$f9LQYFb3upHd4aRVdK3WRumU7aBw2g2twm4ueohX01rGqI3J5zASC', 'family',  NULL, 40,   '2026-06-24T10:00:00.000Z');

SELECT setval('users_id_seq', 69);

-- ============================================================
-- PATIENTS  (10 across all wards, various conditions)
-- Today = 2026-06-25
-- ============================================================
INSERT INTO patients (id, name, ward, date_of_birth, admission_date, condition, condition_notes, care_team, created_by) VALUES
  (1,  'Margaret Wilson',  'ICU Ward A', '1952-04-18', '2026-06-12', 'stable',    'Recovering well following elective cardiac catheterisation with stent placement. Heart rhythm normalised. Blood pressure within target range. Targeting discharge in 2–3 days.',                                                            'Dr. Patel, Nurse Martinez',      'Dr. Sarah Mitchell'),
  (2,  'Robert Clarke',    'ICU Ward B', '1968-11-03', '2026-06-18', 'serious',   'Post-emergency laparotomy for perforated bowel. Wound infection risk being managed with IV antibiotics. Bowel sounds returned. NG feeding ongoing. Surgical team monitoring closely.',                                                         'Dr. Chen, Nurse Rodriguez',      'Nurse David Chen'),
  (3,  'Audrey Patel',     'ICU Ward C', '1985-07-29', '2026-06-20', 'critical',  'Traumatic brain injury following road traffic accident. Sedated and ventilated. GCS 6 on admission. Left frontal contusion with 4mm midline shift on CT. Neurosurgery team reviewing daily.',                                                'Dr. Okafor, Nurse Liu',          'Dr. Sarah Mitchell'),
  (4,  'Frank Huang',      'HDU',        '1960-09-14', '2026-06-22', 'improving', 'Step-down from ICU Ward A following inferior STEMI treated with primary PCI. EF 38% on admission echocardiogram, improving. Cardiac rehab commenced. Transfer to cardiology ward anticipated within 24 hours.',                              'Dr. Patel, Nurse Martinez',      'Nurse David Chen'),
  (5,  'Dorothy Kowalski', 'ICU Ward A', '1949-02-07', '2026-06-19', 'serious',   'Severe community-acquired pneumonia with septic shock. Blood cultures positive for Streptococcus pneumoniae. Vasopressor requirements reducing. Inflammatory markers trending down.',                                                         'Dr. Mitchell, Nurse Martinez',   'Dr. Sarah Mitchell'),
  (6,  'Thomas Osei',      'ICU Ward B', '1978-03-22', '2026-06-23', 'stable',    'Post-laparoscopic appendectomy for perforated appendix. Procedure uncomplicated. Tolerating oral fluids. Mild post-operative fever settled. Discharge planned for tomorrow.',                                                                 'Dr. Chen, Nurse Rodriguez',      'Nurse David Chen'),
  (7,  'Patricia Murray',  'ICU Ward C', '1956-12-01', '2026-06-21', 'critical',  'Acute Respiratory Distress Syndrome secondary to severe community-acquired pneumonia. Deeply sedated and ventilated with neuromuscular blockade. P/F ratio 85 on FiO2 60%. Proning sessions ongoing.',                                      'Dr. Okafor, Dr. Singh, Nurse Liu', 'Dr. Sarah Mitchell'),
  (8,  'Henry Blackwell',  'HDU',        '1944-08-30', '2026-06-24', 'stable',    'Acute COPD exacerbation precipitated by respiratory tract infection. Responding to nebulisers and systemic steroids. Controlled oxygen therapy via Venturi mask. Type 2 respiratory failure on admission ABG, improving.',                   'Dr. Mitchell, Nurse Chen',       'Nurse David Chen'),
  (9,  'Mei-Ling Chen',    'ICU Ward A', '1990-05-16', '2026-06-17', 'improving', 'Diabetic ketoacidosis (DKA) with HbA1c 12.4%, indicating poor long-term glycaemic control. Ketones now cleared. Blood glucose normalised. Transitioning to subcutaneous insulin regimen. Diabetes specialist nurse review arranged.',         'Dr. Singh, Nurse Martinez',      'Dr. Sarah Mitchell'),
  (10, 'James O''Brien',   'ICU Ward B', '1958-10-25', '2026-06-25', 'serious',   'Out-of-hospital cardiac arrest (VF) with ROSC after 18 minutes. Suspected ACS trigger. Therapeutic hypothermia protocol initiated (target 36°C). Coronary angiography planned for tomorrow pending stabilisation.',                          'Dr. Patel, Dr. Okafor, Nurse Liu', 'Dr. Sarah Mitchell'),
  -- ICU Ward A extras
  (11, 'Bernard Walsh',      'ICU Ward A', '1955-03-12', '2026-06-23', 'improving', 'Post-coronary artery bypass grafting (CABG ×3). Haemodynamically stable. Chest drain removed Day 2. Atrial fibrillation episode on Day 1 converted with amiodarone. Mobilising with physiotherapy. Wound healing well.',                          'Dr. Patel, Nurse Martinez',      'Dr. Sarah Mitchell'),
  (12, 'Fatima Al-Rashid',   'ICU Ward A', '1972-08-19', '2026-06-21', 'stable',    'Right MCA territory ischaemic stroke with expressive dysphasia. Thrombolysis administered within 3.5 hours of onset. NIHSS improving from 12 to 7. Aspirin and statin commenced. Swallowing assessment in progress. Rehab referral made.',   'Dr. Singh, Nurse Martinez',      'Nurse David Chen'),
  -- ICU Ward B extras
  (13, 'Nkechi Adeyemi',     'ICU Ward B', '1983-06-07', '2026-06-24', 'serious',   'Acute liver failure secondary to paracetamol overdose. INR 3.8 on admission, trending down. N-acetylcysteine infusion completed. Liver transplant team assessment ongoing. Hepatic encephalopathy Grade 2 — orientation fluctuating.',            'Dr. Okafor, Dr. Chen, Nurse Rodriguez', 'Dr. Sarah Mitchell'),
  (14, 'Viktor Novak',       'ICU Ward B', '1949-11-30', '2026-06-22', 'critical',  'Multi-organ dysfunction syndrome (MODS) secondary to ruptured abdominal aortic aneurysm. Emergency EVAR performed. Vasopressors on dual agents. AKI requiring CRRT. Ventilated and sedated. Family meeting held; guarded prognosis discussed.',  'Dr. Patel, Dr. Chen, Nurse Liu', 'Dr. Sarah Mitchell'),
  -- ICU Ward C extras
  (15, 'Saoirse Brennan',    'ICU Ward C', '1966-04-22', '2026-06-20', 'improving', 'Post-resection of right frontal meningioma (WHO Grade I). Craniotomy wound clean and dry. Mild post-operative headaches managed with regular analgesia. No neurological deficits. Weaned from ICU monitoring — HDU transfer planned tomorrow.', 'Dr. Okafor, Nurse Liu',          'Nurse David Chen'),
  (16, 'Hassan Ibrahim',     'ICU Ward C', '1957-09-08', '2026-06-23', 'stable',    'C5/C6 fracture dislocation with incomplete cord injury following fall from height. Spinal precautions maintained. MRI confirms no epidural haematoma. Neurosurgery reviewed — conservative management. Bladder catheterised, bowel protocol started.','Dr. Okafor, Dr. Singh, Nurse Liu', 'Dr. Sarah Mitchell'),
  -- HDU extras
  (17, 'Eleanor Fitzgerald', 'HDU',        '1958-02-14', '2026-06-25', 'improving', 'Laparoscopic cholecystectomy for acute cholecystitis. Procedure uncomplicated. Tolerating light diet Day 1. Port-site pain controlled with regular paracetamol and ibuprofen. Discharge criteria met; awaiting social circumstances review before home.',  'Dr. Mitchell, Nurse Chen',   'Nurse David Chen'),
  (18, 'Marcus Thompson',    'HDU',        '1976-07-03', '2026-06-24', 'stable',    'Recurrent unexplained syncope under investigation. 48-hour Holter monitor fitted. Echo shows no structural abnormality. Orthostatic hypotension confirmed on tilt-table testing. Commenced fludrocortisone and salt loading advice. Cardiology follow-up arranged.', 'Dr. Patel, Nurse Chen', 'Dr. Sarah Mitchell');

-- ICU Ward A (add 5 more → total 10)
INSERT INTO patients (id, name, ward, date_of_birth, admission_date, condition, condition_notes, care_team, created_by) VALUES
  (19, 'Arthur Brennan',     'ICU Ward A', '1963-07-11', '2026-06-25', 'serious',   'Emergency Hartmann''s procedure for sigmoid diverticular perforation. Intra-abdominal sepsis with peritonitis. Gram-negative bacteraemia on blood cultures. IV tazocin commenced. Bowel loop resected; stoma formed. Vasopressor support weaning.',                       'Dr. Patel, Nurse Martinez',      'Dr. Sarah Mitchell'),
  (20, 'Priya Sharma',       'ICU Ward A', '1979-02-28', '2026-06-24', 'stable',    'Submassive pulmonary embolism with right heart strain on CT-PA. Thrombolysis declined (recent surgery). Systemic anticoagulation with IV heparin commenced. Right ventricular function improving on serial echos. Troponin trending down. Monitoring in ICU pending step-down.',    'Dr. Singh, Nurse Martinez',      'Nurse David Chen'),
  (21, 'Callum McGrath',     'ICU Ward A', '1991-09-03', '2026-06-23', 'improving', 'Multiple rib fractures (3–8 bilateral) and haemo-pneumothorax following RTA. Right-sided chest drain in situ; draining satisfactorily. Analgesia via thoracic epidural. FiO2 requirements decreasing. Mobilisation cautiously commenced. Thoracic surgery reviewed — no operative intervention required.',   'Dr. Mitchell, Nurse Martinez',  'Dr. Sarah Mitchell'),
  (22, 'Ingrid Svensson',    'ICU Ward A', '1946-12-05', '2026-06-22', 'critical',  'Severe sepsis secondary to bilateral community-acquired pneumonia with bacteraemia (S. aureus). Ventilated day 4. Requiring noradrenaline 0.14 mcg/kg/min. P/F ratio 140 on FiO2 50% — early ARDS criteria met. Prone positioning trialled. Renal function declining.',            'Dr. Mitchell, Dr. Okafor, Nurse Martinez', 'Dr. Sarah Mitchell'),
  (23, 'Mohammed Al-Farsi',  'ICU Ward A', '1958-05-19', '2026-06-22', 'improving', 'Post-CABG ×4 Day 4. Rhythm: normal sinus at 62bpm. Chest drains removed Day 2. Wound healing satisfactorily. Cardiac rehab physio commenced — walked 30m today. Blood glucose well controlled. Analgesia weaned to regular oral paracetamol. Targeting step-down to HDU tonight.',        'Dr. Patel, Nurse Martinez',      'Nurse David Chen');

-- ICU Ward B (add 5 more → total 10)
INSERT INTO patients (id, name, ward, date_of_birth, admission_date, condition, condition_notes, care_team, created_by) VALUES
  (24, 'Lena Fischer',       'ICU Ward B', '1975-04-16', '2026-06-24', 'improving', 'Post-emergency laparotomy for small bowel obstruction secondary to adhesions. Bowel resection with primary anastomosis. Ileus resolving — passing flatus. NG tube on free drainage, reduced output. IV antibiotics day 2. Wound erythema being monitored closely.',                 'Dr. Chen, Nurse Rodriguez',      'Dr. Sarah Mitchell'),
  (25, 'Declan Murphy',      'ICU Ward B', '1967-08-22', '2026-06-23', 'serious',   'Necrotising pancreatitis with infected necrosis (E. coli on CT-guided drain aspirate). APACHE II score 18. Vasopressor support commenced day 3 (noradrenaline 0.06 mcg/kg/min). AKI stage 1 — urine output marginal. Total parenteral nutrition running. Surgical team reviewing for debridement.',  'Dr. Chen, Dr. Okafor, Nurse Rodriguez', 'Dr. Sarah Mitchell'),
  (26, 'Yuki Tanaka',        'ICU Ward B', '1955-11-08', '2026-06-21', 'stable',    'Post-aortic valve replacement (bioprosthetic, Day 5). Routine post-operative progress. Sinus rhythm maintained; no new arrhythmias. Median sternotomy wound clean. Anticoagulation commenced with low-dose warfarin (bioprosthesis). INR 1.8 — target 2.0–3.0. Cardiac physio daily.',  'Dr. Patel, Dr. Chen, Nurse Rodriguez', 'Nurse David Chen'),
  (27, 'Chioma Eze',         'ICU Ward B', '1988-01-30', '2026-06-25', 'critical',  'Bacterial meningitis (Neisseria meningitidis group B confirmed on CSF PCR). GCS 9 on admission — intubated for airway protection. Ceftriaxone and dexamethasone commenced within 30 min of presentation. CT head: diffuse cerebral oedema without herniation. Public health notified. Close contacts being traced.',  'Dr. Okafor, Dr. Singh, Nurse Liu', 'Dr. Sarah Mitchell'),
  (28, 'Roberto Silva',      'ICU Ward B', '1961-03-14', '2026-06-20', 'improving', 'Diabetic foot infection (left heel) with necrotising fasciitis requiring emergency wide debridement. Poorly controlled T2DM (HbA1c 11.8%). IV meropenem and vancomycin (MRSA cover — swab pending). Wound VAC in situ. Vascular surgery reviewed — limb salvageable. Blood glucose now controlled on insulin sliding scale.',  'Dr. Chen, Nurse Rodriguez', 'Dr. Sarah Mitchell');

-- ICU Ward C (add 6 more → total 10)
INSERT INTO patients (id, name, ward, date_of_birth, admission_date, condition, condition_notes, care_team, created_by) VALUES
  (29, 'Harriet Thornton',   'ICU Ward C', '1951-06-27', '2026-06-23', 'serious',   'Spontaneous intracerebral haemorrhage — left basal ganglia bleed (28mL on CT). GCS 11 on admission. BP aggressively managed (target systolic <140mmHg). Neurosurgery reviewed — no operative intervention as bleed not surgical. Anti-oedema measures with hypertonic saline. Neurology monitoring.',   'Dr. Okafor, Dr. Singh, Nurse Liu', 'Dr. Sarah Mitchell'),
  (30, 'Alexei Petrov',      'ICU Ward C', '1969-10-04', '2026-06-21', 'stable',    'Guillain-Barré syndrome (ascending weakness confirmed by nerve conduction studies and CSF analysis). FVC 2.1L — above ventilatory threshold. IVIG course commenced day 5. Upper limb grip strength improving. DVT prophylaxis with enoxaparin. Regular FVC monitoring twice daily.',              'Dr. Singh, Nurse Liu',           'Nurse David Chen'),
  (31, 'Fatou Diallo',       'ICU Ward C', '1993-08-12', '2026-06-24', 'improving', 'Postpartum eclampsia (delivered at 34 weeks via emergency LSCS at external hospital, transferred to adult ICU). MgSO4 infusion 24-hour course completed. BP controlled on labetalol. Headaches resolving. LFTs normalising. Baby in SCBU — mother updated daily. Transfer to obstetric HDU planned.',    'Dr. Singh, Dr. Okafor, Nurse Liu','Dr. Sarah Mitchell'),
  (32, 'Owen Brady',         'ICU Ward C', '1998-02-19', '2026-06-22', 'critical',  'Anoxic brain injury following near-drowning in swimming pool (submersion estimated 6–8 min). Resuscitated at scene. Ventilated, deeply sedated. GCS 3T throughout. CT head: diffuse hypoxic-ischaemic change, loss of grey-white differentiation. EEG shows burst suppression. Family meeting: prognosis very poor.',  'Dr. Okafor, Dr. Singh, Nurse Liu', 'Dr. Sarah Mitchell'),
  (33, 'Ai Nakashima',       'ICU Ward C', '1977-04-29', '2026-06-20', 'stable',    'Myasthenic crisis with bulbar involvement requiring intubation and ventilation. Anti-AChR antibodies markedly elevated. Plasmapheresis course ×5 completed. Extubated successfully day 5. Tolerating oral diet with supervision. Commenced long-term pyridostigmine. Neurology handover planned.',   'Dr. Singh, Nurse Liu',           'Nurse David Chen'),
  (34, 'Beatrice Nakamura',  'ICU Ward C', '1960-11-22', '2026-06-23', 'improving', 'Acute subdural haematoma (right-sided, 9mm thickness) following fall from height. Burr hole drainage performed — 30mL drained intra-operatively. Post-operative GCS improved from 10 to 14. Neuro obs stable. Repeat CT at 24h: haematoma resolving. Antiepileptic prophylaxis with levetiracetam.',     'Dr. Okafor, Nurse Liu',          'Dr. Sarah Mitchell');

-- HDU (add 6 more → total 10)
INSERT INTO patients (id, name, ward, date_of_birth, admission_date, condition, condition_notes, care_team, created_by) VALUES
  (35, 'Gerald Hughes',      'HDU',        '1948-03-30', '2026-06-25', 'stable',    'Post-total hip replacement (elective, Day 1). Recovering well. Mobilising with zimmer frame — walked 15m with physiotherapy. Oral analgesia adequate (paracetamol + ibuprofen + PRN tramadol). Wound drain removed. DVT prophylaxis with enoxaparin. Discharge home with community physio follow-up planned.',  'Dr. Mitchell, Nurse Chen',      'Nurse David Chen'),
  (36, 'Ayasha Begum',       'HDU',        '1971-06-14', '2026-06-23', 'improving', 'Severe community-acquired pneumonia (CURB-65 score 4). S. pneumoniae on urinary antigen test. Oxygen requirements improving — now on 2L nasal cannula (was 10L face mask on admission). IV amoxicillin + clarithromycin day 3, stepping to oral today. CRP falling: 380 → 124 mg/L.',                    'Dr. Mitchell, Nurse Chen',      'Dr. Sarah Mitchell'),
  (37, 'Thomas Keane',       'HDU',        '1953-09-17', '2026-06-25', 'stable',    'Iatrogenic sigmoid perforation complicating diagnostic colonoscopy. Emergency laparoscopic repair (primary closure) completed without conversion to open. Peritoneum lavaged. Post-operative observations stable. On IV co-amoxiclav. NG tube removed — sipping fluids. Surgical review: progressing well.',   'Dr. Mitchell, Nurse Chen',      'Nurse David Chen'),
  (38, 'Renata Kowalczyk',   'HDU',        '1964-05-08', '2026-06-24', 'stable',    'Urosepsis secondary to acute pyelonephritis (E. coli ESBL). Catheterised on admission — turbid urine. Blood cultures: E. coli (carbapenem-sensitive). Meropenem commenced. Temperature settling, inflammatory markers trending down. CT abdomen/pelvis: no abscess or obstruction. Oral to follow.',        'Dr. Mitchell, Nurse Chen',      'Dr. Sarah Mitchell'),
  (39, 'Samuel Okonkwo',     'HDU',        '1985-12-01', '2026-06-24', 'improving', 'Severe acute asthma exacerbation (near-fatal: initial PEF <30% predicted). IV salbutamol and IV hydrocortisone Day 2. Magnesium sulphate given on admission. No intubation required. PEF now 65% predicted. Heliox trial initiated. Chest physiotherapy. Respiratory team reviewing for step-down.',         'Dr. Mitchell, Nurse Chen',      'Nurse David Chen'),
  (40, 'Claire Bouchard',    'HDU',        '1969-08-25', '2026-06-23', 'improving', 'Hyperosmolar hyperglycaemic state (HHS) — blood glucose 48 mmol/L on admission, osmolality 348 mOsm/kg. Undiagnosed T2DM (HbA1c 13.2%). Fluid resuscitation: 6L over first 24 hours. Glucose now 14 mmol/L. Insulin infusion transitioning to subcutaneous regimen. Diabetes specialist nurse arranged.', 'Dr. Mitchell, Nurse Chen', 'Dr. Sarah Mitchell');

SELECT setval('patients_id_seq', 40);

-- ============================================================
-- BOOKINGS  (38 bookings across all patients — past/today/future)
-- ============================================================
INSERT INTO bookings (id, user_id, visitor_name, visitor_email, visit_date, visit_time, duration_minutes, patient_name, ward, notes, status, rejection_reason, requested_at, reviewed_at, reviewed_by) VALUES

  -- ── Margaret Wilson (ICU Ward A) ──────────────────────────
  (1,  2,  'James Wilson',    'visitor@hospitime.demo',      '2026-06-14', '10:00', 60, 'Margaret Wilson', 'ICU Ward A', 'Relationship: Spouse / Partner|Visitors: 1', 'approved', NULL,                                                        '2026-06-13T20:00:00.000Z', '2026-06-13T22:00:00.000Z', 'Dr. Sarah Mitchell'),
  (2,  2,  'James Wilson',    'visitor@hospitime.demo',      '2026-06-17', '10:00', 60, 'Margaret Wilson', 'ICU Ward A', 'Relationship: Spouse / Partner|Visitors: 1', 'approved', NULL,                                                        '2026-06-16T09:00:00.000Z', '2026-06-16T10:00:00.000Z', 'Nurse David Chen'),
  (3,  69, 'Sarah Thompson',  'familymember@hospitime.demo', '2026-06-20', '14:00', 30, 'Margaret Wilson', 'ICU Ward A', 'Relationship: Child / Step-child|Visitors: 1','approved', NULL,                                                       '2026-06-19T18:00:00.000Z', '2026-06-19T19:00:00.000Z', 'Dr. Sarah Mitchell'),
  (4,  2,  'James Wilson',    'visitor@hospitime.demo',      '2026-06-22', '10:00', 60, 'Margaret Wilson', 'ICU Ward A', 'Relationship: Spouse / Partner|Visitors: 2', 'approved', NULL,                                                        '2026-06-21T08:00:00.000Z', '2026-06-21T09:00:00.000Z', 'Dr. Sarah Mitchell'),
  (5,  2,  'James Wilson',    'visitor@hospitime.demo',      '2026-06-25', '10:00', 60, 'Margaret Wilson', 'ICU Ward A', 'Relationship: Spouse / Partner|Visitors: 1', 'approved', NULL,                                                        '2026-06-24T08:00:00.000Z', '2026-06-24T09:00:00.000Z', 'Nurse David Chen'),
  (6,  69, 'Sarah Thompson',  'familymember@hospitime.demo', '2026-06-27', '14:00', 30, 'Margaret Wilson', 'ICU Ward A', 'Relationship: Child / Step-child|Visitors: 1','pending',  NULL,                                                       '2026-06-25T07:00:00.000Z', NULL, NULL),
  (7,  2,  'James Wilson',    'visitor@hospitime.demo',      '2026-06-29', '10:00', 60, 'Margaret Wilson', 'ICU Ward A', 'Relationship: Spouse / Partner|Visitors: 1', 'pending',  NULL,                                                        '2026-06-25T07:30:00.000Z', NULL, NULL),
  (8,  2,  'James Wilson',    'visitor@hospitime.demo',      '2026-06-13', '09:00', 30, 'Margaret Wilson', 'ICU Ward A', 'Relationship: Spouse / Partner|Visitors: 1', 'rejected', 'Ward was closed for deep cleaning that morning.',            '2026-06-12T21:00:00.000Z', '2026-06-12T22:00:00.000Z', 'Dr. Sarah Mitchell'),

  -- ── Robert Clarke (ICU Ward B) ────────────────────────────
  (9,  4,  'Emily Clarke',    'emily.clarke@email.com',      '2026-06-19', '11:00', 60, 'Robert Clarke',   'ICU Ward B', 'Relationship: Child / Step-child|Visitors: 1','approved', NULL,                                                       '2026-06-18T20:00:00.000Z', '2026-06-18T21:00:00.000Z', 'Nurse David Chen'),
  (10, 5,  'Tom Clarke',      't.clarke@email.com',          '2026-06-21', '14:00', 30, 'Robert Clarke',   'ICU Ward B', 'Relationship: Child / Step-child|Visitors: 1','approved', NULL,                                                       '2026-06-20T09:00:00.000Z', '2026-06-20T10:00:00.000Z', 'Dr. Sarah Mitchell'),
  (11, 4,  'Emily Clarke',    'emily.clarke@email.com',      '2026-06-23', '11:00', 60, 'Robert Clarke',   'ICU Ward B', 'Relationship: Child / Step-child|Visitors: 2','approved', NULL,                                                       '2026-06-22T08:00:00.000Z', '2026-06-22T09:00:00.000Z', 'Dr. Sarah Mitchell'),
  (12, 5,  'Tom Clarke',      't.clarke@email.com',          '2026-06-25', '13:00', 30, 'Robert Clarke',   'ICU Ward B', 'Relationship: Child / Step-child|Visitors: 1','approved', NULL,                                                       '2026-06-24T10:00:00.000Z', '2026-06-24T11:00:00.000Z', 'Nurse David Chen'),
  (13, 4,  'Emily Clarke',    'emily.clarke@email.com',      '2026-06-27', '11:00', 60, 'Robert Clarke',   'ICU Ward B', 'Relationship: Child / Step-child|Visitors: 1','pending',  NULL,                                                       '2026-06-25T08:00:00.000Z', NULL, NULL),
  (14, 5,  'Tom Clarke',      't.clarke@email.com',          '2026-06-28', '14:00', 30, 'Robert Clarke',   'ICU Ward B', 'Relationship: Child / Step-child|Visitors: 1','pending',  NULL,                                                       '2026-06-25T08:30:00.000Z', NULL, NULL),
  (15, 5,  'Tom Clarke',      't.clarke@email.com',          '2026-06-19', '09:00', 30, 'Robert Clarke',   'ICU Ward B', 'Relationship: Child / Step-child|Visitors: 1','rejected', 'Patient was in theatre and unable to receive visitors.',  '2026-06-18T18:00:00.000Z', '2026-06-18T20:00:00.000Z', 'Nurse David Chen'),

  -- ── Audrey Patel (ICU Ward C — critical, limited visits) ──
  (16, 6,  'Raj Patel',       'raj.patel@email.com',         '2026-06-22', '13:00', 30, 'Audrey Patel',    'ICU Ward C', 'Relationship: Spouse / Partner|Visitors: 1', 'approved', NULL,                                                        '2026-06-21T20:00:00.000Z', '2026-06-21T21:00:00.000Z', 'Dr. Sarah Mitchell'),
  (17, 6,  'Raj Patel',       'raj.patel@email.com',         '2026-06-24', '13:00', 30, 'Audrey Patel',    'ICU Ward C', 'Relationship: Spouse / Partner|Visitors: 1', 'approved', NULL,                                                        '2026-06-23T19:00:00.000Z', '2026-06-23T20:00:00.000Z', 'Nurse David Chen'),
  (18, 6,  'Raj Patel',       'raj.patel@email.com',         '2026-06-26', '13:00', 30, 'Audrey Patel',    'ICU Ward C', 'Relationship: Spouse / Partner|Visitors: 1', 'pending',  NULL,                                                        '2026-06-25T07:00:00.000Z', NULL, NULL),
  (19, 6,  'Raj Patel',       'raj.patel@email.com',         '2026-06-28', '13:00', 30, 'Audrey Patel',    'ICU Ward C', 'Relationship: Spouse / Partner|Visitors: 1', 'pending',  NULL,                                                        '2026-06-25T07:05:00.000Z', NULL, NULL),

  -- ── Frank Huang (HDU — improving) ─────────────────────────
  (20, 7,  'Grace Huang',     'grace.huang@email.com',       '2026-06-23', '10:00', 60, 'Frank Huang',     'HDU',        'Relationship: Spouse / Partner|Visitors: 2', 'approved', NULL,                                                        '2026-06-22T18:00:00.000Z', '2026-06-22T19:00:00.000Z', 'Nurse David Chen'),
  (21, 7,  'Grace Huang',     'grace.huang@email.com',       '2026-06-25', '11:00', 60, 'Frank Huang',     'HDU',        'Relationship: Spouse / Partner|Visitors: 1', 'approved', NULL,                                                        '2026-06-24T08:00:00.000Z', '2026-06-24T09:00:00.000Z', 'Dr. Sarah Mitchell'),
  (22, 5,  'Tom Clarke',      't.clarke@email.com',          '2026-06-27', '10:30', 60, 'Frank Huang',     'HDU',        'Relationship: Friend|Visitors: 2',           'pending',  NULL,                                                        '2026-06-25T09:00:00.000Z', NULL, NULL),

  -- ── Dorothy Kowalski (ICU Ward A — serious sepsis) ────────
  (23, 8,  'Josef Kowalski',  'j.kowalski@email.com',        '2026-06-21', '09:30', 30, 'Dorothy Kowalski','ICU Ward A', 'Relationship: Spouse / Partner|Visitors: 1', 'approved', NULL,                                                        '2026-06-20T19:00:00.000Z', '2026-06-20T20:00:00.000Z', 'Dr. Sarah Mitchell'),
  (24, 8,  'Josef Kowalski',  'j.kowalski@email.com',        '2026-06-23', '09:30', 30, 'Dorothy Kowalski','ICU Ward A', 'Relationship: Spouse / Partner|Visitors: 1', 'approved', NULL,                                                        '2026-06-22T18:00:00.000Z', '2026-06-22T19:00:00.000Z', 'Nurse David Chen'),
  (25, 8,  'Josef Kowalski',  'j.kowalski@email.com',        '2026-06-25', '09:30', 30, 'Dorothy Kowalski','ICU Ward A', 'Relationship: Spouse / Partner|Visitors: 1', 'approved', NULL,                                                        '2026-06-24T20:00:00.000Z', '2026-06-24T21:00:00.000Z', 'Dr. Sarah Mitchell'),
  (26, 8,  'Josef Kowalski',  'j.kowalski@email.com',        '2026-06-27', '09:30', 30, 'Dorothy Kowalski','ICU Ward A', 'Relationship: Spouse / Partner|Visitors: 1', 'pending',  NULL,                                                        '2026-06-25T07:00:00.000Z', NULL, NULL),
  (27, 8,  'Josef Kowalski',  'j.kowalski@email.com',        '2026-06-20', '08:00', 30, 'Dorothy Kowalski','ICU Ward A', 'Relationship: Spouse / Partner|Visitors: 1', 'rejected', 'Patient was haemodynamically unstable and unable to receive visitors at this time.', '2026-06-19T22:00:00.000Z', '2026-06-19T23:00:00.000Z', 'Dr. Sarah Mitchell'),

  -- ── Thomas Osei (ICU Ward B — stable) ─────────────────────
  (28, 10, 'Yemi Osei',       'y.osei@email.com',            '2026-06-24', '14:00', 60, 'Thomas Osei',     'ICU Ward B', 'Relationship: Sibling|Visitors: 2',          'approved', NULL,                                                        '2026-06-23T18:00:00.000Z', '2026-06-23T19:00:00.000Z', 'Nurse David Chen'),
  (29, 10, 'Yemi Osei',       'y.osei@email.com',            '2026-06-25', '13:00', 60, 'Thomas Osei',     'ICU Ward B', 'Relationship: Sibling|Visitors: 1',          'approved', NULL,                                                        '2026-06-24T18:00:00.000Z', '2026-06-24T19:00:00.000Z', 'Dr. Sarah Mitchell'),
  (30, 10, 'Yemi Osei',       'y.osei@email.com',            '2026-06-28', '13:00', 60, 'Thomas Osei',     'ICU Ward B', 'Relationship: Sibling|Visitors: 2',          'pending',  NULL,                                                        '2026-06-25T09:00:00.000Z', NULL, NULL),

  -- ── Patricia Murray (ICU Ward C — critical ARDS) ──────────
  (31, 9,  'Angela Murray',   'a.murray@email.com',          '2026-06-22', '13:00', 30, 'Patricia Murray', 'ICU Ward C', 'Relationship: Spouse / Partner|Visitors: 1', 'approved', NULL,                                                        '2026-06-21T19:00:00.000Z', '2026-06-21T20:00:00.000Z', 'Dr. Sarah Mitchell'),
  (32, 9,  'Angela Murray',   'a.murray@email.com',          '2026-06-24', '13:00', 30, 'Patricia Murray', 'ICU Ward C', 'Relationship: Spouse / Partner|Visitors: 1', 'approved', NULL,                                                        '2026-06-23T18:00:00.000Z', '2026-06-23T19:00:00.000Z', 'Nurse David Chen'),
  (33, 9,  'Angela Murray',   'a.murray@email.com',          '2026-06-28', '13:00', 30, 'Patricia Murray', 'ICU Ward C', 'Relationship: Spouse / Partner|Visitors: 1', 'pending',  NULL,                                                        '2026-06-25T07:00:00.000Z', NULL, NULL),

  -- ── Henry Blackwell (HDU — COPD) ──────────────────────────
  (34, 13, 'Colin Blackwell', 'c.blackwell@email.com',       '2026-06-24', '15:00', 60, 'Henry Blackwell', 'HDU',        'Relationship: Child / Step-child|Visitors: 2','approved', NULL,                                                       '2026-06-24T10:00:00.000Z', '2026-06-24T11:00:00.000Z', 'Nurse David Chen'),
  (35, 13, 'Colin Blackwell', 'c.blackwell@email.com',       '2026-06-25', '10:00', 60, 'Henry Blackwell', 'HDU',        'Relationship: Child / Step-child|Visitors: 1','approved', NULL,                                                       '2026-06-24T18:00:00.000Z', '2026-06-24T19:00:00.000Z', 'Dr. Sarah Mitchell'),
  (36, 13, 'Colin Blackwell', 'c.blackwell@email.com',       '2026-06-27', '10:00', 60, 'Henry Blackwell', 'HDU',        'Relationship: Child / Step-child|Visitors: 2','pending',  NULL,                                                       '2026-06-25T08:00:00.000Z', NULL, NULL),

  -- ── Mei-Ling Chen (ICU Ward A — improving DKA) ────────────
  (37, 11, 'Lily Chen',       'lily.chen@email.com',         '2026-06-19', '09:00', 30, 'Mei-Ling Chen',   'ICU Ward A', 'Relationship: Child / Step-child|Visitors: 1','approved', NULL,                                                       '2026-06-18T20:00:00.000Z', '2026-06-18T21:00:00.000Z', 'Dr. Sarah Mitchell'),
  (38, 11, 'Lily Chen',       'lily.chen@email.com',         '2026-06-21', '10:00', 60, 'Mei-Ling Chen',   'ICU Ward A', 'Relationship: Child / Step-child|Visitors: 2','approved', NULL,                                                       '2026-06-20T08:00:00.000Z', '2026-06-20T09:00:00.000Z', 'Nurse David Chen'),
  (39, 11, 'Lily Chen',       'lily.chen@email.com',         '2026-06-23', '10:00', 60, 'Mei-Ling Chen',   'ICU Ward A', 'Relationship: Child / Step-child|Visitors: 1','approved', NULL,                                                       '2026-06-22T08:00:00.000Z', '2026-06-22T09:00:00.000Z', 'Dr. Sarah Mitchell'),
  (40, 11, 'Lily Chen',       'lily.chen@email.com',         '2026-06-25', '09:00', 60, 'Mei-Ling Chen',   'ICU Ward A', 'Relationship: Child / Step-child|Visitors: 1','approved', NULL,                                                       '2026-06-24T08:00:00.000Z', '2026-06-24T09:00:00.000Z', 'Nurse David Chen'),
  (41, 11, 'Lily Chen',       'lily.chen@email.com',         '2026-06-27', '10:00', 60, 'Mei-Ling Chen',   'ICU Ward A', 'Relationship: Child / Step-child|Visitors: 1','pending',  NULL,                                                       '2026-06-25T08:00:00.000Z', NULL, NULL),

  -- ── James O'Brien (ICU Ward B — admitted today) ───────────
  (42, 12, 'Brenda O''Brien', 'b.obrien@email.com',          '2026-06-25', '17:00', 30, 'James O''Brien',  'ICU Ward B', 'Relationship: Spouse / Partner|Visitors: 1', 'pending',  NULL,                                                        '2026-06-25T09:00:00.000Z', NULL, NULL),
  (43, 12, 'Brenda O''Brien', 'b.obrien@email.com',          '2026-06-26', '10:00', 30, 'James O''Brien',  'ICU Ward B', 'Relationship: Spouse / Partner|Visitors: 1', 'pending',  NULL,                                                        '2026-06-25T09:05:00.000Z', NULL, NULL),

  -- ================================================================
  -- TODAY'S APPROVED BOOKINGS (2026-06-26) — populates ward schedule
  -- ================================================================

  -- ── ICU Ward A ───────────────────────────────────────────────────
  -- Margaret Wilson
  (44,  2,  'James Wilson',       'visitor@hospitime.demo',      '2026-06-26', '10:00', 60, 'Margaret Wilson',   'ICU Ward A', '[Rel: Spouse / Partner | Visitors: 1]',           'approved', NULL, '2026-06-25T18:00:00.000Z', '2026-06-25T19:00:00.000Z', 'Dr. Sarah Mitchell'),
  -- Dorothy Kowalski
  (45,  8,  'Josef Kowalski',     'j.kowalski@email.com',        '2026-06-26', '11:30', 45, 'Dorothy Kowalski',  'ICU Ward A', '[Rel: Spouse / Partner | Visitors: 2]',           'approved', NULL, '2026-06-25T18:30:00.000Z', '2026-06-25T19:30:00.000Z', 'Nurse David Chen'),
  -- Mei-Ling Chen
  (46, 11,  'Lily Chen',          'lily.chen@email.com',         '2026-06-26', '15:00', 30, 'Mei-Ling Chen',     'ICU Ward A', '[Rel: Child / Step-child | Visitors: 1]',         'approved', NULL, '2026-06-25T08:00:00.000Z', '2026-06-25T09:00:00.000Z', 'Dr. Sarah Mitchell'),
  -- Bernard Walsh
  (47, 14,  'Kevin Walsh',        'k.walsh@email.com',           '2026-06-26', '13:00', 60, 'Bernard Walsh',     'ICU Ward A', '[Rel: Child / Step-child | Visitors: 2]',         'approved', NULL, '2026-06-25T10:00:00.000Z', '2026-06-25T11:00:00.000Z', 'Nurse David Chen'),
  -- Fatima Al-Rashid
  (48, 15,  'Salma Al-Rashid',    'salma.alrashid@email.com',    '2026-06-26', '14:30', 30, 'Fatima Al-Rashid',  'ICU Ward A', '[Rel: Spouse / Partner | Visitors: 1]',           'approved', NULL, '2026-06-25T11:00:00.000Z', '2026-06-25T12:00:00.000Z', 'Dr. Sarah Mitchell'),

  -- ── ICU Ward B ───────────────────────────────────────────────────
  -- Robert Clarke
  (49,  4,  'Emily Clarke',       'emily.clarke@email.com',      '2026-06-26', '09:30', 45, 'Robert Clarke',     'ICU Ward B', '[Rel: Child / Step-child | Visitors: 1]',         'approved', NULL, '2026-06-25T07:00:00.000Z', '2026-06-25T08:00:00.000Z', 'Nurse David Chen'),
  -- Thomas Osei (already has pending booking 30, approve a separate one)
  (50, 10,  'Yemi Osei',          'y.osei@email.com',            '2026-06-26', '13:00', 60, 'Thomas Osei',       'ICU Ward B', '[Rel: Sibling | Visitors: 2]',                    'approved', NULL, '2026-06-25T09:00:00.000Z', '2026-06-25T10:00:00.000Z', 'Dr. Sarah Mitchell'),
  -- Nkechi Adeyemi
  (51, 16,  'Chidi Adeyemi',      'chidi.adeyemi@email.com',     '2026-06-26', '11:00', 60, 'Nkechi Adeyemi',    'ICU Ward B', '[Rel: Sibling | Visitors: 1]',                    'approved', NULL, '2026-06-25T07:30:00.000Z', '2026-06-25T08:30:00.000Z', 'Nurse David Chen'),
  -- Viktor Novak
  (52, 17,  'Jana Novak',         'jana.novak@email.com',        '2026-06-26', '16:00', 30, 'Viktor Novak',      'ICU Ward B', '[Rel: Spouse / Partner | Visitors: 1]',           'approved', NULL, '2026-06-25T12:00:00.000Z', '2026-06-25T13:00:00.000Z', 'Dr. Sarah Mitchell'),
  -- James O'Brien
  (53, 12,  'Brenda O''Brien',    'b.obrien@email.com',          '2026-06-26', '14:30', 30, 'James O''Brien',    'ICU Ward B', '[Rel: Spouse / Partner | Visitors: 1]',           'approved', NULL, '2026-06-25T09:05:00.000Z', '2026-06-25T09:30:00.000Z', 'Dr. Sarah Mitchell'),

  -- ── ICU Ward C ───────────────────────────────────────────────────
  -- Audrey Patel
  (54,  6,  'Raj Patel',          'raj.patel@email.com',         '2026-06-26', '10:00', 30, 'Audrey Patel',      'ICU Ward C', '[Rel: Spouse / Partner | Visitors: 1]',           'approved', NULL, '2026-06-25T08:00:00.000Z', '2026-06-25T09:00:00.000Z', 'Dr. Sarah Mitchell'),
  -- Patricia Murray
  (55,  9,  'Angela Murray',      'a.murray@email.com',          '2026-06-26', '13:00', 30, 'Patricia Murray',   'ICU Ward C', '[Rel: Spouse / Partner | Visitors: 1]',           'approved', NULL, '2026-06-25T07:00:00.000Z', '2026-06-25T08:00:00.000Z', 'Nurse David Chen'),
  -- Saoirse Brennan
  (56, 18,  'Cian Brennan',       'cian.brennan@email.com',      '2026-06-26', '11:30', 45, 'Saoirse Brennan',   'ICU Ward C', '[Rel: Child / Step-child | Visitors: 2]',         'approved', NULL, '2026-06-25T09:00:00.000Z', '2026-06-25T10:00:00.000Z', 'Dr. Sarah Mitchell'),
  -- Hassan Ibrahim
  (57, 19,  'Layla Ibrahim',      'layla.ibrahim@email.com',     '2026-06-26', '15:30', 60, 'Hassan Ibrahim',    'ICU Ward C', '[Rel: Child / Step-child | Visitors: 1]',         'approved', NULL, '2026-06-25T08:00:00.000Z', '2026-06-25T09:00:00.000Z', 'Nurse David Chen'),

  -- ── HDU ──────────────────────────────────────────────────────────
  -- Frank Huang
  (58,  7,  'Grace Huang',        'grace.huang@email.com',       '2026-06-26', '10:00', 60, 'Frank Huang',       'HDU',        '[Rel: Child / Step-child | Visitors: 2]',         'approved', NULL, '2026-06-25T08:00:00.000Z', '2026-06-25T09:00:00.000Z', 'Dr. Sarah Mitchell'),
  -- Henry Blackwell
  (59, 13,  'Colin Blackwell',    'c.blackwell@email.com',       '2026-06-26', '14:00', 30, 'Henry Blackwell',   'HDU',        '[Rel: Child / Step-child | Visitors: 1]',         'approved', NULL, '2026-06-25T10:00:00.000Z', '2026-06-25T11:00:00.000Z', 'Nurse David Chen'),
  -- Eleanor Fitzgerald
  (60, 20,  'Patrick Fitzgerald', 'p.fitzgerald@email.com',      '2026-06-26', '11:00', 45, 'Eleanor Fitzgerald','HDU',        '[Rel: Spouse / Partner | Visitors: 1]',           'approved', NULL, '2026-06-26T06:30:00.000Z', '2026-06-26T07:00:00.000Z', 'Dr. Sarah Mitchell'),
  -- Marcus Thompson
  (61, 21,  'Diana Thompson',     'diana.thompson@email.com',    '2026-06-26', '16:00', 30, 'Marcus Thompson',   'HDU',        '[Rel: Spouse / Partner | Visitors: 1]',           'approved', NULL, '2026-06-25T09:00:00.000Z', '2026-06-25T10:00:00.000Z', 'Nurse David Chen'),

  -- ================================================================
  -- FUTURE BOOKINGS — new patients
  -- ================================================================
  -- Bernard Walsh
  (62, 14,  'Kevin Walsh',        'k.walsh@email.com',           '2026-06-28', '13:00', 60, 'Bernard Walsh',     'ICU Ward A', '[Rel: Child / Step-child | Visitors: 2]',         'approved', NULL, '2026-06-26T08:00:00.000Z', '2026-06-26T09:00:00.000Z', 'Dr. Sarah Mitchell'),
  (63, 14,  'Kevin Walsh',        'k.walsh@email.com',           '2026-07-01', '13:00', 60, 'Bernard Walsh',     'ICU Ward A', '[Rel: Child / Step-child | Visitors: 2]',         'pending',  NULL, '2026-06-26T08:05:00.000Z', NULL, NULL),
  -- Fatima Al-Rashid
  (64, 15,  'Salma Al-Rashid',    'salma.alrashid@email.com',    '2026-06-28', '14:30', 30, 'Fatima Al-Rashid',  'ICU Ward A', '[Rel: Spouse / Partner | Visitors: 1]',           'approved', NULL, '2026-06-26T08:00:00.000Z', '2026-06-26T09:00:00.000Z', 'Nurse David Chen'),
  (65, 15,  'Salma Al-Rashid',    'salma.alrashid@email.com',    '2026-06-30', '14:30', 30, 'Fatima Al-Rashid',  'ICU Ward A', '[Rel: Spouse / Partner | Visitors: 1]',           'pending',  NULL, '2026-06-26T08:05:00.000Z', NULL, NULL),
  -- Nkechi Adeyemi
  (66, 16,  'Chidi Adeyemi',      'chidi.adeyemi@email.com',     '2026-06-28', '11:00', 60, 'Nkechi Adeyemi',    'ICU Ward B', '[Rel: Sibling | Visitors: 1]',                    'approved', NULL, '2026-06-26T07:00:00.000Z', '2026-06-26T08:00:00.000Z', 'Dr. Sarah Mitchell'),
  (67, 16,  'Chidi Adeyemi',      'chidi.adeyemi@email.com',     '2026-07-01', '11:00', 60, 'Nkechi Adeyemi',    'ICU Ward B', '[Rel: Sibling | Visitors: 1]',                    'pending',  NULL, '2026-06-26T07:05:00.000Z', NULL, NULL),
  -- Viktor Novak
  (68, 17,  'Jana Novak',         'jana.novak@email.com',        '2026-06-27', '16:00', 30, 'Viktor Novak',      'ICU Ward B', '[Rel: Spouse / Partner | Visitors: 1]',           'pending',  NULL, '2026-06-26T08:00:00.000Z', NULL, NULL),
  -- Saoirse Brennan
  (69, 18,  'Cian Brennan',       'cian.brennan@email.com',      '2026-06-28', '11:30', 45, 'Saoirse Brennan',   'ICU Ward C', '[Rel: Child / Step-child | Visitors: 2]',         'approved', NULL, '2026-06-26T08:00:00.000Z', '2026-06-26T09:00:00.000Z', 'Nurse David Chen'),
  (70, 18,  'Cian Brennan',       'cian.brennan@email.com',      '2026-07-01', '11:00', 45, 'Saoirse Brennan',   'ICU Ward C', '[Rel: Child / Step-child | Visitors: 2]',         'pending',  NULL, '2026-06-26T08:05:00.000Z', NULL, NULL),
  -- Hassan Ibrahim
  (71, 19,  'Layla Ibrahim',      'layla.ibrahim@email.com',     '2026-06-28', '15:30', 60, 'Hassan Ibrahim',    'ICU Ward C', '[Rel: Child / Step-child | Visitors: 1]',         'approved', NULL, '2026-06-26T07:00:00.000Z', '2026-06-26T08:00:00.000Z', 'Dr. Sarah Mitchell'),
  (72, 19,  'Layla Ibrahim',      'layla.ibrahim@email.com',     '2026-07-01', '15:00', 60, 'Hassan Ibrahim',    'ICU Ward C', '[Rel: Child / Step-child | Visitors: 1]',         'pending',  NULL, '2026-06-26T07:05:00.000Z', NULL, NULL),
  -- Eleanor Fitzgerald
  (73, 20,  'Patrick Fitzgerald', 'p.fitzgerald@email.com',      '2026-06-27', '11:00', 45, 'Eleanor Fitzgerald','HDU',        '[Rel: Spouse / Partner | Visitors: 2]',           'pending',  NULL, '2026-06-26T06:35:00.000Z', NULL, NULL),
  -- Marcus Thompson
  (74, 21,  'Diana Thompson',     'diana.thompson@email.com',    '2026-06-27', '16:00', 30, 'Marcus Thompson',   'HDU',        '[Rel: Spouse / Partner | Visitors: 1]',           'pending',  NULL, '2026-06-26T09:05:00.000Z', NULL, NULL),
  (75, 21,  'Diana Thompson',     'diana.thompson@email.com',    '2026-06-29', '16:00', 30, 'Marcus Thompson',   'HDU',        '[Rel: Spouse / Partner | Visitors: 1]',           'pending',  NULL, '2026-06-26T09:10:00.000Z', NULL, NULL);

-- ================================================================
-- TODAY'S APPROVED BOOKINGS for patients 19–40 (2026-06-26)
-- ================================================================
INSERT INTO bookings (id, user_id, visitor_name, visitor_email, visit_date, visit_time, duration_minutes, patient_name, ward, notes, status, rejection_reason, requested_at, reviewed_at, reviewed_by) VALUES

  -- ICU Ward A: patients 19–23
  (76,  22, 'Clara Brennan',     'c.brennan@email.com',       '2026-06-26', '09:00', 30, 'Arthur Brennan',    'ICU Ward A', '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-25T19:00:00.000Z', '2026-06-25T20:00:00.000Z', 'Dr. Sarah Mitchell'),
  (77,  23, 'Deepa Sharma',      'deepa.sharma@email.com',    '2026-06-26', '11:00', 60, 'Priya Sharma',      'ICU Ward A', '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-25T19:30:00.000Z', '2026-06-25T20:00:00.000Z', 'Nurse David Chen'),
  (78,  24, 'Fiona McGrath',     'f.mcgrath@email.com',       '2026-06-26', '12:30', 45, 'Callum McGrath',    'ICU Ward A', '[Rel: Spouse / Partner | Visitors: 2]',  'approved', NULL, '2026-06-25T18:00:00.000Z', '2026-06-25T19:00:00.000Z', 'Dr. Sarah Mitchell'),
  (79,  25, 'Lars Svensson',     'lars.svensson@email.com',   '2026-06-26', '14:00', 30, 'Ingrid Svensson',   'ICU Ward A', '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-25T19:00:00.000Z', '2026-06-25T20:00:00.000Z', 'Nurse David Chen'),
  (80,  26, 'Aisha Al-Farsi',    'aisha.alfarsi@email.com',   '2026-06-26', '16:30', 30, 'Mohammed Al-Farsi', 'ICU Ward A', '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-25T20:00:00.000Z', '2026-06-25T21:00:00.000Z', 'Dr. Sarah Mitchell'),

  -- ICU Ward B: patients 24–28
  (81,  27, 'Hans Fischer',      'hans.fischer@email.com',    '2026-06-26', '09:00', 45, 'Lena Fischer',      'ICU Ward B', '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-25T18:00:00.000Z', '2026-06-25T19:00:00.000Z', 'Nurse David Chen'),
  (82,  28, 'Siobhan Murphy',    'siobhan.murphy@email.com',  '2026-06-26', '10:30', 30, 'Declan Murphy',     'ICU Ward B', '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-25T19:00:00.000Z', '2026-06-25T20:00:00.000Z', 'Dr. Sarah Mitchell'),
  (83,  29, 'Hiroshi Tanaka',    'h.tanaka@email.com',        '2026-06-26', '12:00', 60, 'Yuki Tanaka',       'ICU Ward B', '[Rel: Spouse / Partner | Visitors: 2]',  'approved', NULL, '2026-06-25T18:00:00.000Z', '2026-06-25T19:00:00.000Z', 'Nurse David Chen'),
  (84,  30, 'Emeka Eze',         'emeka.eze@email.com',       '2026-06-26', '15:00', 30, 'Chioma Eze',        'ICU Ward B', '[Rel: Parent | Visitors: 1]',             'approved', NULL, '2026-06-25T19:00:00.000Z', '2026-06-25T20:00:00.000Z', 'Dr. Sarah Mitchell'),
  (85,  31, 'Ana Silva',         'ana.silva@email.com',       '2026-06-26', '16:30', 30, 'Roberto Silva',     'ICU Ward B', '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-25T20:00:00.000Z', '2026-06-25T21:00:00.000Z', 'Nurse David Chen'),

  -- ICU Ward C: patients 29–34
  (86,  32, 'George Thornton',   'g.thornton@email.com',      '2026-06-26', '09:30', 30, 'Harriet Thornton',  'ICU Ward C', '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-25T19:00:00.000Z', '2026-06-25T20:00:00.000Z', 'Nurse David Chen'),
  (87,  33, 'Natasha Petrov',    'n.petrov@email.com',        '2026-06-26', '10:30', 60, 'Alexei Petrov',     'ICU Ward C', '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-25T18:00:00.000Z', '2026-06-25T19:00:00.000Z', 'Dr. Sarah Mitchell'),
  (88,  34, 'Ibrahim Diallo',    'ibrahim.diallo@email.com',  '2026-06-26', '12:00', 30, 'Fatou Diallo',      'ICU Ward C', '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-25T19:00:00.000Z', '2026-06-25T20:00:00.000Z', 'Nurse David Chen'),
  (89,  35, 'Sinead Brady',      'sinead.brady@email.com',    '2026-06-26', '13:30', 30, 'Owen Brady',        'ICU Ward C', '[Rel: Parent | Visitors: 2]',             'approved', NULL, '2026-06-25T19:00:00.000Z', '2026-06-25T20:00:00.000Z', 'Dr. Sarah Mitchell'),
  (90,  36, 'James Nakashima',   'j.nakashima@email.com',     '2026-06-26', '15:30', 45, 'Ai Nakashima',      'ICU Ward C', '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-25T18:00:00.000Z', '2026-06-25T19:00:00.000Z', 'Nurse David Chen'),
  (91,  37, 'Kenji Nakamura',    'k.nakamura@email.com',      '2026-06-26', '16:30', 30, 'Beatrice Nakamura', 'ICU Ward C', '[Rel: Child / Step-child | Visitors: 1]','approved', NULL, '2026-06-25T20:00:00.000Z', '2026-06-25T21:00:00.000Z', 'Dr. Sarah Mitchell'),

  -- HDU: patients 35–40
  (92,  38, 'Patricia Hughes',   'p.hughes@email.com',        '2026-06-26', '09:00', 60, 'Gerald Hughes',     'HDU',        '[Rel: Spouse / Partner | Visitors: 2]',  'approved', NULL, '2026-06-26T07:00:00.000Z', '2026-06-26T07:30:00.000Z', 'Nurse David Chen'),
  (93,  39, 'Tariq Begum',       't.begum@email.com',         '2026-06-26', '10:30', 30, 'Ayasha Begum',      'HDU',        '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-25T19:00:00.000Z', '2026-06-25T20:00:00.000Z', 'Dr. Sarah Mitchell'),
  (94,  40, 'Mary Keane',        'm.keane@email.com',         '2026-06-26', '12:00', 45, 'Thomas Keane',      'HDU',        '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-26T07:00:00.000Z', '2026-06-26T07:30:00.000Z', 'Nurse David Chen'),
  (95,  41, 'Andrzej Kowalczyk', 'a.kowalczyk@email.com',     '2026-06-26', '13:30', 30, 'Renata Kowalczyk',  'HDU',        '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-25T20:00:00.000Z', '2026-06-25T21:00:00.000Z', 'Dr. Sarah Mitchell'),
  (96,  42, 'Ngozi Okonkwo',     'ngozi.okonkwo@email.com',   '2026-06-26', '15:00', 45, 'Samuel Okonkwo',    'HDU',        '[Rel: Parent | Visitors: 1]',             'approved', NULL, '2026-06-25T19:00:00.000Z', '2026-06-25T20:00:00.000Z', 'Nurse David Chen'),
  (97,  43, 'Pierre Bouchard',   'p.bouchard@email.com',      '2026-06-26', '16:30', 30, 'Claire Bouchard',   'HDU',        '[Rel: Spouse / Partner | Visitors: 1]',  'approved', NULL, '2026-06-25T20:00:00.000Z', '2026-06-25T21:00:00.000Z', 'Dr. Sarah Mitchell');

SELECT setval('bookings_id_seq', 97);

-- ============================================================
-- VITALS  (realistic trends — ICU every 6h, HDU every 12h)
-- ============================================================
INSERT INTO vitals (patient_id, heart_rate, systolic_bp, diastolic_bp, oxygen_saturation, temperature, respiratory_rate, recorded_by, recorded_at) VALUES

  -- Patient 1: Margaret Wilson — stable cardiac, trending to normal
  (1, 94, 138, 88, 95, '37.2', 18, 'Nurse Martinez',  '2026-06-12T14:00:00.000Z'),
  (1, 90, 132, 85, 96, '37.0', 17, 'Nurse Martinez',  '2026-06-14T06:00:00.000Z'),
  (1, 86, 128, 83, 96, '36.9', 16, 'Nurse Martinez',  '2026-06-17T06:00:00.000Z'),
  (1, 82, 124, 80, 97, '36.9', 16, 'Nurse Martinez',  '2026-06-20T06:00:00.000Z'),
  (1, 78, 122, 78, 97, '36.8', 15, 'Nurse Martinez',  '2026-06-22T06:00:00.000Z'),
  (1, 76, 120, 76, 98, '36.8', 15, 'Nurse Martinez',  '2026-06-24T06:00:00.000Z'),
  (1, 74, 118, 76, 98, '36.7', 14, 'Nurse Martinez',  '2026-06-25T06:00:00.000Z'),

  -- Patient 2: Robert Clarke — serious post-op, slowly improving
  (2, 110, 154, 97, 92, '38.6', 23, 'Nurse Rodriguez', '2026-06-18T16:00:00.000Z'),
  (2, 106, 150, 95, 93, '38.5', 22, 'Nurse Rodriguez', '2026-06-19T06:00:00.000Z'),
  (2, 102, 148, 94, 93, '38.4', 21, 'Nurse Rodriguez', '2026-06-20T06:00:00.000Z'),
  (2, 99,  146, 92, 94, '38.3', 21, 'Nurse Rodriguez', '2026-06-21T06:00:00.000Z'),
  (2, 97,  144, 91, 94, '38.2', 20, 'Nurse Rodriguez', '2026-06-22T06:00:00.000Z'),
  (2, 95,  142, 90, 94, '38.1', 20, 'Nurse Rodriguez', '2026-06-23T06:00:00.000Z'),
  (2, 93,  140, 89, 95, '37.9', 19, 'Nurse Rodriguez', '2026-06-24T06:00:00.000Z'),
  (2, 91,  138, 88, 95, '37.8', 19, 'Nurse Rodriguez', '2026-06-25T06:00:00.000Z'),

  -- Patient 3: Audrey Patel — critical TBI, ventilated, static/worsening
  (3, 62, 92, 60, 87, '38.8', 12, 'Nurse Liu', '2026-06-20T12:00:00.000Z'),
  (3, 58, 88, 58, 86, '39.0', 11, 'Nurse Liu', '2026-06-21T06:00:00.000Z'),
  (3, 60, 90, 60, 87, '38.9', 12, 'Nurse Liu', '2026-06-22T06:00:00.000Z'),
  (3, 55, 86, 56, 85, '39.2', 11, 'Nurse Liu', '2026-06-23T06:00:00.000Z'),
  (3, 58, 88, 57, 86, '39.1', 12, 'Nurse Liu', '2026-06-24T06:00:00.000Z'),
  (3, 60, 90, 59, 87, '38.8', 12, 'Nurse Liu', '2026-06-25T06:00:00.000Z'),

  -- Patient 4: Frank Huang — improving HDU post-MI
  (4, 76, 138, 88, 96, '37.0', 16, 'Nurse Martinez', '2026-06-22T16:00:00.000Z'),
  (4, 73, 135, 86, 97, '36.9', 15, 'Nurse Martinez', '2026-06-23T08:00:00.000Z'),
  (4, 70, 132, 84, 97, '36.8', 15, 'Nurse Martinez', '2026-06-24T08:00:00.000Z'),
  (4, 68, 130, 82, 98, '36.7', 14, 'Nurse Martinez', '2026-06-25T08:00:00.000Z'),

  -- Patient 5: Dorothy Kowalski — severe sepsis, vasopressor weaning
  (5, 120, 96,  60, 88, '39.6', 29, 'Nurse Martinez', '2026-06-19T10:00:00.000Z'),
  (5, 116, 100, 62, 89, '39.4', 27, 'Nurse Martinez', '2026-06-20T06:00:00.000Z'),
  (5, 112, 104, 65, 90, '39.1', 26, 'Nurse Martinez', '2026-06-21T06:00:00.000Z'),
  (5, 108, 108, 67, 91, '38.9', 24, 'Nurse Martinez', '2026-06-22T06:00:00.000Z'),
  (5, 104, 112, 70, 92, '38.6', 23, 'Nurse Martinez', '2026-06-23T06:00:00.000Z'),
  (5, 100, 116, 72, 93, '38.3', 21, 'Nurse Martinez', '2026-06-24T06:00:00.000Z'),
  (5, 96,  119, 74, 94, '37.9', 20, 'Nurse Martinez', '2026-06-25T06:00:00.000Z'),

  -- Patient 6: Thomas Osei — stable post-op appendectomy
  (6, 90, 128, 82, 96, '37.6', 18, 'Nurse Rodriguez', '2026-06-23T14:00:00.000Z'),
  (6, 85, 125, 80, 97, '37.3', 17, 'Nurse Rodriguez', '2026-06-24T06:00:00.000Z'),
  (6, 80, 122, 78, 98, '37.0', 15, 'Nurse Rodriguez', '2026-06-25T06:00:00.000Z'),

  -- Patient 7: Patricia Murray — critical ARDS, deeply sedated
  (7, 120, 91, 57, 83, '39.3', 14, 'Nurse Liu', '2026-06-21T16:00:00.000Z'),
  (7, 118, 90, 56, 82, '39.6', 13, 'Nurse Liu', '2026-06-22T06:00:00.000Z'),
  (7, 122, 88, 55, 82, '39.8', 13, 'Nurse Liu', '2026-06-23T06:00:00.000Z'),
  (7, 116, 90, 57, 83, '39.5', 14, 'Nurse Liu', '2026-06-24T06:00:00.000Z'),
  (7, 112, 92, 58, 84, '39.2', 14, 'Nurse Liu', '2026-06-25T06:00:00.000Z'),

  -- Patient 8: Henry Blackwell — COPD exacerbation, improving
  (8, 94, 146, 91, 88, '37.3', 27, 'Nurse Chen',     '2026-06-24T15:00:00.000Z'),
  (8, 90, 143, 89, 90, '37.1', 25, 'Nurse Chen',     '2026-06-25T08:00:00.000Z'),

  -- Patient 9: Mei-Ling Chen — DKA resolving, normalising
  (9, 104, 124, 80, 96, '37.5', 24, 'Nurse Martinez', '2026-06-17T12:00:00.000Z'),
  (9, 100, 122, 78, 96, '37.3', 22, 'Nurse Martinez', '2026-06-18T06:00:00.000Z'),
  (9, 96,  120, 77, 97, '37.2', 20, 'Nurse Martinez', '2026-06-19T06:00:00.000Z'),
  (9, 91,  118, 76, 97, '37.0', 18, 'Nurse Martinez', '2026-06-21T06:00:00.000Z'),
  (9, 86,  116, 74, 98, '36.9', 16, 'Nurse Martinez', '2026-06-23T06:00:00.000Z'),
  (9, 80,  114, 72, 98, '36.8', 15, 'Nurse Martinez', '2026-06-25T06:00:00.000Z'),

  -- Patient 10: James O'Brien — post-cardiac arrest, therapeutic hypothermia
  (10, 54, 104, 66, 94, '36.0', 16, 'Nurse Liu', '2026-06-25T09:00:00.000Z'),
  (10, 58, 108, 70, 95, '36.2', 16, 'Nurse Liu', '2026-06-25T15:00:00.000Z'),

  -- Patient 11: Bernard Walsh — post-CABG, improving
  (11, 72, 118, 74, 97, '37.1', 16, 'Nurse Martinez', '2026-06-23T14:00:00.000Z'),
  (11, 68, 114, 72, 97, '37.0', 15, 'Nurse Martinez', '2026-06-24T08:00:00.000Z'),
  (11, 65, 112, 70, 98, '36.9', 15, 'Nurse Martinez', '2026-06-25T08:00:00.000Z'),
  (11, 64, 110, 70, 98, '36.8', 14, 'Nurse Martinez', '2026-06-26T08:00:00.000Z'),

  -- Patient 12: Fatima Al-Rashid — post-stroke, stable
  (12, 80, 142, 88, 96, '37.3', 18, 'Nurse Martinez', '2026-06-21T10:00:00.000Z'),
  (12, 76, 138, 86, 97, '37.1', 17, 'Nurse Martinez', '2026-06-22T10:00:00.000Z'),
  (12, 74, 136, 84, 97, '37.0', 16, 'Nurse Martinez', '2026-06-23T10:00:00.000Z'),
  (12, 72, 132, 82, 97, '37.0', 16, 'Nurse Martinez', '2026-06-25T10:00:00.000Z'),

  -- Patient 13: Nkechi Adeyemi — acute liver failure, serious
  (13, 102, 96, 58, 98, '38.2', 22, 'Nurse Rodriguez', '2026-06-24T08:00:00.000Z'),
  (13, 98,  98, 60, 98, '38.0', 21, 'Nurse Rodriguez', '2026-06-24T20:00:00.000Z'),
  (13, 94,  100, 62, 99, '37.8', 20, 'Nurse Rodriguez', '2026-06-25T08:00:00.000Z'),
  (13, 90,  104, 64, 99, '37.6', 19, 'Nurse Rodriguez', '2026-06-26T08:00:00.000Z'),

  -- Patient 14: Viktor Novak — MODS post-AAA, critical
  (14, 118, 82, 50, 90, '38.8', 28, 'Nurse Liu', '2026-06-22T06:00:00.000Z'),
  (14, 122, 78, 48, 89, '39.0', 30, 'Nurse Liu', '2026-06-22T18:00:00.000Z'),
  (14, 115, 84, 52, 91, '38.6', 28, 'Nurse Liu', '2026-06-23T06:00:00.000Z'),
  (14, 110, 88, 54, 92, '38.4', 26, 'Nurse Liu', '2026-06-25T06:00:00.000Z'),

  -- Patient 15: Saoirse Brennan — post-neurosurgery, improving
  (15, 68, 122, 76, 98, '37.0', 14, 'Nurse Liu', '2026-06-20T10:00:00.000Z'),
  (15, 66, 118, 74, 98, '36.9', 14, 'Nurse Liu', '2026-06-22T10:00:00.000Z'),
  (15, 64, 116, 72, 98, '36.8', 13, 'Nurse Liu', '2026-06-24T10:00:00.000Z'),
  (15, 63, 114, 72, 99, '36.8', 13, 'Nurse Liu', '2026-06-26T10:00:00.000Z'),

  -- Patient 16: Hassan Ibrahim — C5/C6 spinal injury, stable
  (16, 62, 118, 76, 99, '36.9', 13, 'Nurse Liu', '2026-06-23T10:00:00.000Z'),
  (16, 60, 116, 74, 99, '36.8', 12, 'Nurse Liu', '2026-06-24T10:00:00.000Z'),
  (16, 60, 114, 74, 99, '36.8', 12, 'Nurse Liu', '2026-06-26T10:00:00.000Z'),

  -- Patient 17: Eleanor Fitzgerald — post-cholecystectomy, improving
  (17, 74, 124, 78, 98, '37.2', 16, 'Nurse Chen', '2026-06-25T12:00:00.000Z'),
  (17, 70, 120, 76, 98, '37.0', 15, 'Nurse Chen', '2026-06-26T08:00:00.000Z'),

  -- Patient 18: Marcus Thompson — syncope monitoring, stable
  (18, 68, 108, 66, 99, '36.9', 14, 'Nurse Chen', '2026-06-24T10:00:00.000Z'),
  (18, 66, 106, 64, 99, '36.8', 13, 'Nurse Chen', '2026-06-25T10:00:00.000Z'),
  (18, 65, 106, 64, 99, '36.8', 13, 'Nurse Chen', '2026-06-26T10:00:00.000Z'),

  -- Patients 19–23 (ICU Ward A)
  (19, 108, 88, 54, 95, '38.6', 24, 'Nurse Martinez', '2026-06-25T08:00:00.000Z'),
  (19, 100, 92, 58, 96, '38.2', 22, 'Nurse Martinez', '2026-06-26T08:00:00.000Z'),
  (20,  88, 110, 68, 94, '37.1', 20, 'Nurse Martinez', '2026-06-24T10:00:00.000Z'),
  (20,  82, 108, 66, 95, '37.0', 18, 'Nurse Martinez', '2026-06-26T10:00:00.000Z'),
  (21,  76, 124, 78, 96, '37.2', 18, 'Nurse Martinez', '2026-06-23T14:00:00.000Z'),
  (21,  72, 120, 76, 97, '37.0', 16, 'Nurse Martinez', '2026-06-26T08:00:00.000Z'),
  (22, 116,  80, 50, 89, '39.1', 28, 'Nurse Martinez', '2026-06-22T08:00:00.000Z'),
  (22, 120,  76, 48, 88, '39.4', 30, 'Nurse Martinez', '2026-06-24T08:00:00.000Z'),
  (22, 112,  84, 52, 90, '38.9', 28, 'Nurse Martinez', '2026-06-26T08:00:00.000Z'),
  (23,  64, 112, 70, 97, '36.9', 14, 'Nurse Martinez', '2026-06-24T08:00:00.000Z'),
  (23,  62, 110, 70, 98, '36.8', 14, 'Nurse Martinez', '2026-06-26T08:00:00.000Z'),

  -- Patients 24–28 (ICU Ward B)
  (24,  78, 118, 74, 97, '37.4', 18, 'Nurse Rodriguez', '2026-06-24T10:00:00.000Z'),
  (24,  74, 114, 72, 97, '37.1', 16, 'Nurse Rodriguez', '2026-06-26T10:00:00.000Z'),
  (25, 104,  86, 52, 95, '38.8', 24, 'Nurse Rodriguez', '2026-06-23T08:00:00.000Z'),
  (25,  98,  90, 56, 96, '38.4', 22, 'Nurse Rodriguez', '2026-06-26T08:00:00.000Z'),
  (26,  68, 116, 72, 97, '37.0', 15, 'Nurse Rodriguez', '2026-06-23T08:00:00.000Z'),
  (26,  66, 114, 70, 98, '36.9', 14, 'Nurse Rodriguez', '2026-06-26T08:00:00.000Z'),
  (27, 112,  96, 60, 97, '38.6', 22, 'Nurse Liu', '2026-06-25T08:00:00.000Z'),
  (27, 104, 100, 62, 97, '38.2', 20, 'Nurse Liu', '2026-06-26T08:00:00.000Z'),
  (28,  84, 102, 64, 97, '37.8', 18, 'Nurse Rodriguez', '2026-06-22T08:00:00.000Z'),
  (28,  78,  106, 66, 98, '37.4', 16, 'Nurse Rodriguez', '2026-06-26T08:00:00.000Z'),

  -- Patients 29–34 (ICU Ward C)
  (29,  78, 142, 86, 97, '37.2', 16, 'Nurse Liu', '2026-06-23T10:00:00.000Z'),
  (29,  74, 138, 84, 97, '37.0', 16, 'Nurse Liu', '2026-06-26T10:00:00.000Z'),
  (30,  64, 118, 74, 98, '36.9', 13, 'Nurse Liu', '2026-06-23T10:00:00.000Z'),
  (30,  62, 116, 72, 98, '36.8', 12, 'Nurse Liu', '2026-06-26T10:00:00.000Z'),
  (31,  88, 148, 96, 98, '37.6', 18, 'Nurse Liu', '2026-06-24T10:00:00.000Z'),
  (31,  80, 138, 88, 99, '37.2', 16, 'Nurse Liu', '2026-06-26T10:00:00.000Z'),
  (32,  58, 108, 64, 92, '37.8', 14, 'Nurse Liu', '2026-06-22T08:00:00.000Z'),
  (32,  56, 110, 66, 92, '37.6', 14, 'Nurse Liu', '2026-06-26T08:00:00.000Z'),
  (33,  70, 118, 74, 98, '37.0', 14, 'Nurse Liu', '2026-06-22T10:00:00.000Z'),
  (33,  66, 116, 72, 98, '36.9', 13, 'Nurse Liu', '2026-06-26T10:00:00.000Z'),
  (34,  68, 122, 76, 98, '37.0', 14, 'Nurse Liu', '2026-06-25T10:00:00.000Z'),
  (34,  65, 118, 74, 98, '36.9', 13, 'Nurse Liu', '2026-06-26T10:00:00.000Z'),

  -- Patients 35–40 (HDU)
  (35,  72, 128, 78, 98, '37.0', 16, 'Nurse Chen', '2026-06-25T12:00:00.000Z'),
  (35,  70, 124, 76, 98, '36.9', 15, 'Nurse Chen', '2026-06-26T08:00:00.000Z'),
  (36,  82, 116, 72, 96, '37.8', 20, 'Nurse Chen', '2026-06-24T08:00:00.000Z'),
  (36,  76, 112, 70, 97, '37.4', 18, 'Nurse Chen', '2026-06-26T08:00:00.000Z'),
  (37,  74, 122, 76, 98, '37.1', 16, 'Nurse Chen', '2026-06-25T12:00:00.000Z'),
  (37,  70, 118, 74, 98, '37.0', 15, 'Nurse Chen', '2026-06-26T08:00:00.000Z'),
  (38,  88, 118, 74, 98, '38.2', 20, 'Nurse Chen', '2026-06-24T10:00:00.000Z'),
  (38,  80, 114, 72, 98, '37.8', 18, 'Nurse Chen', '2026-06-26T08:00:00.000Z'),
  (39,  92, 112, 70, 94, '37.6', 22, 'Nurse Chen', '2026-06-24T10:00:00.000Z'),
  (39,  78, 114, 72, 96, '37.2', 18, 'Nurse Chen', '2026-06-26T08:00:00.000Z'),
  (40,  86, 124, 78, 98, '37.2', 18, 'Nurse Chen', '2026-06-23T10:00:00.000Z'),
  (40,  78, 118, 74, 99, '36.9', 16, 'Nurse Chen', '2026-06-26T08:00:00.000Z');

-- ============================================================
-- MEDICATIONS
-- ============================================================
INSERT INTO medications (patient_id, drug_name, purpose, dose, frequency, started_date, active, added_by, created_at) VALUES

  -- Patient 1: Margaret Wilson (post-stent cardiac)
  (1, 'Metoprolol succinate',  'Controls heart rate and reduces myocardial oxygen demand post-stent.',      '50mg',   'Twice daily with food',         '2026-06-12', true,  'Dr. Patel',          '2026-06-12T10:00:00.000Z'),
  (1, 'Aspirin',               'Antiplatelet therapy to prevent stent thrombosis.',                         '75mg',   'Once daily in the morning',     '2026-06-12', true,  'Dr. Patel',          '2026-06-12T10:00:00.000Z'),
  (1, 'Ticagrelor',            'Dual antiplatelet therapy — prevents blood clot formation in the stent.',   '90mg',   'Twice daily',                   '2026-06-12', true,  'Dr. Patel',          '2026-06-12T10:00:00.000Z'),
  (1, 'Atorvastatin',          'High-intensity statin to reduce cardiovascular risk and cholesterol.',      '80mg',   'Once daily at night',           '2026-06-12', true,  'Dr. Sarah Mitchell', '2026-06-12T10:00:00.000Z'),
  (1, 'Furosemide',            'Loop diuretic — removes excess fluid and reduces cardiac preload.',         '40mg',   'Once daily in the morning',     '2026-06-14', true,  'Dr. Sarah Mitchell', '2026-06-14T09:00:00.000Z'),
  (1, 'Ramipril',              'ACE inhibitor — protects the heart and reduces afterload post-MI.',        '5mg',    'Once daily',                    '2026-06-14', true,  'Dr. Patel',          '2026-06-14T09:00:00.000Z'),
  (1, 'Paracetamol',           'Pain and fever management as required.',                                    '1000mg', 'Every 6 hours when needed',     '2026-06-12', false, 'Dr. Sarah Mitchell', '2026-06-12T10:00:00.000Z'),

  -- Patient 2: Robert Clarke (post-emergency bowel surgery)
  (2, 'Piperacillin-Tazobactam','Broad-spectrum IV antibiotic to prevent and treat post-surgical infection.','4.5g',  'Every 8 hours IV',              '2026-06-18', true,  'Dr. Chen',           '2026-06-18T10:00:00.000Z'),
  (2, 'Metronidazole',          'Covers anaerobic bacteria — essential following bowel surgery.',           '500mg',  'Every 8 hours IV',              '2026-06-18', true,  'Dr. Chen',           '2026-06-18T10:00:00.000Z'),
  (2, 'Morphine',               'IV opioid analgesia for post-operative pain management.',                  '5mg',    'Every 4 hours as needed IV',    '2026-06-18', true,  'Nurse Rodriguez',    '2026-06-18T10:00:00.000Z'),
  (2, 'Enoxaparin',             'Low molecular weight heparin — prevents DVT while patient is immobile.',  '40mg',   'Once daily subcutaneous',       '2026-06-18', true,  'Dr. Chen',           '2026-06-18T10:00:00.000Z'),
  (2, 'Omeprazole',             'Proton pump inhibitor — protects the stomach lining during critical illness.','40mg','Once daily IV',                  '2026-06-18', true,  'Dr. Chen',           '2026-06-18T10:00:00.000Z'),
  (2, 'Ondansetron',            'Antiemetic — prevents nausea and vomiting post-operatively.',              '4mg',    'Every 8 hours IV as needed',    '2026-06-18', false, 'Nurse Rodriguez',    '2026-06-18T10:00:00.000Z'),

  -- Patient 3: Audrey Patel (critical TBI, ventilated)
  (3, 'Propofol',              'Continuous sedation to allow mechanical ventilation and reduce brain activity.','10mg/ml','Continuous IV infusion',     '2026-06-20', true,  'Dr. Okafor',         '2026-06-20T10:00:00.000Z'),
  (3, 'Fentanyl',              'Continuous opioid analgesia for ventilated patient comfort.',               '50mcg/h','Continuous IV infusion',        '2026-06-20', true,  'Dr. Okafor',         '2026-06-20T10:00:00.000Z'),
  (3, 'Levetiracetam',         'Anti-epileptic — prevents seizures following traumatic brain injury.',      '1000mg', 'Twice daily IV',                '2026-06-20', true,  'Dr. Okafor',         '2026-06-20T10:00:00.000Z'),
  (3, 'Noradrenaline',         'Vasopressor — maintains cerebral perfusion pressure.',                      '0.15 mcg/kg/min','Continuous IV infusion', '2026-06-20', true,  'Dr. Okafor',         '2026-06-20T10:00:00.000Z'),
  (3, 'Piperacillin-Tazobactam','Antibiotic prophylaxis for ventilator-associated pneumonia.',              '4.5g',   'Every 6 hours IV',              '2026-06-21', true,  'Dr. Okafor',         '2026-06-21T08:00:00.000Z'),
  (3, 'Mannitol',              'Osmotic agent — reduces intracranial pressure acutely.',                    '100ml',  'Every 6 hours IV',              '2026-06-20', false, 'Dr. Okafor',         '2026-06-20T10:00:00.000Z'),

  -- Patient 4: Frank Huang (post-MI HDU)
  (4, 'Atorvastatin',          'High-intensity statin — reduces LDL and cardiovascular risk post-MI.',     '80mg',   'Once daily at night',           '2026-06-22', true,  'Dr. Patel',          '2026-06-22T14:00:00.000Z'),
  (4, 'Bisoprolol',            'Beta-blocker — reduces heart rate and blood pressure post-MI.',            '2.5mg',  'Once daily in the morning',     '2026-06-22', true,  'Dr. Patel',          '2026-06-22T14:00:00.000Z'),
  (4, 'Aspirin',               'Antiplatelet therapy — prevents further clot formation.',                  '75mg',   'Once daily in the morning',     '2026-06-22', true,  'Dr. Patel',          '2026-06-22T14:00:00.000Z'),
  (4, 'Ticagrelor',            'Dual antiplatelet — post-PCI stent protection.',                           '90mg',   'Twice daily',                   '2026-06-22', true,  'Dr. Patel',          '2026-06-22T14:00:00.000Z'),
  (4, 'Ramipril',              'ACE inhibitor — started post-MI to protect cardiac function.',             '2.5mg',  'Once daily',                    '2026-06-23', true,  'Dr. Patel',          '2026-06-23T09:00:00.000Z'),
  (4, 'Enoxaparin',            'DVT prophylaxis while partially immobile.',                                '40mg',   'Once daily subcutaneous',       '2026-06-22', true,  'Nurse Martinez',     '2026-06-22T14:00:00.000Z'),

  -- Patient 5: Dorothy Kowalski (severe sepsis/pneumonia)
  (5, 'Piperacillin-Tazobactam','Broad-spectrum IV antibiotic targeting Strep pneumoniae sepsis.',         '4.5g',   'Every 6 hours IV',              '2026-06-19', true,  'Dr. Sarah Mitchell', '2026-06-19T11:00:00.000Z'),
  (5, 'Noradrenaline',         'Vasopressor — maintains blood pressure in septic shock.',                  '0.12 mcg/kg/min','Continuous IV infusion', '2026-06-19', true,  'Dr. Sarah Mitchell', '2026-06-19T11:00:00.000Z'),
  (5, 'Hydrocortisone',        'Corticosteroid — reduces inflammatory response in refractory septic shock.','200mg', 'Continuous IV infusion over 24h','2026-06-19', true,  'Dr. Sarah Mitchell', '2026-06-19T11:00:00.000Z'),
  (5, 'Enoxaparin',            'DVT prophylaxis — standard in sepsis management.',                         '40mg',   'Once daily subcutaneous',       '2026-06-20', true,  'Nurse Martinez',     '2026-06-20T08:00:00.000Z'),
  (5, 'Paracetamol',           'Antipyretic — manages fever in sepsis.',                                   '1000mg', 'Every 6 hours IV',              '2026-06-19', true,  'Nurse Martinez',     '2026-06-19T11:00:00.000Z'),
  (5, 'Gentamicin',            'Aminoglycoside — synergistic antibiotic for severe pneumococcal sepsis.',  '5mg/kg', 'Once daily IV',                 '2026-06-19', false, 'Dr. Sarah Mitchell', '2026-06-19T11:00:00.000Z'),

  -- Patient 6: Thomas Osei (post-op appendectomy)
  (6, 'Co-amoxiclav',          'Post-operative antibiotic prophylaxis for 24 hours.',                      '1.2g',   'Every 8 hours IV',              '2026-06-23', true,  'Dr. Chen',           '2026-06-23T10:00:00.000Z'),
  (6, 'Paracetamol',           'Regular analgesia — preferred post-operatively to minimise opioid use.',   '1000mg', 'Every 6 hours oral',            '2026-06-23', true,  'Nurse Rodriguez',    '2026-06-23T10:00:00.000Z'),
  (6, 'Ibuprofen',             'Anti-inflammatory analgesia adjunct for post-operative pain.',             '400mg',  'Every 8 hours oral with food',  '2026-06-23', true,  'Nurse Rodriguez',    '2026-06-23T10:00:00.000Z'),
  (6, 'Enoxaparin',            'DVT prophylaxis post-surgery.',                                            '20mg',   'Once daily subcutaneous',       '2026-06-23', true,  'Dr. Chen',           '2026-06-23T10:00:00.000Z'),

  -- Patient 7: Patricia Murray (critical ARDS, ventilated)
  (7, 'Propofol',              'Deep sedation for ARDS — facilitates lung-protective ventilation.',        '10mg/ml','Continuous IV infusion',         '2026-06-21', true,  'Dr. Okafor',         '2026-06-21T14:00:00.000Z'),
  (7, 'Fentanyl',              'IV opioid analgesia for ventilated patient.',                              '75mcg/h','Continuous IV infusion',         '2026-06-21', true,  'Dr. Okafor',         '2026-06-21T14:00:00.000Z'),
  (7, 'Cisatracurium',         'Neuromuscular blockade — improves ventilator synchrony in severe ARDS.',  '0.1mg/kg/h','Continuous IV infusion',      '2026-06-22', true,  'Dr. Okafor',         '2026-06-22T08:00:00.000Z'),
  (7, 'Piperacillin-Tazobactam','Empirical antibiotic for severe CAP causing ARDS.',                      '4.5g',   'Every 6 hours IV',              '2026-06-21', true,  'Dr. Okafor',         '2026-06-21T14:00:00.000Z'),
  (7, 'Enoxaparin',            'DVT prophylaxis — critical care standard.',                               '40mg',   'Once daily subcutaneous',       '2026-06-22', true,  'Nurse Liu',          '2026-06-22T08:00:00.000Z'),
  (7, 'Pantoprazole',          'Stress ulcer prophylaxis — standard in ventilated patients.',             '40mg',   'Once daily IV',                 '2026-06-21', true,  'Nurse Liu',          '2026-06-21T14:00:00.000Z'),

  -- Patient 8: Henry Blackwell (COPD exacerbation)
  (8, 'Salbutamol',            'Short-acting beta-2 agonist — relieves bronchospasm in COPD.',             '2.5mg',  'Every 4 hours nebulised',       '2026-06-24', true,  'Dr. Sarah Mitchell', '2026-06-24T10:00:00.000Z'),
  (8, 'Ipratropium bromide',   'Anticholinergic bronchodilator — reduces bronchospasm.',                   '500mcg', 'Every 6 hours nebulised',       '2026-06-24', true,  'Dr. Sarah Mitchell', '2026-06-24T10:00:00.000Z'),
  (8, 'Prednisolone',          'Systemic corticosteroid — reduces airway inflammation in COPD exacerbation.','30mg', 'Once daily oral for 5 days',    '2026-06-24', true,  'Dr. Sarah Mitchell', '2026-06-24T10:00:00.000Z'),
  (8, 'Doxycycline',           'Antibiotic for suspected bacterial trigger of COPD exacerbation.',         '200mg',  'Once daily oral for 5 days',    '2026-06-24', true,  'Dr. Sarah Mitchell', '2026-06-24T10:00:00.000Z'),
  (8, 'Aminophylline',         'Xanthine bronchodilator — used acutely for severe bronchospasm.',         '250mg',  'Loading dose IV once',          '2026-06-24', false, 'Dr. Sarah Mitchell', '2026-06-24T10:00:00.000Z'),

  -- Patient 9: Mei-Ling Chen (DKA, resolving)
  (9, 'Insulin Actrapid',      'Short-acting insulin infusion — cornerstone of DKA management.',           '0.1 units/kg/h','Continuous IV infusion',  '2026-06-17', false, 'Dr. Singh',          '2026-06-17T10:00:00.000Z'),
  (9, 'Potassium chloride',    'IV potassium replacement — DKA causes significant potassium depletion.',   '40mmol', 'In each litre of IV fluid',     '2026-06-17', false, 'Dr. Singh',          '2026-06-17T10:00:00.000Z'),
  (9, 'Insulin glargine',      'Once-daily basal insulin — commenced after DKA resolved.',                 '20 units','Once daily at night',           '2026-06-23', true,  'Dr. Singh',          '2026-06-23T14:00:00.000Z'),
  (9, 'Insulin aspart',        'Rapid-acting mealtime insulin — started with subcutaneous regimen.',       '6 units', 'Three times daily with meals',  '2026-06-23', true,  'Dr. Singh',          '2026-06-23T14:00:00.000Z'),
  (9, 'Metformin',             'Oral antidiabetic — restarted once oral intake re-established.',           '500mg',  'Twice daily with food',         '2026-06-24', true,  'Dr. Singh',          '2026-06-24T10:00:00.000Z'),

  -- Patient 10: James O'Brien (post-cardiac arrest)
  (10, 'Midazolam',            'Short-acting benzodiazepine — sedation during targeted temperature management.','2mg/h','Continuous IV infusion',      '2026-06-25', true,  'Dr. Okafor',         '2026-06-25T08:00:00.000Z'),
  (10, 'Amiodarone',           'Anti-arrhythmic — given post-VF cardiac arrest for rhythm stabilisation.','900mg',  'Continuous IV infusion over 24h','2026-06-25', true,  'Dr. Okafor',         '2026-06-25T08:00:00.000Z'),
  (10, 'Noradrenaline',        'Vasopressor — maintains MAP >65mmHg post-cardiac arrest.',                '0.08 mcg/kg/min','Continuous IV infusion',  '2026-06-25', true,  'Dr. Okafor',         '2026-06-25T08:00:00.000Z'),
  (10, 'Aspirin',              'Antiplatelet — suspected ACS trigger for cardiac arrest.',                 '300mg',  'Once via NG tube',              '2026-06-25', true,  'Dr. Patel',          '2026-06-25T09:00:00.000Z'),
  (10, 'Enoxaparin',           'DVT prophylaxis — on hold pending cardiology review and angiography.',    '40mg',   'Once daily subcutaneous',       '2026-06-25', false, 'Dr. Okafor',         '2026-06-25T08:00:00.000Z'),

  -- Patient 11: Bernard Walsh (post-CABG)
  (11, 'Bisoprolol',           'Beta-blocker — rate control and cardioprotection post-CABG.',              '2.5mg',  'Once daily oral',               '2026-06-23', true,  'Dr. Patel',          '2026-06-23T12:00:00.000Z'),
  (11, 'Aspirin',              'Antiplatelet — graft patency following CABG.',                             '75mg',   'Once daily oral',               '2026-06-23', true,  'Dr. Patel',          '2026-06-23T12:00:00.000Z'),
  (11, 'Atorvastatin',         'Statin — lipid management and plaque stabilisation.',                      '80mg',   'Once daily oral (night)',       '2026-06-23', true,  'Dr. Patel',          '2026-06-23T12:00:00.000Z'),
  (11, 'Tramadol',             'Opioid analgesic — post-operative sternotomy pain.',                       '50mg',   'Every 6 hours oral PRN',        '2026-06-23', true,  'Nurse Martinez',     '2026-06-23T12:00:00.000Z'),

  -- Patient 12: Fatima Al-Rashid (post-stroke)
  (12, 'Aspirin',              'Antiplatelet — secondary stroke prevention.',                              '300mg',  'Once daily oral',               '2026-06-21', true,  'Dr. Singh',          '2026-06-21T10:00:00.000Z'),
  (12, 'Atorvastatin',         'Statin — high-intensity therapy post-ischaemic stroke.',                  '80mg',   'Once daily oral',               '2026-06-21', true,  'Dr. Singh',          '2026-06-21T10:00:00.000Z'),
  (12, 'Ramipril',             'ACE inhibitor — blood pressure management post-stroke.',                  '5mg',    'Once daily oral',               '2026-06-22', true,  'Dr. Singh',          '2026-06-22T10:00:00.000Z'),
  (12, 'Alteplase',            'Thrombolytic — administered on admission (now discontinued).',             '0.9mg/kg','IV bolus + infusion (completed)','2026-06-21', false, 'Dr. Singh',         '2026-06-21T08:00:00.000Z'),

  -- Patient 13: Nkechi Adeyemi (acute liver failure)
  (13, 'N-Acetylcysteine',     'Antidote — paracetamol hepatotoxicity reversal (course completed).',      '150mg/kg','Phased IV infusion (completed)', '2026-06-24', false, 'Dr. Okafor',        '2026-06-24T07:00:00.000Z'),
  (13, 'Lactulose',            'Ammonia reduction — management of hepatic encephalopathy.',               '30mL',   'Three times daily oral/NG',     '2026-06-24', true,  'Dr. Chen',           '2026-06-24T08:00:00.000Z'),
  (13, 'Vitamin K',            'Coagulopathy correction — INR 3.8 on admission.',                         '10mg',   'Once daily IV',                 '2026-06-24', true,  'Dr. Okafor',         '2026-06-24T07:00:00.000Z'),
  (13, 'Piperacillin-Tazobactam','Broad-spectrum antibiotic — prophylaxis against spontaneous bacterial peritonitis.','4.5g','Every 8 hours IV',    '2026-06-24', true,  'Dr. Chen',           '2026-06-24T08:00:00.000Z'),

  -- Patient 14: Viktor Novak (MODS post-AAA)
  (14, 'Noradrenaline',        'Vasopressor — maintains MAP >65mmHg in septic shock.',                   '0.2 mcg/kg/min','Continuous IV infusion', '2026-06-22', true,  'Dr. Chen',           '2026-06-22T06:00:00.000Z'),
  (14, 'Vasopressin',          'Second-line vasopressor — dual therapy for refractory shock.',            '0.03 units/min','Continuous IV infusion', '2026-06-22', true,  'Dr. Chen',           '2026-06-22T06:00:00.000Z'),
  (14, 'Meropenem',            'Broad-spectrum carbapenem — sepsis with Gram-negative bacteraemia.',      '1g',     'Every 8 hours IV',              '2026-06-22', true,  'Dr. Patel',          '2026-06-22T07:00:00.000Z'),
  (14, 'Propofol',             'Sedative — ICU sedation facilitating CRRT tolerance.',                    '20mg/h', 'Continuous IV infusion',        '2026-06-22', true,  'Dr. Chen',           '2026-06-22T06:00:00.000Z'),

  -- Patient 15: Saoirse Brennan (post-neurosurgery)
  (15, 'Dexamethasone',        'Corticosteroid — peri-operative cerebral oedema prophylaxis.',            '4mg',    'Every 6 hours IV',              '2026-06-20', true,  'Dr. Okafor',         '2026-06-20T08:00:00.000Z'),
  (15, 'Levetiracetam',        'Anticonvulsant — seizure prophylaxis post-craniotomy.',                   '500mg',  'Twice daily oral',              '2026-06-20', true,  'Dr. Okafor',         '2026-06-20T08:00:00.000Z'),
  (15, 'Paracetamol',          'Analgesic — post-operative headache management.',                         '1g',     'Every 6 hours IV/oral',         '2026-06-20', true,  'Nurse Liu',          '2026-06-20T08:00:00.000Z'),
  (15, 'Enoxaparin',           'DVT prophylaxis — commenced once post-op haemostasis confirmed.',         '40mg',   'Once daily subcutaneous',       '2026-06-22', true,  'Dr. Okafor',         '2026-06-22T08:00:00.000Z'),

  -- Patient 16: Hassan Ibrahim (spinal injury)
  (16, 'Methylprednisolone',   'High-dose steroid — acute spinal cord injury neuroprotection (protocol).',  '125mg/h','Continuous IV (completed)',    '2026-06-23', false, 'Dr. Okafor',        '2026-06-23T07:00:00.000Z'),
  (16, 'Enoxaparin',           'DVT prophylaxis — high VTE risk in spinal injury.',                       '40mg',   'Once daily subcutaneous',       '2026-06-24', true,  'Dr. Singh',          '2026-06-24T08:00:00.000Z'),
  (16, 'Omeprazole',           'PPI — gastric protection with high-dose steroids.',                       '40mg',   'Once daily IV',                 '2026-06-23', true,  'Nurse Liu',          '2026-06-23T08:00:00.000Z'),
  (16, 'Baclofen',             'Muscle relaxant — spinal cord injury-related muscle spasm.',               '5mg',    'Three times daily oral',        '2026-06-24', true,  'Dr. Singh',          '2026-06-24T08:00:00.000Z'),

  -- Patient 17: Eleanor Fitzgerald (post-cholecystectomy)
  (17, 'Paracetamol',          'Analgesic — port-site pain management.',                                  '1g',     'Every 6 hours oral',            '2026-06-25', true,  'Nurse Chen',         '2026-06-25T10:00:00.000Z'),
  (17, 'Ibuprofen',            'Anti-inflammatory — multimodal analgesia post-laparoscopic procedure.',   '400mg',  'Every 8 hours oral with food',  '2026-06-25', true,  'Nurse Chen',         '2026-06-25T10:00:00.000Z'),
  (17, 'Co-amoxiclav',         'Antibiotic — prophylaxis post-cholecystectomy for acute cholecystitis.',  '625mg',  'Three times daily oral',        '2026-06-25', true,  'Dr. Mitchell',       '2026-06-25T09:00:00.000Z'),

  -- Patient 18: Marcus Thompson (syncope/orthostatic hypotension)
  (18, 'Fludrocortisone',      'Mineralocorticoid — increases sodium retention to treat orthostatic hypotension.','0.1mg','Once daily oral',          '2026-06-24', true,  'Dr. Patel',          '2026-06-24T10:00:00.000Z'),
  (18, 'Midodrine',            'Alpha-agonist — raises standing blood pressure in orthostatic hypotension.','5mg',  'Three times daily oral',        '2026-06-25', true,  'Dr. Patel',          '2026-06-25T10:00:00.000Z'),

  -- Patients 19–23 (ICU Ward A)
  (19, 'Piperacillin-Tazobactam','Broad-spectrum antibiotic — intra-abdominal sepsis and peritonitis.','4.5g','Every 8 hours IV','2026-06-25', true, 'Dr. Patel', '2026-06-25T08:00:00.000Z'),
  (19, 'Metronidazole',         'Anaerobic antibiotic — adjunct for bowel perforation/peritonitis.','500mg','Every 8 hours IV','2026-06-25', true, 'Dr. Patel', '2026-06-25T08:00:00.000Z'),
  (19, 'Noradrenaline',         'Vasopressor — maintaining MAP in septic shock post-laparotomy.','0.06 mcg/kg/min','Continuous IV','2026-06-25', true, 'Dr. Patel', '2026-06-25T07:00:00.000Z'),
  (20, 'Unfractionated Heparin','Anticoagulant — systemic heparinisation for submassive PE.','18 units/kg/h','Continuous IV infusion (APTT-adjusted)','2026-06-24', true, 'Dr. Singh', '2026-06-24T10:00:00.000Z'),
  (20, 'Enoxaparin',            'DVT prophylaxis — transitioning from IV heparin when stable.','40mg','Once daily SC','2026-06-25', false, 'Dr. Singh', '2026-06-25T10:00:00.000Z'),
  (21, 'Bupivacaine',           'Local anaesthetic — thoracic epidural infusion for rib fracture pain.','0.1% + fentanyl','Continuous epidural','2026-06-23', true, 'Dr. Mitchell', '2026-06-23T12:00:00.000Z'),
  (21, 'Enoxaparin',            'DVT prophylaxis — high VTE risk with rib fractures.','40mg','Once daily SC','2026-06-24', true, 'Nurse Martinez', '2026-06-24T08:00:00.000Z'),
  (22, 'Noradrenaline',         'Vasopressor — severe sepsis with haemodynamic compromise.','0.14 mcg/kg/min','Continuous IV','2026-06-22', true, 'Dr. Mitchell', '2026-06-22T09:00:00.000Z'),
  (22, 'Piperacillin-Tazobactam','Broad-spectrum antibiotic — severe CAP with bacteraemia.','4.5g','Every 6 hours IV','2026-06-22', true, 'Dr. Mitchell', '2026-06-22T09:00:00.000Z'),
  (23, 'Bisoprolol',            'Beta-blocker — rate control and cardioprotection post-CABG.','2.5mg','Once daily oral','2026-06-22', true, 'Dr. Patel', '2026-06-22T12:00:00.000Z'),
  (23, 'Aspirin',               'Antiplatelet — graft patency post-CABG.','75mg','Once daily oral','2026-06-22', true, 'Dr. Patel', '2026-06-22T12:00:00.000Z'),

  -- Patients 24–28 (ICU Ward B)
  (24, 'Piperacillin-Tazobactam','Broad-spectrum antibiotic — post-laparotomy bowel anastomosis.','4.5g','Every 8 hours IV','2026-06-24', true, 'Dr. Chen', '2026-06-24T10:00:00.000Z'),
  (24, 'Tramadol',               'Opioid analgesic — post-operative pain management.','50mg','Every 6 hours IV PRN','2026-06-24', true, 'Nurse Rodriguez', '2026-06-24T10:00:00.000Z'),
  (25, 'Meropenem',              'Carbapenem antibiotic — infected pancreatic necrosis (E. coli).','1g','Every 8 hours IV','2026-06-23', true, 'Dr. Chen', '2026-06-23T08:00:00.000Z'),
  (25, 'Noradrenaline',          'Vasopressor — maintaining MAP in necrotising pancreatitis with shock.','0.06 mcg/kg/min','Continuous IV','2026-06-25', true, 'Dr. Chen', '2026-06-25T08:00:00.000Z'),
  (26, 'Warfarin',               'Anticoagulant — post-bioprosthetic AVR (target INR 2.0–3.0).','3mg','Once daily oral','2026-06-23', true, 'Dr. Patel', '2026-06-23T10:00:00.000Z'),
  (26, 'Bisoprolol',             'Beta-blocker — rate control and cardiac protection post-valve surgery.','2.5mg','Once daily oral','2026-06-21', true, 'Dr. Chen', '2026-06-21T10:00:00.000Z'),
  (27, 'Ceftriaxone',            'Antibiotic — N. meningitidis meningitis (first-line).','2g','Every 12 hours IV','2026-06-25', true, 'Dr. Okafor', '2026-06-25T07:00:00.000Z'),
  (27, 'Dexamethasone',          'Corticosteroid — adjunct to reduce neuroinflammation in bacterial meningitis.','0.15mg/kg','Every 6 hours IV','2026-06-25', true, 'Dr. Okafor', '2026-06-25T07:00:00.000Z'),
  (28, 'Meropenem',              'Carbapenem — ESBL-suspected diabetic foot necrotising fasciitis.','1g','Every 8 hours IV','2026-06-20', true, 'Dr. Chen', '2026-06-20T08:00:00.000Z'),
  (28, 'Vancomycin',             'Glycopeptide antibiotic — MRSA coverage pending swab results.','1.5g','Every 12 hours IV','2026-06-20', true, 'Dr. Chen', '2026-06-20T08:00:00.000Z'),

  -- Patients 29–34 (ICU Ward C)
  (29, 'Labetalol',              'Antihypertensive IV — acute blood pressure management post-ICH (target SBP <140).','20mg boluses PRN','IV bolus','2026-06-23', true, 'Dr. Okafor', '2026-06-23T10:00:00.000Z'),
  (29, 'Levetiracetam',          'Anticonvulsant — seizure prophylaxis post-intracerebral haemorrhage.','500mg','Twice daily IV','2026-06-23', true, 'Dr. Singh', '2026-06-23T10:00:00.000Z'),
  (30, 'Immunoglobulin (IVIg)',  'Immunomodulatory — treatment of Guillain-Barré syndrome.','0.4g/kg','Once daily IV over 5 days','2026-06-21', false, 'Dr. Singh', '2026-06-21T10:00:00.000Z'),
  (30, 'Enoxaparin',             'DVT prophylaxis — reduced mobility in GBS.','40mg','Once daily SC','2026-06-21', true, 'Nurse Liu', '2026-06-21T10:00:00.000Z'),
  (31, 'Magnesium Sulphate',     'Anticonvulsant — eclampsia treatment (24h course completed).','4g loading, 1g/h','IV infusion (completed)','2026-06-24', false, 'Dr. Singh', '2026-06-24T10:00:00.000Z'),
  (31, 'Labetalol',              'Antihypertensive — ongoing blood pressure control post-eclampsia.','200mg','Twice daily oral','2026-06-25', true, 'Dr. Singh', '2026-06-25T08:00:00.000Z'),
  (32, 'Midazolam',              'Benzodiazepine sedation — burst suppression target in anoxic brain injury.','5mg/h','Continuous IV','2026-06-22', true, 'Dr. Okafor', '2026-06-22T08:00:00.000Z'),
  (32, 'Levetiracetam',          'Anticonvulsant — EEG abnormality in anoxic brain injury.','1g','Twice daily IV','2026-06-22', true, 'Dr. Okafor', '2026-06-22T08:00:00.000Z'),
  (33, 'Pyridostigmine',         'Acetylcholinesterase inhibitor — myasthenia gravis long-term management.','60mg','Every 4 hours oral','2026-06-25', true, 'Dr. Singh', '2026-06-25T10:00:00.000Z'),
  (33, 'Prednisolone',           'Corticosteroid — myasthenia gravis immunosuppression.','40mg','Once daily oral','2026-06-25', true, 'Dr. Singh', '2026-06-25T10:00:00.000Z'),
  (34, 'Levetiracetam',          'Anticonvulsant — post-subdural haematoma seizure prophylaxis.','500mg','Twice daily oral','2026-06-23', true, 'Dr. Okafor', '2026-06-23T10:00:00.000Z'),
  (34, 'Paracetamol',            'Analgesic — post-craniotomy headache management.','1g','Every 6 hours oral','2026-06-24', true, 'Nurse Liu', '2026-06-24T10:00:00.000Z'),

  -- Patients 35–40 (HDU)
  (35, 'Paracetamol',            'Analgesic — post-operative hip replacement pain.','1g','Every 6 hours oral','2026-06-25', true, 'Nurse Chen', '2026-06-25T12:00:00.000Z'),
  (35, 'Enoxaparin',             'DVT prophylaxis — high VTE risk post-THR.','40mg','Once daily SC','2026-06-25', true, 'Nurse Chen', '2026-06-25T12:00:00.000Z'),
  (36, 'Amoxicillin-Clavulanate','Antibiotic — stepping down from IV amoxicillin/clarithromycin for CAP.','625mg','Three times daily oral','2026-06-26', true, 'Dr. Mitchell', '2026-06-26T08:00:00.000Z'),
  (36, 'Salbutamol Nebuliser',   'Bronchodilator — symptom relief in pneumonia with wheeze.','2.5mg','Four times daily','2026-06-23', true, 'Nurse Chen', '2026-06-23T08:00:00.000Z'),
  (37, 'Co-amoxiclav',           'Antibiotic — post-colonic perforation repair.','1.2g','Every 8 hours IV','2026-06-25', true, 'Dr. Mitchell', '2026-06-25T12:00:00.000Z'),
  (37, 'Paracetamol',            'Analgesic — post-operative pain after laparoscopic repair.','1g','Every 6 hours IV/oral','2026-06-25', true, 'Nurse Chen', '2026-06-25T12:00:00.000Z'),
  (38, 'Meropenem',              'Carbapenem — ESBL E. coli urosepsis.','1g','Every 8 hours IV','2026-06-24', true, 'Dr. Mitchell', '2026-06-24T10:00:00.000Z'),
  (38, 'Paracetamol',            'Analgesic/antipyretic — fever management in urosepsis.','1g','Every 6 hours oral','2026-06-24', true, 'Nurse Chen', '2026-06-24T10:00:00.000Z'),
  (39, 'Salbutamol IV',          'IV bronchodilator — severe acute asthma, nebulisers insufficient.','5 mcg/min','Continuous IV infusion','2026-06-24', true, 'Dr. Mitchell', '2026-06-24T10:00:00.000Z'),
  (39, 'Hydrocortisone',         'Corticosteroid — systemic anti-inflammatory in severe acute asthma.','100mg','Every 6 hours IV','2026-06-24', true, 'Dr. Mitchell', '2026-06-24T10:00:00.000Z'),
  (40, 'Insulin Actrapid',       'Short-acting insulin — HHS blood glucose correction via sliding scale.','variable','IV sliding scale','2026-06-23', true, 'Dr. Mitchell', '2026-06-23T10:00:00.000Z'),
  (40, 'Sodium Chloride 0.9%',   'IV fluid resuscitation — correcting hyperosmolarity in HHS.','1L/h','Continuous IV (rate adjusted)','2026-06-23', true, 'Nurse Chen', '2026-06-23T10:00:00.000Z');

-- ============================================================
-- CLINICAL UPDATES
-- ============================================================
INSERT INTO clinical_updates (patient_id, update_type, title, content, updated_by, created_at) VALUES

  -- Patient 1: Margaret Wilson
  (1, 'condition', 'Admission — post-cardiac catheterisation',         'Margaret admitted following elective cardiac catheterisation with LAD stent placement. Procedure technically successful. Haemostasis achieved at radial access site. Commenced on dual antiplatelet therapy (aspirin + ticagrelor). Vitals stable on admission.', 'Dr. Patel', '2026-06-12T16:00:00.000Z'),
  (1, 'procedure', 'Echocardiogram — day 4',                          'Resting echocardiogram performed. EF estimated at 54%, mildly reduced from baseline. No significant valvular abnormality. LV function improving. Cardiology team satisfied with progress.', 'Dr. Patel', '2026-06-16T10:00:00.000Z'),
  (1, 'general',   'Nutrition and physiotherapy update',               'Margaret eating well with appetite returning. Mobilising with physiotherapy assistance twice daily. Sleep quality improved. Furosemide commenced to manage mild ankle oedema. Urine output satisfactory.', 'Nurse Martinez', '2026-06-20T14:00:00.000Z'),
  (1, 'condition', 'Day 13 — stable, discharge planning commenced',    'Excellent progress. Blood pressure consistently within target (120–130/75–80). Heart rate well controlled on metoprolol. Ankle oedema resolved. Discharge letter being prepared. Community cardiac rehab referral made. Patient and family educated on new medication regimen.', 'Dr. Sarah Mitchell', '2026-06-25T09:00:00.000Z'),

  -- Patient 2: Robert Clarke
  (2, 'procedure', 'Emergency laparotomy — perforated bowel',          'Robert admitted via A&E with acute abdomen. CT confirmed perforated sigmoid colon with free air. Taken to theatre for emergency laparotomy and Hartmann''s procedure. Bowel resection completed with end colostomy. Procedure tolerated under general anaesthetic.', 'Dr. Chen', '2026-06-18T20:00:00.000Z'),
  (2, 'condition', 'Post-operative day 2 — ICU monitoring',            'Robert transferred to ICU post-operatively for close monitoring. Haemodynamically stable on admission. IV antibiotics commenced. Wound site clean, drain in situ with serosanguinous output. Patient sedated but rousable. Pain managed with IV morphine.', 'Nurse Rodriguez', '2026-06-20T08:00:00.000Z'),
  (2, 'general',   'Bowel sounds returned — NG feeds commenced',       'Auscultation confirms return of bowel sounds. Surgical team pleased with early recovery. NG nasogastric feeding commenced at 30ml/h, tolerating well. Drain output reducing. Oral fluids trial planned for tomorrow.', 'Nurse Rodriguez', '2026-06-23T10:00:00.000Z'),
  (2, 'condition', 'Day 7 — infection markers improving',              'CRP trending down (285 → 142 mg/L). Temperature settling — max 37.9°C today vs 38.6°C on admission. Wound inspection shows clean edges, no dehiscence. Antibiotics course ongoing for 5 more days. Stoma nurse reviewed patient today; stoma bag change demonstrated.', 'Dr. Chen', '2026-06-25T09:00:00.000Z'),

  -- Patient 3: Audrey Patel
  (3, 'condition', 'Admission — traumatic brain injury following RTA',  'Audrey brought in by ambulance following high-speed road traffic accident. GCS 6 on arrival (E1V2M3). Intubated in resus. CT head revealed left frontal contusion with surrounding oedema and 4mm midline shift to the right. No surgical lesion. Neurosurgery team reviewed and recommended conservative management with ICP monitoring.', 'Dr. Okafor', '2026-06-20T11:00:00.000Z'),
  (3, 'procedure', 'ICP monitor inserted',                             'Intracranial pressure monitoring device inserted at bedside under aseptic technique. Initial ICP reading 24mmHg — elevated. Mannitol commenced for osmotherapy. CPP maintained above 60mmHg with noradrenaline.', 'Dr. Okafor', '2026-06-20T16:00:00.000Z'),
  (3, 'condition', 'Day 3 — seizure episode managed',                  'Brief electrographic seizure activity noted at 03:15 on continuous EEG monitoring. Treated with IV lorazepam 4mg — resolved within 2 minutes. Levetiracetam dose increased. Neurology reviewed. No further seizure activity in 24 hours. Family updated by telephone.', 'Nurse Liu', '2026-06-22T09:00:00.000Z'),
  (3, 'procedure', 'CT Head repeat — day 4',                           'Repeat CT Head performed. No increase in haematoma volume. Midline shift stable at 4mm. Oedema not progressing. ICP now 18mmHg — slight improvement. Mannitol weaned. Sedation wean trial planned for tomorrow morning.', 'Dr. Okafor', '2026-06-24T08:00:00.000Z'),
  (3, 'condition', 'Day 5 — sedation wean attempted',                  'Propofol reduced at 07:00. Patient showed signs of agitation and ICP rose to 26mmHg within 30 minutes. Decision made to resedatate for further 24 hours. Neurosurgery team to discuss surgical decompression options at tomorrow''s MDT. Family informed of slow progress.', 'Dr. Okafor', '2026-06-25T10:00:00.000Z'),

  -- Patient 4: Frank Huang
  (4, 'procedure', 'Primary PCI — inferior STEMI',                     'Frank presented with 2 hours of central chest pain radiating to the jaw. ECG confirmed inferior STEMI with ST elevation in II, III, aVF. Taken urgently to catheter lab. Single vessel disease identified — right coronary artery occluded. Successful PTCA and drug-eluting stent deployment. TIMI 3 flow restored.', 'Dr. Patel', '2026-06-22T14:00:00.000Z'),
  (4, 'general',   'Step-down from ICU to HDU — day 1',               'Frank transferred from ICU Ward A to HDU following haemodynamic stabilisation. Alert and orientated. Tolerating oral medications. BP 138/88, HR 76. Commenced on dual antiplatelet, statin, ACE inhibitor, and beta-blocker. Echo requested.', 'Nurse Martinez', '2026-06-22T18:00:00.000Z'),
  (4, 'procedure', 'Echocardiogram — day 2',                           'Bedside echo performed. EF 38%, inferoposterior wall hypokinesis consistent with RCA territory infarct. No significant pericardial effusion. No MR. Cardiology team note improvement expected over next 4–6 weeks with medical therapy. Ramipril started.', 'Dr. Patel', '2026-06-23T11:00:00.000Z'),
  (4, 'condition', 'Day 3 — ready for ward transfer',                  'Frank mobilising well on the ward. No chest pain, no palpitations. HR 68, BP 130/82. Cardiac rehab physiotherapist reviewed — gentle exercise programme commenced. All medications now oral. Discharge planning underway. Transfer to cardiology ward confirmed for this afternoon.', 'Dr. Patel', '2026-06-25T09:30:00.000Z'),

  -- Patient 5: Dorothy Kowalski
  (5, 'condition', 'Admission — severe sepsis secondary to pneumonia',  'Dorothy admitted from nursing home with confusion, high fever (39.8°C), and hypotension (BP 85/52). Sepsis protocol activated immediately. IV fluids, blood cultures, and broad-spectrum antibiotics commenced within 1 hour of arrival. Vasopressor support initiated. Chest X-ray showed right lower lobe consolidation.', 'Dr. Sarah Mitchell', '2026-06-19T11:00:00.000Z'),
  (5, 'test',      'Blood culture result — pathogen identified',        'Blood cultures flagged positive at 48 hours. Streptococcus pneumoniae isolated — sensitive to penicillin and amoxicillin. Antibiotic regimen rationalised. Piperacillin-tazobactam continued pending further sensitivities. Infectious diseases team notified.', 'Dr. Sarah Mitchell', '2026-06-21T10:00:00.000Z'),
  (5, 'general',   'Day 4 — vasopressor requirements falling',         'Noradrenaline dose reduced by 40% overnight as haemodynamics improved. MAP consistently above 65mmHg. Temperature max 38.3°C (down from 39.6°C on admission). CRP 225 mg/L (falling). SpO2 92–93% on 4L/min O2. Patient more alert — opening eyes to voice.', 'Nurse Martinez', '2026-06-23T09:00:00.000Z'),
  (5, 'condition', 'Day 6 — significant improvement, vasopressor weaned','Noradrenaline successfully weaned and stopped at 04:00. Maintaining MAP above 68mmHg spontaneously. Temperature 37.9°C. Respiratory status improving — O2 requirement reduced to 2L/min. Family visited today and patient recognised them. Oral fluids started.', 'Dr. Sarah Mitchell', '2026-06-25T09:00:00.000Z'),

  -- Patient 6: Thomas Osei
  (6, 'procedure', 'Laparoscopic appendectomy — perforated appendix',  'Thomas presented with 48 hours of RIF pain and pyrexia. CT confirmed perforated appendix with localised abscess. Taken to theatre for laparoscopic appendectomy. Peritoneal washout performed. Procedure completed without conversion to open. Estimated blood loss minimal.', 'Dr. Chen', '2026-06-23T16:00:00.000Z'),
  (6, 'condition', 'Post-operative day 1 — stable and comfortable',    'Thomas alert and orientated. Tolerating oral fluids and light diet. Pain well controlled on regular paracetamol and ibuprofen. Temperature 37.0°C — apyrexial. Wound sites clean and dry. Port-site dressings intact. Mobilising to bathroom independently.', 'Nurse Rodriguez', '2026-06-24T10:00:00.000Z'),
  (6, 'general',   'Discharge planned for tomorrow',                    'Thomas is meeting all discharge criteria. Eating and drinking normally. Passing flatus. Pain well managed with oral analgesia alone. Stitch removal appointment arranged for 10 days. Written post-operative instructions and red flag symptoms leaflet given. Family informed.', 'Dr. Chen', '2026-06-25T09:00:00.000Z'),

  -- Patient 7: Patricia Murray
  (7, 'condition', 'Admission — severe CAP with ARDS',                 'Patricia transferred from a peripheral hospital with severe community-acquired pneumonia failing high-flow oxygen. Met Berlin criteria for severe ARDS (P/F ratio 82 on FiO2 60%). Intubated and ventilated. Lung-protective ventilation commenced (TV 6ml/kg IBW, PEEP 12cmH2O). Sedated and paralysed.', 'Dr. Okafor', '2026-06-21T16:00:00.000Z'),
  (7, 'procedure', 'Prone positioning — day 2',                        'Patient proned for 16 hours per ARDS guidelines. P/F ratio improved from 82 to 95 during prone session. Returned supine at 08:00. Position change completed safely by 6-person team. No pressure injuries noted. Proning to be continued daily.', 'Nurse Liu', '2026-06-23T10:00:00.000Z'),
  (7, 'condition', 'Day 4 — P/F ratio marginally improving',           'P/F ratio 97 this morning. FiO2 reduced from 65% to 60%. PEEP maintained at 12cmH2O. Bronchoalveolar lavage result grew Streptococcus pneumoniae — antibiotics appropriate. Renal function stable — no AKI. Family (husband) visited for 30 minutes — distressing consultation, supported by family liaison nurse.', 'Dr. Okafor', '2026-06-25T10:00:00.000Z'),

  -- Patient 8: Henry Blackwell
  (8, 'condition', 'Admission — acute COPD exacerbation',              'Henry attended A&E with 3 days of worsening breathlessness and productive green sputum. Known COPD (GOLD stage III). On home nebulisers. ABG on admission: pH 7.32, pCO2 62mmHg, pO2 58mmHg on 35% O2 — type 2 respiratory failure. Stepped down to 28% Venturi. Nebulisers, steroids, and antibiotics commenced.', 'Dr. Sarah Mitchell', '2026-06-24T11:00:00.000Z'),
  (8, 'condition', 'Day 1 — responding to treatment',                  'Henry considerably more comfortable this morning. SpO2 90% on 28% Venturi (up from 88% on admission). Repeat ABG: pH 7.35, pCO2 58mmHg — improving. Nebulisers producing good bronchodilation. Eating breakfast. If maintains current trajectory, step-down to respiratory ward planned tomorrow.', 'Nurse Chen', '2026-06-25T09:00:00.000Z'),

  -- Patient 9: Mei-Ling Chen
  (9, 'condition', 'Admission — diabetic ketoacidosis',                'Mei-Ling presented with 2 days of vomiting, polyuria, and confusion. Known Type 1 diabetic. VBG on arrival: pH 7.16, bicarbonate 9mmol/L, ketones 5.8mmol/L, glucose 28.4mmol/L. Kussmaul breathing noted. IV fluids, insulin infusion, and potassium replacement commenced per DKA protocol. Catheterised for strict fluid balance.', 'Dr. Singh', '2026-06-17T11:00:00.000Z'),
  (9, 'general',   'Day 2 — ketones clearing',                         'VBG this morning: pH 7.29, ketones 2.8mmol/L. Good progress. IV insulin infusion continued. Potassium levels stable with replacement. Patient more alert and oriented. Nausea subsiding. IV fluid rate reduced as dehydration correcting. Endocrine team reviewed.', 'Nurse Martinez', '2026-06-19T10:00:00.000Z'),
  (9, 'condition', 'DKA resolved — switching to subcutaneous insulin',  'VBG: pH 7.38, bicarbonate 22mmol/L, ketones 0.4mmol/L. DKA resolved. IV insulin infusion stopped. Commenced on basal-bolus insulin regimen (glargine + aspart). Patient eating well. Diabetes specialist nurse review completed — patient educated on sick-day rules and early DKA recognition. Metformin restarted.', 'Dr. Singh', '2026-06-23T14:00:00.000Z'),
  (9, 'condition', 'Day 8 — ready for discharge tomorrow',             'Blood glucose 6.8–9.2mmol/L on new insulin regimen — excellent control. HbA1c 12.4% on admission reflects poor control prior to this episode. Diabetes nurse has arranged follow-up with outpatient diabetes team in 2 weeks. Patient confident with insulin self-injection technique. Discharge letter being prepared.', 'Dr. Singh', '2026-06-25T09:00:00.000Z'),

  -- Patient 10: James O'Brien
  (10, 'procedure', 'ROSC achieved — transfer to ICU',                 'James collapsed at home; CPR by paramedics for 18 minutes. VF rhythm — defibrillated twice on scene. ROSC achieved pre-hospital. Transferred to A&E, intubated and ventilated. ECG shows ST changes in V1–V4 suggestive of anterior STEMI vs demand ischaemia. Troponin 18.4ng/mL. Cooling blanket applied — target temperature 36°C.', 'Dr. Patel', '2026-06-25T07:00:00.000Z'),
  (10, 'condition', 'Hour 2 — haemodynamically supported, cooling ongoing','Temperature now 36.0°C — target achieved. Low-dose noradrenaline maintaining MAP 68mmHg. GCS 3T (sedated). Pupils equal and reactive. No further arrhythmias since transfer. Blood gas improving — pH 7.28 (up from 7.22 on arrival), lactate falling. Coronary angiography booked for tomorrow morning pending further stabilisation. Wife arrived — liaison nurse with family.', 'Dr. Okafor', '2026-06-25T10:00:00.000Z'),

  -- Patient 11: Bernard Walsh (post-CABG)
  (11, 'procedure', 'CABG ×3 completed — Day 0 summary',              'Elective CABG ×3 (LIMA → LAD, SVG → RCA, SVG → OM2). Procedure 3h 20min. On-pump. No intra-operative complications. Transferred to ICU for post-operative monitoring. Chest drain in situ; draining serosanguinous fluid.', 'Dr. Patel', '2026-06-23T14:00:00.000Z'),
  (11, 'condition', 'Day 3 — AF episode resolved, improving well',    'Brief episode of new-onset post-operative AF at 01:30 (day 3). Rate 136bpm — managed with IV amiodarone 300mg bolus, reverted to sinus rhythm within 2 hours. Heart rate now 64bpm. Chest drain removed. Mobilising with physiotherapy — walked 20m with one-person assist. Wound clean and dry. Pain well controlled.', 'Dr. Patel', '2026-06-26T09:00:00.000Z'),

  -- Patient 12: Fatima Al-Rashid (post-stroke)
  (12, 'procedure', 'Thrombolysis administered — stroke alert pathway', 'Fatima presented with sudden-onset expressive dysphasia and right facial droop. CT head excluded haemorrhage. NIHSS 12. Alteplase administered 0.9mg/kg IV within 3.5 hours of symptom onset (ROSIER score +4). BP pre-thrombolysis 178/104 — treated with labetalol IV. Transfer to ICU for post-thrombolysis monitoring.', 'Dr. Singh', '2026-06-21T08:00:00.000Z'),
  (12, 'condition', 'Day 5 — NIHSS improving, transfer planned',      'NIHSS now 7 (down from 12 on admission). Expressive dysphasia improving — producing 3–4 word phrases. No post-thrombolysis haemorrhage on repeat CT at 24 hours. Swallowing assessment: modified diet and thickened fluids. Speech and language therapy commenced. Stroke rehab unit transfer arranged for tomorrow pending bed availability.', 'Dr. Singh', '2026-06-26T10:00:00.000Z'),

  -- Patient 13: Nkechi Adeyemi (acute liver failure)
  (13, 'condition', 'Day 2 — liver transplant team assessment complete','NAC infusion completed. INR improving: 3.8 → 2.4 over 36 hours. Hepatic encephalopathy Grade 2 — oriented to person only. Blood glucose maintained with 10% dextrose infusion. Hepatology and liver transplant team assessed today. Patient placed on urgent transplant register. Family counselled regarding prognosis. Daily LFTs and INR monitoring.', 'Dr. Okafor', '2026-06-26T11:00:00.000Z'),

  -- Patient 14: Viktor Novak (MODS post-AAA)
  (14, 'procedure', 'Emergency EVAR — Day 0 summary',                 'Viktor presented with acute onset tearing back pain and collapse. CT-Angiography: ruptured infra-renal AAA (8.2cm). Emergency EVAR performed under general anaesthesia. Procedure 1h 40min — significant intra-operative blood loss, 6 units pRBC transfused. Transfer to ICU on dual vasopressors. Oliguria — CRRT commenced for AKI.', 'Dr. Chen', '2026-06-22T06:00:00.000Z'),
  (14, 'condition', 'Day 4 — MODS persisting, guarded prognosis',     'Vasopressor requirements partially reduced but noradrenaline still at 0.12 mcg/kg/min. CRRT ongoing — urine output remains negligible (AKI stage 3). INR 2.1, bilirubin rising — hepatic dysfunction emerging as MODS feature. Ventilated: PEEP 8, FiO2 35%. Sedation lightened — withdrawal assessed daily (RASS -3). Family meeting held — prognosis discussed; wife and son attended.', 'Dr. Patel', '2026-06-26T09:00:00.000Z'),

  -- Patient 15: Saoirse Brennan (post-neurosurgery)
  (15, 'procedure', 'Right frontal craniotomy — meningioma resection', 'Elective craniotomy for right frontal meningioma (3.4cm, WHO Grade I on frozen section). Gross total resection achieved. Estimated blood loss 280mL. No intra-operative complications. Post-operative MRI: no residual tumour. Transfer to neurosurgical ICU for monitoring.', 'Dr. Okafor', '2026-06-20T16:00:00.000Z'),
  (15, 'condition', 'Day 6 — ready for step-down to HDU',             'Neurologically intact. Craniotomy wound healing well — no signs of infection. Headaches now grade 2/10 on regular paracetamol. Seizure-free. Dexamethasone weaning commenced. HDU transfer arranged for tomorrow. MRI report confirmed WHO Grade I (benign) — oncology surveillance plan to be arranged as outpatient. Patient and family updated and very relieved.', 'Dr. Okafor', '2026-06-26T11:00:00.000Z'),

  -- Patient 16: Hassan Ibrahim (spinal injury)
  (16, 'procedure', 'MRI spine and neurosurgery review complete',      'MRI C-spine: C5/C6 fracture-dislocation with approximately 40% loss of vertebral height. No cord compression or epidural haematoma. Incomplete cord injury (ASIA B). Neurosurgery consensus: conservative management with rigid cervical collar; no operative fixation required at present. Bladder catheterised — neurogenic bladder protocol started.', 'Dr. Okafor', '2026-06-24T14:00:00.000Z'),
  (16, 'condition', 'Day 3 — neurology improving, rehab referral made','Bilateral hand function partially preserved and improving — able to grip weakly. Lower limb power 2/5 both sides. Physiotherapy commenced bed exercises. Spinal precautions maintained. Stool softeners and bowel protocol started. Referral made to regional spinal injury rehabilitation unit. Family arrived from Edinburgh — met with consultant.', 'Dr. Singh', '2026-06-26T10:00:00.000Z'),

  -- Patient 17: Eleanor Fitzgerald (post-cholecystectomy)
  (17, 'procedure', 'Laparoscopic cholecystectomy — operation note',   'Four-port laparoscopic cholecystectomy for acute calculous cholecystitis. Operative time 55 minutes. Significant adhesions from previous appendicectomy; converted to partial dissection technique. Intra-operative cholangiogram: bile duct clear. No bile leak. Patient transferred to HDU for 23-hour observation per protocol for ASA III patients.', 'Dr. Mitchell', '2026-06-25T11:00:00.000Z'),
  (17, 'condition', 'Day 1 post-op — tolerating diet, for discharge', 'Patient comfortable. Tolerating light diet and adequate oral fluids. Port sites clean, no haematoma. Observations stable. Bladder catheter removed — voiding normally. Physiotherapy: walked independently 50m in corridor. Social work review completed — lives alone, daughter arranging to stay for 48 hours post-discharge. Discharge letter prepared.', 'Dr. Mitchell', '2026-06-26T10:00:00.000Z'),

  -- Patient 18: Marcus Thompson (syncope)
  (18, 'condition', 'Day 2 — tilt-table results and management plan', 'Head-up tilt table test positive: systolic drop from 118 to 64mmHg at 70° tilt — confirms vasovagal component with orthostatic hypotension. Holter 48h: sinus rhythm throughout, no documented arrhythmia during symptomatic period. Echo: normal LV function, EF 60%, no structural disease. Commenced fludrocortisone 0.1mg OD and midodrine 5mg TDS. Advised increased salt/fluid intake. Cardiology outpatient follow-up in 4 weeks.', 'Dr. Patel', '2026-06-26T09:00:00.000Z'),

  -- Patients 19–40 (one update each)
  (19, 'condition', 'Day 1 post-op — vasopressor requirements reducing',   'Noradrenaline weaned from 0.12 to 0.06 mcg/kg/min over 8 hours. MAP maintained above 65mmHg. Urine output improving: 0.6 mL/kg/h. Temperature 38.2°C — inflammatory markers checked. CRP 288 mg/L. Repeat blood cultures pending. Stoma output established — ileostomy nurse assessed today.', 'Dr. Patel', '2026-06-26T09:00:00.000Z'),
  (20, 'condition', 'Day 2 — RV function improving, PE stable',            'Repeat ECHO at 48 hours: right ventricular function improving compared to admission (RV:LV ratio 0.9, down from 1.3). Troponin trending down: 0.8 ng/mL. Haemodynamically stable off vasopressors. Heparin APTT therapeutic. Transitioning plan: DOAC to commence once clinically stable. Chest physio reviewed.', 'Dr. Singh', '2026-06-26T10:00:00.000Z'),
  (21, 'condition', 'Day 3 — FiO2 weaning, epidural working well',         'FiO2 reduced from 40% to 28% — maintaining SpO2 97%. Chest drain output reduced to 30mL/24h — on-call surgical review. Epidural providing excellent analgesia (VAS 2/10 at rest). Encouraging deep breathing exercises with physiotherapy. CXR: improving aeration bilaterally. Plan: trial of epidural weaning tomorrow.', 'Dr. Mitchell', '2026-06-26T10:00:00.000Z'),
  (22, 'condition', 'Day 4 — ventilated, proning session Day 2',           'Second prone positioning session completed (16 hours) — P/F ratio improved from 110 to 148 during prone. Returned supine at 08:00. Noradrenaline 0.14 mcg/kg/min, unchanged. Cultures from bronchial lavage: S. aureus (MSSA) — targeted to flucloxacillin. Sedation lightened briefly: RASS -3, pupils reactive. Daily rounding multidisciplinary team.', 'Dr. Mitchell', '2026-06-26T11:00:00.000Z'),
  (23, 'condition', 'Day 4 post-CABG — step-down to HDU tonight',          'All post-operative targets met. HR 62 sinus. BP 118/72 on oral bisoprolol only. Wound clean. Pain VAS 2/10. Physiotherapy: climbed one flight of stairs independently. Chest X-ray: clear fields bilaterally. Bloods: Hb 10.8 improving, CRP 44 (down from 218). Step-down to Cardiothoracic HDU confirmed for this evening.', 'Dr. Patel', '2026-06-26T10:00:00.000Z'),
  (24, 'condition', 'Day 2 post-laparotomy — ileus resolving',             'Passing flatus — first since surgery. NG aspirate <50mL/4h — considering removal. IV antibiotics continuing (day 2 of 5-day course). Wound: mild erythema at central port site, not tracking — continuing to observe. Tolerating 500mL oral water over the shift. Pain well-controlled with IV tramadol and regular paracetamol.', 'Dr. Chen', '2026-06-26T10:00:00.000Z'),
  (25, 'condition', 'Day 3 — infected necrosis, vasopressors added',       'CT abdomen (interval scan): walled-off necrosis expanding, now 7cm. CT-guided drain in situ — output 80mL dark fluid sent for MC&S. Vasopressor started day 3: noradrenaline 0.06 mcg/kg/min. APACHE II 18. Surgical team reviewing for endoscopic necrosectomy versus continued drainage. TPN day 3, tolerating well.', 'Dr. Chen', '2026-06-26T09:00:00.000Z'),
  (26, 'condition', 'Day 5 — AVR recovery on track, INR sub-therapeutic',  'Warfarin day 3: INR 1.8 — targeting 2.0–3.0. Bridging with LMWH until therapeutic. Wound healing well. Median sternotomy without complications. Cardiac physio: walked 50m on ward today. Appetite returning — tolerating full diet. Transthoracic echo at 48h post-op: prosthetic valve functioning well, no para-valvular leak.', 'Dr. Patel', '2026-06-26T10:00:00.000Z'),
  (27, 'condition', 'Day 1 — meningitis, sedation being lightened',        'GCS improving: 9 off sedation boluses (down from 7 on admission). Ceftriaxone day 1 continuing. Dexamethasone course day 1 of 4. Repeat CT head: no new hydrocephalus or herniation. CSF culture pending. Notifiable disease form submitted to Public Health England. Parents updated by consultant — extremely distressed.', 'Dr. Okafor', '2026-06-26T10:00:00.000Z'),
  (28, 'condition', 'Day 6 — wound improving, blood glucose controlled',   'Wound VAC changed today — granulation tissue forming, no further necrotic tissue identified. Vascular surgery: Doppler signals preserved, limb viable. Blood glucose 6.8–9.4 mmol/L on basal-bolus insulin. Swab result: MRSA negative — vancomycin stopped, continuing meropenem. Diabetes educator commenced patient counselling.', 'Dr. Chen', '2026-06-26T10:00:00.000Z'),
  (29, 'condition', 'Day 3 — ICH stable, BP controlled, no deterioration', 'Repeat CT head at 48h: no expansion of haematoma (stable 28mL). BP maintained: average 134/82mmHg on IV labetalol. GCS 11 — oriented to person and place. No clinical seizures. NIHSS performed: score 8 (moderate disability). Physiotherapy assessment: mobilising safely with two-person assist. Neurorehabilitation referral commenced.', 'Dr. Okafor', '2026-06-26T10:00:00.000Z'),
  (30, 'condition', 'Day 5 — GBS, IVIg complete, strength improving',      'IVIg 5-day course completed. Upper limb grip improving bilaterally — Medical Research Council grade 3/5. Lower limbs: 2/5. FVC 2.4L (up from 1.8L on admission) — above ventilatory threshold. Swallowing safe for normal diet. Daily physiotherapy: passive ranging and hydrotherapy planned. Rehab unit referral submitted.', 'Dr. Singh', '2026-06-26T10:00:00.000Z'),
  (31, 'condition', 'Day 2 post-eclampsia — BP improving, baby update',    'Magnesium sulphate course completed without seizure recurrence. BP now 138/86 on labetalol 200mg BD — within safe range. Proteinuria resolving. LFTs trending towards normal. Creatinine 82 (down from 124 peak). Patient visited SCBU — baby boy born at 34 weeks, 1.9kg, in incubator but stable. Breastfeeding support arranged.', 'Dr. Singh', '2026-06-26T09:00:00.000Z'),
  (32, 'condition', 'Day 4 — anoxic brain injury, EEG status review',      'EEG: burst suppression pattern continues — no electrographic seizure activity. GCS remains 3T. Propofol sedation lightened briefly: no purposeful movements to pain. Apnoea testing deferred pending family discussion of prognosis. Ethics consultation requested by team. Family (parents and partner) met with consultant and palliative care nurse today.', 'Dr. Okafor', '2026-06-26T10:00:00.000Z'),
  (33, 'condition', 'Day 6 — myasthenic crisis resolved, extubated Day 5','Patient extubated yesterday after successful spontaneous breathing trial. Tolerating oral diet with supervision — no aspiration events. Pyridostigmine oral regimen established. Prednisolone weaning plan commenced. Neurology outpatient follow-up arranged for 4 weeks. Discharge from ICU to general neurology ward planned for tomorrow.', 'Dr. Singh', '2026-06-26T10:00:00.000Z'),
  (34, 'condition', 'Day 3 post-op — SDH resolving, neuro improving',      'Post-operative CT at 24h: haematoma significantly reduced (residual 3mm). GCS 14 — mild confusion resolving. Craniotomy wound clean, no signs of infection. Mild headache managed with regular paracetamol. Dexamethasone weaning started. Neurosurgery review: satisfied with progress. HDU transfer booked for tomorrow morning.', 'Dr. Okafor', '2026-06-26T10:00:00.000Z'),
  (35, 'condition', 'Day 1 post-THR — mobilising well',                    'Physiotherapy day 1 post-operation: patient walked 15m with zimmer frame — excellent for Day 1. Wound drain removed — minimal output. Hip X-ray: prosthesis well-positioned. Pain well-controlled with oral analgesia. Enoxaparin commenced for VTE prophylaxis. Discharge target: Day 3 or 4 with community physio arranged.', 'Dr. Mitchell', '2026-06-26T09:00:00.000Z'),
  (36, 'condition', 'Day 3 — CAP improving, stepping down to oral ABx',    'Oxygen requirements down from 10L mask to 2L nasal cannula. Temperature 37.4°C (was 39.2°C on admission). CRP 124 (down from 380). Stepping down from IV to oral amoxicillin-clavulanate today. Good oral intake. Chest physio mobilising secretions. HDU monitoring to continue until off supplemental oxygen.', 'Dr. Mitchell', '2026-06-26T10:00:00.000Z'),
  (37, 'condition', 'Day 1 post-repair — observations stable, sipping',    'Post-operative laparoscopic colonic repair — patient comfortable. Sipping 200mL clear fluids. Abdomen soft and non-tender. IV antibiotics day 1 of 3. Catheter in situ — adequate urine output. Mild shoulder tip pain from CO2 — explained to patient. Plan: advance to free fluids tomorrow if tolerating.', 'Dr. Mitchell', '2026-06-26T10:00:00.000Z'),
  (38, 'condition', 'Day 2 — urosepsis responding to meropenem',           'Temperature 37.6°C (down from 39.4°C on admission). HR 80bpm (was 102). WBC 14 (down from 22 ×10⁹/L). Catheter in situ — urine now clearing. CT no abscess or obstruction confirmed. Blood cultures: E. coli (carbapenem-sensitive) — meropenem continues for 7-day course. Fluid balance positive 1.2L — patient rehydrating well.', 'Dr. Mitchell', '2026-06-26T09:00:00.000Z'),
  (39, 'condition', 'Day 2 — severe asthma improving on IV salbutamol',    'PEF now 65% predicted (was <30% on admission). SpO2 97% on 2L nasal cannula. Heliox providing subjective benefit per patient report. IV salbutamol to transition to nebulised salbutamol today. Magnesium sulphate given 1.5g IV on admission. Respiratory team reviewing for step-down to general ward.', 'Dr. Mitchell', '2026-06-26T09:00:00.000Z'),
  (40, 'condition', 'Day 3 — HHS resolving, glucose normalising',          'Blood glucose now 14 mmol/L (down from 48 mmol/L on admission). Osmolality 305 mOsm/kg (down from 348). Transitioning from IV insulin infusion to subcutaneous basal-bolus regimen. IV fluids reducing — patient now tolerating oral diet and fluids. Diabetes specialist nurse reviewed. HbA1c 13.2% — new T2DM diagnosis confirmed.', 'Dr. Mitchell', '2026-06-26T10:00:00.000Z');

-- ============================================================
-- TEST RESULTS
-- ============================================================
INSERT INTO test_results (patient_id, test_name, result_summary, result_status, tested_at, added_by, created_at) VALUES

  -- Patient 1: Margaret Wilson
  (1, 'Troponin I',              'Troponin I 0.08 ng/mL — mildly elevated, consistent with procedural myocardial injury post-catheterisation. Trending down.',                                                                                                                     'borderline', '2026-06-12 16:00', 'Dr. Patel',          '2026-06-12T17:00:00.000Z'),
  (1, 'Full Blood Count',        'Hb 12.4 g/dL, WBC 9.2 ×10⁹/L, Platelets 218 ×10⁹/L. Mild anaemia, otherwise within normal limits.',                                                                                                                                          'borderline', '2026-06-15 08:00', 'Nurse Martinez',     '2026-06-15T09:00:00.000Z'),
  (1, 'Urea & Electrolytes',     'Na 139 mmol/L, K 4.1 mmol/L, Urea 5.8 mmol/L, Creatinine 82 µmol/L, eGFR >60. All within normal range — renal function preserved.',                                                                                                          'normal',     '2026-06-22 08:00', 'Nurse Martinez',     '2026-06-22T09:00:00.000Z'),
  (1, 'C-Reactive Protein',      'CRP 18 mg/L — mildly elevated, expected post-procedural inflammation. Previously 32 mg/L on day 3. Trending down.',                                                                                                                            'borderline', '2026-06-24 08:00', 'Nurse Martinez',     '2026-06-24T09:00:00.000Z'),

  -- Patient 2: Robert Clarke
  (2, 'Full Blood Count',        'WBC 18.4 ×10⁹/L (Neutrophils 16.2 ×10⁹/L) — markedly elevated, indicating systemic infection. Hb 10.2 g/dL — moderate anaemia post-surgery. Platelets 410 ×10⁹/L.',                                                                        'elevated',   '2026-06-20 06:00', 'Nurse Rodriguez',    '2026-06-20T07:00:00.000Z'),
  (2, 'C-Reactive Protein',      'CRP 285 mg/L — significantly elevated, consistent with post-operative infection and bowel perforation. Serial monitoring ongoing.',                                                                                                              'elevated',   '2026-06-20 06:00', 'Nurse Rodriguez',    '2026-06-20T07:00:00.000Z'),
  (2, 'Blood Cultures (×2)',     'No growth at 48 hours — reassuring. Antibiotic cover appropriate. Source likely GI flora from perforation rather than primary bacteraemia.',                                                                                                    'normal',     '2026-06-19 20:00', 'Dr. Chen',           '2026-06-22T08:00:00.000Z'),
  (2, 'CT Abdomen & Pelvis',     'Post-operative changes consistent with Hartmann''s procedure. Small residual pelvic fluid collection — watchful waiting recommended. No free gas. Anastomosis not applicable (stoma). Report by Radiology: Dr. Hassan.',                       'borderline', '2026-06-22 14:00', 'Dr. Chen',           '2026-06-22T16:00:00.000Z'),

  -- Patient 3: Audrey Patel
  (3, 'CT Head (admission)',     'Left frontal contusion with surrounding vasogenic oedema. Midline shift 4mm to the right. No haemorrhage in posterior fossa. No hydrocephalus. No surgical lesion identified. Urgent neurosurgery review requested.',                           'elevated',   '2026-06-20 09:00', 'Dr. Okafor',         '2026-06-20T10:00:00.000Z'),
  (3, 'Coagulation Screen',      'PT 18.4 seconds (raised), APTT 46 seconds (raised), Fibrinogen 1.8 g/L (low). Traumatic coagulopathy. FFP administered. Recheck in 6 hours.',                                                                                                 'elevated',   '2026-06-20 10:00', 'Dr. Okafor',         '2026-06-20T11:00:00.000Z'),
  (3, 'Full Blood Count',        'Hb 10.8 g/dL — mild anaemia (trauma blood loss). WBC 14.2 ×10⁹/L — raised, stress response vs early infection. Platelets 162 ×10⁹/L.',                                                                                                       'borderline', '2026-06-21 06:00', 'Nurse Liu',          '2026-06-21T07:00:00.000Z'),
  (3, 'CT Head (day 4)',         'Stable compared to admission CT. No increase in contusion volume. Midline shift unchanged at 4mm. Oedema has not progressed. ICP probe in situ. Report: Dr. Hassan (Neuroradiology).',                                                          'borderline', '2026-06-24 06:00', 'Dr. Okafor',         '2026-06-24T08:00:00.000Z'),

  -- Patient 4: Frank Huang
  (4, 'Troponin T (high-sens)',  'hs-TnT 2.8 ng/mL on admission — markedly elevated, confirming significant myocardial injury. Re-check at 3h: 3.4 ng/mL (rising). Consistent with STEMI.',                                                                                    'elevated',   '2026-06-22 10:00', 'Dr. Patel',          '2026-06-22T11:00:00.000Z'),
  (4, '12-Lead ECG',             'ST elevation in leads II, III, aVF with reciprocal ST depression in I, aVL. Rate 82 bpm. Inferior STEMI pattern. Taken immediately to catheter lab.',                                                                                           'elevated',   '2026-06-22 10:30', 'Dr. Patel',          '2026-06-22T10:30:00.000Z'),
  (4, 'Echocardiogram',          'EF 38% (mildly reduced). Inferior and inferolateral wall hypokinesis consistent with RCA territory infarct. No pericardial effusion. No significant valvular disease. Left atrium mildly dilated.',                                             'borderline', '2026-06-23 11:00', 'Dr. Patel',          '2026-06-23T12:00:00.000Z'),
  (4, 'Lipid Profile',           'Total cholesterol 6.8 mmol/L, LDL 4.6 mmol/L, HDL 0.9 mmol/L, Triglycerides 2.2 mmol/L. Elevated LDL — high-intensity statin commenced. Lifestyle advice given.',                                                                            'elevated',   '2026-06-23 06:00', 'Nurse Martinez',     '2026-06-23T07:00:00.000Z'),

  -- Patient 5: Dorothy Kowalski
  (5, 'Chest X-ray',             'Right lower lobe consolidation with air bronchograms. No pneumothorax. No pleural effusion. Appearances consistent with lobar pneumonia. Left lung clear.',                                                                                     'elevated',   '2026-06-19 11:00', 'Dr. Sarah Mitchell', '2026-06-19T12:00:00.000Z'),
  (5, 'C-Reactive Protein',      'CRP 348 mg/L on admission — severely elevated, consistent with severe sepsis. Will use as serial marker of response to treatment.',                                                                                                             'elevated',   '2026-06-19 12:00', 'Dr. Sarah Mitchell', '2026-06-19T13:00:00.000Z'),
  (5, 'Procalcitonin',           'Procalcitonin 28.4 ng/mL — markedly elevated, strongly indicative of bacterial sepsis. Supports continuation of IV antibiotics. Repeat in 48–72 hours to guide de-escalation.',                                                                'elevated',   '2026-06-19 12:00', 'Dr. Sarah Mitchell', '2026-06-19T13:00:00.000Z'),
  (5, 'Blood Cultures (×2)',     'Streptococcus pneumoniae isolated — sensitive to amoxicillin and penicillin G. Antibiotic regimen rationalised. Infectious diseases team notified. Pathogen confirmed at 48 hours.',                                                            'borderline', '2026-06-19 11:30', 'Dr. Sarah Mitchell', '2026-06-21T10:00:00.000Z'),

  -- Patient 6: Thomas Osei
  (6, 'Full Blood Count',        'WBC 11.8 ×10⁹/L (Neutrophils 9.4 ×10⁹/L) — mildly elevated post-operatively, expected. Hb 13.2 g/dL, Platelets 245 ×10⁹/L. No concerning findings.',                                                                                       'borderline', '2026-06-23 12:00', 'Nurse Rodriguez',    '2026-06-23T13:00:00.000Z'),
  (6, 'C-Reactive Protein',      'CRP 62 mg/L — moderately elevated post-operatively. Expected inflammatory response to surgery. No clinical signs of ongoing infection. Trending down from 88 mg/L on day of surgery.',                                                          'elevated',   '2026-06-24 06:00', 'Nurse Rodriguez',    '2026-06-24T07:00:00.000Z'),
  (6, 'Urea & Electrolytes',     'Na 137 mmol/L, K 3.8 mmol/L, Urea 4.2 mmol/L, Creatinine 74 µmol/L — all within normal limits. Well hydrated post-operatively.',                                                                                                             'normal',     '2026-06-24 06:00', 'Nurse Rodriguez',    '2026-06-24T07:00:00.000Z'),

  -- Patient 7: Patricia Murray
  (7, 'Chest X-ray',             'Bilateral diffuse alveolar opacification — "white-out" appearances bilaterally consistent with severe ARDS. No pneumothorax. ETT in correct position. Lines and drains appropriately placed.',                                                  'elevated',   '2026-06-21 15:00', 'Dr. Okafor',         '2026-06-21T16:00:00.000Z'),
  (7, 'Arterial Blood Gas (admission)','pH 7.24, PaO2 58mmHg (FiO2 60%), PaCO2 55mmHg, Lactate 3.8 mmol/L. Severe hypoxaemia. P/F ratio 97. Metabolic and respiratory acidosis. Ventilator settings adjusted.',                                                                'elevated',   '2026-06-22 06:00', 'Nurse Liu',          '2026-06-22T07:00:00.000Z'),
  (7, 'BAL Culture',             'Bronchoalveolar lavage: Streptococcus pneumoniae grown — heavy growth. Sensitive to co-amoxiclav and ceftriaxone. Antibiotic therapy appropriate. Viral PCR panel negative.',                                                                   'borderline', '2026-06-22 16:00', 'Dr. Okafor',         '2026-06-23T10:00:00.000Z'),
  (7, 'Arterial Blood Gas (day 4)','pH 7.31, PaO2 70mmHg (FiO2 60%), PaCO2 48mmHg, Lactate 1.4 mmol/L. Marginal improvement in gas exchange. P/F ratio 117. Acidosis partially corrected. Proning contributing to improvement.',                                               'elevated',   '2026-06-25 06:00', 'Nurse Liu',          '2026-06-25T07:00:00.000Z'),

  -- Patient 8: Henry Blackwell
  (8, 'Arterial Blood Gas',      'pH 7.32, pCO2 62mmHg, pO2 58mmHg on 28% O2, Bicarbonate 28 mmol/L. Type 2 respiratory failure with compensated respiratory acidosis. Controlled oxygen therapy commenced. NIV considered if no improvement.',                                  'elevated',   '2026-06-24 11:00', 'Dr. Sarah Mitchell', '2026-06-24T12:00:00.000Z'),
  (8, 'Chest X-ray',             'Hyperinflated lungs with flattened hemidiaphragms — consistent with known COPD. No new consolidation. No pneumothorax. Mild perihilar haziness. No pleural effusion.',                                                                          'borderline', '2026-06-24 11:30', 'Dr. Sarah Mitchell', '2026-06-24T12:30:00.000Z'),
  (8, 'Full Blood Count',        'WBC 12.4 ×10⁹/L — mildly elevated, supporting infective exacerbation. Hb 14.2 g/dL (polycythaemia likely from chronic hypoxia). CRP 45 mg/L.',                                                                                               'borderline', '2026-06-24 11:00', 'Dr. Sarah Mitchell', '2026-06-24T12:00:00.000Z'),

  -- Patient 9: Mei-Ling Chen
  (9, 'Venous Blood Gas (admission)','pH 7.16, Bicarbonate 9 mmol/L, Ketones 5.8 mmol/L, Glucose 28.4 mmol/L — severe diabetic ketoacidosis. Hypokalaemia (K 2.9 mmol/L). DKA protocol commenced immediately.',                                                                'elevated',   '2026-06-17 10:00', 'Dr. Singh',          '2026-06-17T11:00:00.000Z'),
  (9, 'HbA1c',                   'HbA1c 12.4% — severely elevated, indicating poor glycaemic control over preceding 3 months. Diabetes nurse specialist review and education required prior to discharge.',                                                                        'elevated',   '2026-06-17 10:00', 'Dr. Singh',          '2026-06-17T11:00:00.000Z'),
  (9, 'Venous Blood Gas (day 3)','pH 7.30, Bicarbonate 17 mmol/L, Ketones 1.4 mmol/L, Glucose 12.8 mmol/L — DKA resolving. Potassium now 3.6 mmol/L with replacement. Continue IV insulin infusion.',                                                                          'borderline', '2026-06-19 06:00', 'Nurse Martinez',     '2026-06-19T07:00:00.000Z'),
  (9, 'Venous Blood Gas (day 6)','pH 7.38, Bicarbonate 22 mmol/L, Ketones 0.4 mmol/L, Glucose 9.2 mmol/L — DKA fully resolved. Safe to switch to subcutaneous insulin regimen.',                                                                                               'normal',     '2026-06-23 06:00', 'Nurse Martinez',     '2026-06-23T07:00:00.000Z'),

  -- Patient 10: James O'Brien
  (10, '12-Lead ECG',            'VF on initial rhythm strip — defibrillated ×2 pre-hospital. Post-ROSC ECG: sinus rhythm, rate 54 bpm. ST elevation V1–V4 with Q-waves developing — anterior STEMI likely. Urgent cardiology review.',                                          'elevated',   '2026-06-25 07:00', 'Dr. Patel',          '2026-06-25T07:30:00.000Z'),
  (10, 'Troponin I (high-sens)', 'hs-TnI 18.4 ng/mL — markedly elevated. Confirms significant myocardial injury. ACS as trigger for cardiac arrest strongly suspected. Coronary angiography planned tomorrow.',                                                                   'elevated',   '2026-06-25 07:00', 'Dr. Patel',          '2026-06-25T08:00:00.000Z'),
  (10, 'CT Head',                'No intracranial haemorrhage. No space-occupying lesion. Generalised cerebral oedema consistent with global hypoxic-ischaemic injury post-cardiac arrest. Neuroradiology report: Dr. Hassan.',                                                   'borderline', '2026-06-25 08:00', 'Dr. Okafor',         '2026-06-25T09:00:00.000Z'),
  (10, 'Arterial Blood Gas',     'pH 7.22, Lactate 6.8 mmol/L, pO2 88mmHg (FiO2 40%), pCO2 48mmHg — significant lactic acidosis post-arrest. Serial monitoring. Lactate falling with resuscitation (4.2 mmol/L at 2 hours).',                                                 'elevated',   '2026-06-25 07:30', 'Dr. Okafor',         '2026-06-25T08:00:00.000Z'),

  -- Patient 11: Bernard Walsh (post-CABG)
  (11, 'Full Blood Count',        'Hb 10.8 g/dL (post-operative haemodilution, improving). WBC 11.4 ×10⁹/L (normal post-operative rise). Platelets 142 ×10⁹/L. No transfusion threshold met.', 'borderline', '2026-06-24 08:00', 'Nurse Martinez',     '2026-06-24T09:00:00.000Z'),
  (11, 'Troponin I (post-CABG)', 'Troponin I 2.8 ng/mL — expected release post-cardiopulmonary bypass. No evidence of peri-operative MI. Trending down on repeat at 24 hours (1.2 ng/mL).', 'borderline', '2026-06-23 18:00', 'Dr. Patel',          '2026-06-23T19:00:00.000Z'),
  (11, 'Chest X-Ray',            'PA erect. Post-operative appearances: mild bilateral basal atelectasis. No pneumothorax. Chest drain in situ (right). Sternal wires intact. Heart size within normal limits.', 'normal',     '2026-06-24 08:00', 'Dr. Patel',          '2026-06-24T09:00:00.000Z'),

  -- Patient 12: Fatima Al-Rashid (post-stroke)
  (12, 'CT Head (admission)',     'No acute intracranial haemorrhage. No established infarct visible (early ischaemia not yet CT-evident). Prominent right MCA territory sulcal effacement. Thrombolysis proceeded.', 'borderline', '2026-06-21 07:30', 'Dr. Singh',          '2026-06-21T08:00:00.000Z'),
  (12, 'CT Head (24h post-lysis)','No haemorrhagic transformation. Evolving right MCA infarct now visible — cortical ribbon sign frontoparietal region. No midline shift. No oedema requiring intervention.', 'borderline', '2026-06-22 08:00', 'Dr. Singh',          '2026-06-22T09:00:00.000Z'),
  (12, 'MRI Brain (DWI)',        'Right MCA territory DWI restriction: frontoparietal region approximately 4.2cm × 2.8cm. Broca area involvement explains expressive aphasia. No posterior circulation involvement.', 'elevated',   '2026-06-23 10:00', 'Dr. Singh',          '2026-06-23T11:00:00.000Z'),

  -- Patient 13: Nkechi Adeyemi (acute liver failure)
  (13, 'Liver Function Tests',    'ALT 4,820 U/L (markedly elevated). AST 3,940 U/L. Bilirubin 88 μmol/L. ALP 124 U/L. Albumin 28 g/L. Pattern consistent with acute hepatocellular necrosis.', 'elevated',   '2026-06-24 07:00', 'Dr. Okafor',         '2026-06-24T08:00:00.000Z'),
  (13, 'Coagulation Screen',      'INR 3.8 — significantly prolonged (King''s College criteria met: INR >3.5 at 48h). PT 42 seconds. APTT 68 seconds. Vitamin K administered. Repeat INR 2.4 at 36 hours.', 'elevated',   '2026-06-24 07:00', 'Dr. Okafor',         '2026-06-24T08:00:00.000Z'),
  (13, 'Paracetamol Level',       'Serum paracetamol 68 mg/L — above treatment line on Rumack-Matthew nomogram. Confirms paracetamol-induced hepatotoxicity. N-acetylcysteine commenced immediately.', 'elevated',   '2026-06-24 07:00', 'Dr. Chen',           '2026-06-24T08:00:00.000Z'),

  -- Patient 14: Viktor Novak (MODS post-AAA)
  (14, 'CT-Aortogram',            'Ruptured infrarenal AAA, maximum diameter 8.2cm with retroperitoneal haematoma extending to right iliac fossa. No involvement of renal arteries. Emergency EVAR candidate — IR team notified.',  'elevated',   '2026-06-22 04:00', 'Dr. Chen',           '2026-06-22T05:00:00.000Z'),
  (14, 'Renal Function',          'Creatinine 486 μmol/L (AKI Stage 3). eGFR 9 mL/min. Urea 28.4 mmol/L. Potassium 6.1 mmol/L — managed with calcium gluconate and salbutamol nebulisers. CRRT indicated.', 'elevated',   '2026-06-23 06:00', 'Dr. Chen',           '2026-06-23T07:00:00.000Z'),

  -- Patient 15: Saoirse Brennan (post-neurosurgery)
  (15, 'MRI Brain (post-op)',     'Post-operative MRI at 48 hours: no residual tumour identified at operative site. Small volume of expected post-operative haematoma within craniotomy bed. No hydrocephalus. Surrounding oedema mild.', 'normal', '2026-06-22 09:00', 'Dr. Okafor',         '2026-06-22T10:00:00.000Z'),
  (15, 'Histopathology',          'Meningioma WHO Grade I (Fibrous/Transitional pattern). Ki-67 proliferation index 2%. Complete excision margins confirmed. No atypical features. Recurrence risk low — 5-year MRI surveillance recommended.', 'normal', '2026-06-25 14:00', 'Dr. Okafor',        '2026-06-25T15:00:00.000Z'),

  -- Patient 16: Hassan Ibrahim (spinal injury)
  (16, 'MRI C-Spine',             'C5/C6 fracture-dislocation. Approximately 40% loss of vertebral height at C5. No epidural haematoma. Cord shows T2 signal change at C5/C6 level — consistent with incomplete cord contusion. No cord transection.', 'elevated', '2026-06-23 12:00', 'Dr. Okafor',   '2026-06-23T13:00:00.000Z'),
  (16, 'CT C-Spine',              'C5/C6 fracture confirmed. Facet joint subluxation right >left. No other cervical level involvement. Bony fragments not compressing canal. Rigid collar applied. Neurosurgery review requested.', 'elevated',   '2026-06-23 06:00', 'Dr. Singh',          '2026-06-23T07:00:00.000Z'),

  -- Patient 17: Eleanor Fitzgerald (post-cholecystectomy)
  (17, 'Abdominal USS',           'Distended gallbladder with multiple calculi (largest 1.4cm). Wall thickening 6mm with pericholecystic fluid — features of acute cholecystitis. CBD diameter 5mm — no choledocholithiasis. Spleen and liver normal.', 'elevated', '2026-06-25 08:00', 'Dr. Mitchell',    '2026-06-25T09:00:00.000Z'),
  (17, 'Intra-op Cholangiogram',  'CBD filled normally. No filling defect. No bile duct injury. Normal anatomy confirmed. No need for exploration or ERCP.', 'normal',     '2026-06-25 11:30', 'Dr. Mitchell',     '2026-06-25T12:00:00.000Z'),

  -- Patient 18: Marcus Thompson (syncope)
  (18, 'Holter Monitor (48h)',    'Holter monitoring 2026-06-24 to 2026-06-26: sinus rhythm throughout. Minimum rate 48 bpm (nocturnal). Maximum rate 114 bpm (exertion). No sustained arrhythmia. One brief episode of sinus pauses (1.8s) but not symptomatic. No indication for pacing.', 'normal', '2026-06-26 09:00', 'Dr. Patel',      '2026-06-26T10:00:00.000Z'),
  (18, 'Echocardiogram',          'Good LV function, EF 60%. No wall motion abnormality. Mild mitral regurgitation (trivial). Normal right heart pressures. No significant valvular disease. No structural explanation for syncope — supports vasovagal/orthostatic aetiology.', 'normal', '2026-06-25 09:00', 'Dr. Patel',       '2026-06-25T10:00:00.000Z'),

  -- Patients 19–40 (one key result each)
  (19, 'Blood Cultures',          'Gram-negative bacteraemia: E. coli ESBL isolated. Sensitive to meropenem, resistant to co-amoxiclav and cefuroxime. Antimicrobial stewardship review: switch to meropenem recommended.', 'elevated', '2026-06-25 08:00', 'Dr. Patel', '2026-06-25T10:00:00.000Z'),
  (20, 'CT Pulmonary Angiogram', 'Bilateral pulmonary emboli — right main pulmonary artery and multiple segmental branches. Right ventricular dilatation with interventricular septal flattening (D-sign). Confirmatory of submassive PE. No pulmonary infarction.', 'elevated', '2026-06-24 09:00', 'Dr. Singh', '2026-06-24T10:00:00.000Z'),
  (21, 'Chest X-Ray (Day 3)',    'Bilateral rib fractures 3–8 visible. Right chest drain in satisfactory position. Improving aeration bilaterally compared to admission — resolving haemo-pneumothorax. No new consolidation. Left lower zone remains slightly hazy.', 'borderline', '2026-06-26 08:00', 'Dr. Mitchell', '2026-06-26T09:00:00.000Z'),
  (22, 'Bronchial Lavage MC&S',  'BAL culture: Staphylococcus aureus (MSSA) — abundant growth. Sensitive to flucloxacillin. Switching from piperacillin-tazobactam to flucloxacillin 2g IV QDS per microbiology advice. Repeat BAL to be sent at day 5.', 'elevated', '2026-06-25 10:00', 'Dr. Mitchell', '2026-06-25T11:00:00.000Z'),
  (23, 'Troponin I (serial)',    'Post-CABG day 1 troponin I 3.2 ng/mL — expected post-bypass release. Day 3 repeat: 0.6 ng/mL — appropriately declining. No evidence of peri-operative myocardial infarction. Cardiology satisfied.', 'borderline', '2026-06-25 08:00', 'Dr. Patel', '2026-06-25T09:00:00.000Z'),
  (24, 'Full Blood Count',       'Hb 10.4 g/dL — post-operative anaemia. WBC 13.8 ×10⁹/L (appropriate surgical response). Platelets 188 ×10⁹/L. CRP 228 mg/L — improving. No transfusion indicated at current level.', 'borderline', '2026-06-26 08:00', 'Dr. Chen', '2026-06-26T09:00:00.000Z'),
  (25, 'Serum Amylase/Lipase',  'Amylase 2,840 U/L (very high — pancreatitis confirmed). Lipase 6,120 U/L. CRP 480 mg/L. CT Severity Index (Balthazar E): 8/10 — severe necrotising pancreatitis with >50% gland necrosis. Multidisciplinary HPB meeting requested.', 'elevated', '2026-06-23 08:00', 'Dr. Chen', '2026-06-23T09:00:00.000Z'),
  (26, 'INR (post-AVR)',         'INR 1.8 — below target range (2.0–3.0) for bioprosthetic valve. Warfarin dose increased: 3mg → 4mg tonight. Repeat INR tomorrow morning. LMWH bridging continues until INR ≥2.0 for 2 consecutive days.', 'borderline', '2026-06-26 08:00', 'Dr. Patel', '2026-06-26T09:00:00.000Z'),
  (27, 'CSF Analysis',           'Appearance: turbid. Opening pressure 28 cmH2O. White cells: 3,800 /mm³ (98% polymorphs). Protein 4.2 g/L (high). Glucose 1.1 mmol/L vs plasma 6.4 (low ratio). Gram stain: Gram-negative diplococci. PCR: Neisseria meningitidis group B confirmed.', 'elevated', '2026-06-25 07:00', 'Dr. Okafor', '2026-06-25T08:00:00.000Z'),
  (28, 'Wound Swab MC&S',        'Deep wound swab: mixed growth. E. coli ESBL (predominant). Staphylococcus aureus (MSSA). MRSA screen: NEGATIVE. Pseudomonas absent. Antimicrobial stewardship: continue meropenem, vancomycin stopped.', 'elevated', '2026-06-22 08:00', 'Dr. Chen', '2026-06-22T09:00:00.000Z'),
  (29, 'CT Head (48h repeat)',   'Intracerebral haematoma: stable 28mL in left basal ganglia. No expansion compared to admission CT. Surrounding oedema mild — no midline shift. Ventricles not enlarged. Neurosurgery not indicated at this time.', 'borderline', '2026-06-25 10:00', 'Dr. Okafor', '2026-06-25T11:00:00.000Z'),
  (30, 'Nerve Conduction Studies','Motor nerve conduction: reduced amplitudes and prolonged distal latencies in all four limbs — demyelinating pattern consistent with AIDP (Guillain-Barré). Sensory NCS: mildly reduced amplitudes. F-waves: absent bilaterally. Supportive of GBS diagnosis.', 'elevated', '2026-06-22 10:00', 'Dr. Singh', '2026-06-22T11:00:00.000Z'),
  (31, 'Urine Protein:Creatinine','Urine P:CR 480 mg/mmol — severe proteinuria consistent with pre-eclampsia/eclampsia. 24h protein estimation 5.8g (>5g = severe). Renal function: creatinine 124 μmol/L, improving. Serial monitoring commenced.', 'elevated', '2026-06-24 10:00', 'Dr. Singh', '2026-06-24T11:00:00.000Z'),
  (32, 'EEG (continuous)',       'Continuous EEG monitoring: burst suppression pattern throughout. No discrete seizures on EEG. Background rhythm severely abnormal — very poor prognostic indicator post-anoxic injury. Neurophysiology report filed.', 'elevated', '2026-06-23 10:00', 'Dr. Okafor', '2026-06-23T11:00:00.000Z'),
  (33, 'Anti-AChR Antibodies',   'Acetylcholine receptor antibodies: strongly positive (12.4 nmol/L, ref <0.4). Confirms seropositive myasthenia gravis as cause of myasthenic crisis. CT thorax: no thymoma identified. Neurology — long-term management plan to be arranged.', 'elevated', '2026-06-21 10:00', 'Dr. Singh', '2026-06-21T11:00:00.000Z'),
  (34, 'CT Head (post-op)',      'Post-burr hole drainage CT: right subdural haematoma significantly reduced — 3mm residual collection. Midline shift resolved. No new intracranial pathology. Brain parenchyma appears uninjured. Good operative result.', 'normal', '2026-06-24 10:00', 'Dr. Okafor', '2026-06-24T11:00:00.000Z'),
  (35, 'Hip X-Ray (post-op)',    'AP pelvis and lateral hip X-ray: cemented total hip replacement in satisfactory position. Femoral stem alignment within 2° of neutral. Acetabular component well-seated. No fracture or dislocation. Radiologist satisfied with result.', 'normal', '2026-06-25 12:00', 'Dr. Mitchell', '2026-06-25T13:00:00.000Z'),
  (36, 'Full Blood Count + CRP', 'WBC 14 ×10⁹/L (down from 22). CRP 124 mg/L (down from 380 on admission). Hb 11.4 g/dL. Improving trend consistent with antibiotic response. Urinary pneumococcal antigen: positive. Chest X-ray: right lower lobe consolidation with early clearing.', 'borderline', '2026-06-26 08:00', 'Dr. Mitchell', '2026-06-26T09:00:00.000Z'),
  (37, 'Intra-op Colonoscopy Finding','Sigmoid perforation: 5mm anterior perforation at 30cm from anal verge, likely from polypectomy diathermy site (polyp removed by referring endoscopist 48h prior). Primary laparoscopic repair performed — satisfactory closure confirmed intra-operatively.', 'elevated', '2026-06-25 11:00', 'Dr. Mitchell', '2026-06-25T12:00:00.000Z'),
  (38, 'Urine MC&S',             'Urine: >10⁸ colony-forming units/mL of E. coli. Extended-spectrum beta-lactamase (ESBL) producer. Sensitive: meropenem, ertapenem. Resistant: co-amoxiclav, trimethoprim, ciprofloxacin. Meropenem continues — correct antibiotic therapy confirmed.', 'elevated', '2026-06-24 10:00', 'Dr. Mitchell', '2026-06-24T11:00:00.000Z'),
  (39, 'Peak Expiratory Flow',   'PEF on admission: 110 L/min (<30% predicted — severe/near-fatal). PEF at 24h: 230 L/min (62% predicted). PEF at 48h: 290 L/min (78% predicted — improving significantly). Serial monitoring 4-hourly. Target: PEF ≥75% for two consecutive readings before step-down.', 'borderline', '2026-06-26 08:00', 'Dr. Mitchell', '2026-06-26T09:00:00.000Z'),
  (40, 'Blood Glucose + Osmolality','Blood glucose 14 mmol/L (down from 48 mmol/L on admission). Serum osmolality 305 mOsm/kg (down from 348 — approaching normal). Sodium 138 mmol/L (corrected). Ketones: negative. Bicarbonate 22 mmol/L — no acidosis. HbA1c 13.2% — confirms prolonged severe hyperglycaemia.', 'borderline', '2026-06-26 08:00', 'Dr. Mitchell', '2026-06-26T09:00:00.000Z');

-- ============================================================
-- MESSAGES  (5 active threads — family ↔ staff)
-- ============================================================
INSERT INTO messages (patient_name, ward, sender_id, sender_name, sender_role, content, created_at) VALUES

  -- Thread: Margaret Wilson — Sarah Thompson ↔ Dr. Sarah Mitchell
  ('Margaret Wilson', 'ICU Ward A', 69, 'Sarah Thompson',     'family', 'Hello, I just wanted to check in — how is Mum doing today? The last nurse who called said her heart rate was coming down nicely.',                                                                                                                             '2026-06-22T10:00:00.000Z'),
  ('Margaret Wilson', 'ICU Ward A', 1,  'Dr. Sarah Mitchell', 'staff',  'Hi Sarah, great to hear from you. Margaret is doing really well. Her heart rate has been between 76 and 80 all day, and her blood pressure is spot on target. She''s been up for a short walk with the physiotherapist this morning too.',                      '2026-06-22T11:30:00.000Z'),
  ('Margaret Wilson', 'ICU Ward A', 69, 'Sarah Thompson',     'family', 'That''s such a relief! She loves walking. Is she eating? She can be stubborn about food when she''s not feeling herself.',                                                                                                                                        '2026-06-22T12:00:00.000Z'),
  ('Margaret Wilson', 'ICU Ward A', 1,  'Dr. Sarah Mitchell', 'staff',  'Ha, yes — we have noticed! She negotiated with Nurse Martinez this morning about whether she had to finish the porridge. She''s eating most of her meals though, which is what matters. Appetite is definitely returning.',                                         '2026-06-22T13:45:00.000Z'),
  ('Margaret Wilson', 'ICU Ward A', 69, 'Sarah Thompson',     'family', 'That sounds exactly like her! We have a visit booked for tomorrow. Is there anything we should bring? And is there anything we shouldn''t say — about her condition or the future?',                                                                              '2026-06-23T08:00:00.000Z'),
  ('Margaret Wilson', 'ICU Ward A', 1,  'Dr. Sarah Mitchell', 'staff',  'Please bring her reading glasses if you have them — she''s been asking! As for conversation, Margaret is fully aware of her diagnosis and the stent procedure. You can speak freely. We aim for discharge in the next 2–3 days if progress continues.',             '2026-06-23T09:30:00.000Z'),
  ('Margaret Wilson', 'ICU Ward A', 69, 'Sarah Thompson',     'family', 'That is wonderful news about the discharge. We will sort out her room at home — she''ll need the ground floor for a while. Thank you so much for looking after her so well.',                                                                                     '2026-06-23T10:00:00.000Z'),
  ('Margaret Wilson', 'ICU Ward A', 1,  'Dr. Sarah Mitchell', 'staff',  'You''re very welcome. Making sure the home environment is ready is a great idea. Our discharge coordinator can also help with any equipment or community support needs. See you tomorrow on your visit.',                                                           '2026-06-23T11:00:00.000Z'),

  -- Thread: Robert Clarke — Emily Clarke ↔ Nurse David Chen
  ('Robert Clarke', 'ICU Ward B', 4,  'Emily Clarke',      'family', 'Hi, I''m Robert''s daughter Emily. I was told to use this to ask questions between visits. How is Dad doing after the surgery? We''re all very worried.',                                                                                                          '2026-06-20T14:00:00.000Z'),
  ('Robert Clarke', 'ICU Ward B', 3,  'Nurse David Chen',  'staff',  'Hello Emily, thank you for reaching out. Robert is stable following surgery. He''s resting comfortably and his pain is being managed with medication. The surgical team is very happy with how the operation went. We''ll continue monitoring him closely.',           '2026-06-20T15:30:00.000Z'),
  ('Robert Clarke', 'ICU Ward B', 4,  'Emily Clarke',      'family', 'Thank you. His wife is beside herself with worry. Can you tell us — is the colostomy permanent? The surgeon mentioned it briefly but it was a lot to take in at once.',                                                                                              '2026-06-20T16:00:00.000Z'),
  ('Robert Clarke', 'ICU Ward B', 3,  'Nurse David Chen',  'staff',  'That''s a really important question and I want to make sure you get the right answer. The surgical team intend to reverse the colostomy in 3–6 months once Robert has fully recovered. It is not expected to be permanent. The consultant will discuss this with you in detail on your next visit.',  '2026-06-20T17:00:00.000Z'),
  ('Robert Clarke', 'ICU Ward B', 4,  'Emily Clarke',      'family', 'That''s a huge relief, thank you. One more thing — he was talking about his dog yesterday on the phone. Would it be possible to bring a photo to put by his bed?',                                                                                                   '2026-06-22T09:00:00.000Z'),
  ('Robert Clarke', 'ICU Ward B', 3,  'Nurse David Chen',  'staff',  'Absolutely — photos are very welcome and make a real difference to patients. Please bring it along on your next approved visit. We can stick it up where he can see it from his bed.',                                                                                '2026-06-22T10:00:00.000Z'),

  -- Thread: Dorothy Kowalski — Josef Kowalski ↔ Dr. Sarah Mitchell
  ('Dorothy Kowalski', 'ICU Ward A', 8,  'Josef Kowalski',     'family', 'Good morning. I am Dorothy''s husband Josef. I was told I could send a message here. She was very ill when she came in — is she getting better? They said something about her blood — bacteria?',                                                               '2026-06-21T09:00:00.000Z'),
  ('Dorothy Kowalski', 'ICU Ward A', 1,  'Dr. Sarah Mitchell', 'staff',  'Good morning Josef. Thank you for getting in touch. Dorothy is seriously unwell but she is responding to treatment. We found a bacteria called Streptococcus pneumoniae in her blood — this is the cause of the infection. We have the right antibiotics to treat it and she is improving slowly but steadily.',  '2026-06-21T10:30:00.000Z'),
  ('Dorothy Kowalski', 'ICU Ward A', 8,  'Josef Kowalski',     'family', 'Thank you doctor. She recognised me on my visit yesterday which was a wonderful moment. She squeezed my hand. Is the breathing machine still needed?',                                                                                                           '2026-06-23T08:30:00.000Z'),
  ('Dorothy Kowalski', 'ICU Ward A', 1,  'Dr. Sarah Mitchell', 'staff',  'How wonderful that she recognised you — that is a very positive sign. Dorothy is breathing on her own with some oxygen support through a mask. She is not on a breathing machine. Her oxygen requirement has come down from 8 litres to 2 litres per minute since admission, which is significant progress.',  '2026-06-23T10:00:00.000Z'),
  ('Dorothy Kowalski', 'ICU Ward A', 8,  'Josef Kowalski',     'family', 'This is wonderful news. I will tell the children. She was asking for her cardigan and her rosary beads — can I bring them in?',                                                                                                                                  '2026-06-25T07:30:00.000Z'),
  ('Dorothy Kowalski', 'ICU Ward A', 1,  'Dr. Sarah Mitchell', 'staff',  'Yes please do bring them — personal comfort items are very important. The cardigan especially will be appreciated as our ward can feel quite cool. We look forward to seeing you at your 09:30 visit today. Dorothy is having a better morning.',                  '2026-06-25T08:30:00.000Z'),

  -- Thread: Mei-Ling Chen — Lily Chen ↔ Dr. Sarah Mitchell
  ('Mei-Ling Chen', 'ICU Ward A', 11, 'Lily Chen',          'family', 'Hi, I''m Lily, Mei-Ling''s daughter. We were shocked when she was admitted — she''d been a bit unwell but we didn''t realise how serious it was. Is she going to be okay?',                                                                                       '2026-06-18T14:00:00.000Z'),
  ('Mei-Ling Chen', 'ICU Ward A', 1,  'Dr. Sarah Mitchell', 'staff',  'Hello Lily, I''m so glad you reached out. Mei-Ling has what''s called diabetic ketoacidosis — a serious complication of diabetes where the blood becomes too acidic. We caught it in time and she is on the right treatment. I expect her to recover fully.',       '2026-06-18T15:30:00.000Z'),
  ('Mei-Ling Chen', 'ICU Ward A', 11, 'Lily Chen',          'family', 'Thank you. She was diagnosed with diabetes years ago but I don''t think she was managing it well at home. Can we do anything to help when she comes home?',                                                                                                        '2026-06-19T09:00:00.000Z'),
  ('Mei-Ling Chen', 'ICU Ward A', 1,  'Dr. Sarah Mitchell', 'staff',  'That''s a really important question. Before discharge, our diabetes specialist nurse will spend time with both Mei-Ling and family members going through her new insulin regime, diet, and early warning signs to watch for. Your involvement at home will make a real difference to preventing this happening again.', '2026-06-19T11:00:00.000Z'),
  ('Mei-Ling Chen', 'ICU Ward A', 11, 'Lily Chen',          'family', 'She''s much brighter today — was laughing on the phone this morning! When do you think she might come home?',                                                                                                                                                      '2026-06-24T10:00:00.000Z'),
  ('Mei-Ling Chen', 'ICU Ward A', 1,  'Dr. Sarah Mitchell', 'staff',  'I''m so pleased to hear that! Mei-Ling has made excellent progress — her blood sugars are stable on her new insulin regime and she is eating well. We are planning for discharge tomorrow, all being well. The diabetes nurse appointment is already arranged for 2 weeks time.', '2026-06-24T11:30:00.000Z'),

  -- Thread: Frank Huang — Grace Huang ↔ Nurse David Chen
  ('Frank Huang', 'HDU', 7,  'Grace Huang',      'family', 'Hello, this is Grace, Frank''s wife. He has just been moved from the ICU to the HDU — the nurses said this is a good sign? I just want to make sure I understand what''s happening.',                                                                                          '2026-06-22T20:00:00.000Z'),
  ('Frank Huang', 'HDU', 3,  'Nurse David Chen', 'staff',  'Hello Grace, yes — moving to HDU (the High Dependency Unit) is definitely a positive step. It means Frank''s condition has stabilised enough that he no longer needs the most intensive level of monitoring. He is doing well.',                                               '2026-06-22T21:00:00.000Z'),
  ('Frank Huang', 'HDU', 7,  'Grace Huang',      'family', 'That is such a relief. He called me himself this evening — the first time since the heart attack. He sounded tired but like himself. What happens next?',                                                                                                                        '2026-06-23T19:00:00.000Z'),
  ('Frank Huang', 'HDU', 3,  'Nurse David Chen', 'staff',  'That''s a lovely sign — being able to call home independently is a great milestone! Over the next couple of days the cardiology team will finalise his medications, and physiotherapy will work with him on gentle activity. We''re planning a transfer to the general cardiology ward very soon.', '2026-06-23T20:30:00.000Z'),
  ('Frank Huang', 'HDU', 7,  'Grace Huang',      'family', 'He mentioned the physio too — he wants to get back to his garden as soon as possible. Will he be able to eventually? And what about driving?',                                                                                                                                  '2026-06-25T08:00:00.000Z'),
  ('Frank Huang', 'HDU', 3,  'Nurse David Chen', 'staff',  'The cardiology team will give him a full activity guide at discharge, but generally after a heart attack with stent — most people return to normal activities including gardening within 4–6 weeks. Driving typically resumes after 4 weeks for a routine MI. The cardiac rehab programme will guide him every step of the way.', '2026-06-25T09:00:00.000Z');

-- ============================================================
-- RESET ALL SEQUENCES
-- ============================================================
SELECT setval('users_id_seq',           (SELECT MAX(id) FROM users));
SELECT setval('patients_id_seq',        (SELECT MAX(id) FROM patients));
SELECT setval('bookings_id_seq',        (SELECT MAX(id) FROM bookings));
SELECT setval('medications_id_seq',     (SELECT MAX(id) FROM medications));
SELECT setval('clinical_updates_id_seq',(SELECT MAX(id) FROM clinical_updates));
SELECT setval('test_results_id_seq',    (SELECT MAX(id) FROM test_results));
SELECT setval('vitals_id_seq',          (SELECT MAX(id) FROM vitals));
SELECT setval('messages_id_seq',        (SELECT MAX(id) FROM messages));
