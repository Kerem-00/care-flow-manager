-- HospiTime demo seed data
-- Run: psql YOUR_DATABASE_URL -f seed.sql

-- Users
INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES
  (1,  'Dr. Sarah Mitchell', 'staff@hospitime.demo',   '$2b$12$gZFLdRusibFQPOCjDN4/GO30gSdkvxD2J5y6hZq05smyuuFpvLyPG', 'staff',   '2026-03-30T21:59:01.932Z'),
  (2,  'James Wilson',       'visitor@hospitime.demo', '$2b$12$Zvbd7s68QaomOWryH26Xx.zBZYGqLdXjbuwgjfGh3YXx5zxWwnRo2', 'visitor', '2026-03-30T21:59:08.366Z'),
  (3,  'Nurse David Chen',   'staff2@hospitime.demo',  '$2b$12$FVKnWlEPD45InmIVL55dDeSahX6t3e2d0/ZQVEH4lNm6R7gIU5KUe', 'staff',   '2026-03-30T21:59:08.746Z'),
  (4,  'Emily Clarke',       'emily@hospitime.demo',   '$2b$12$Tavh20eOVCAYKUiXbyvFeuh6c1KIg9kW0wqqPzeeAthrVslvmSlPG', 'visitor', '2026-03-30T21:59:27.288Z'),
  (5,  'aa',                 'aa@gmail.com',           '$2b$12$NClh19sJHB76vVfemBINWeT9Ck4LUGjuFo4.3jf7b93Pna4y/GxV6', 'visitor', '2026-03-30T22:02:10.241Z'),
  (38, 'Test Staff',         'teststaff@test.com',     '$2b$12$h8G5p9vNmH.tDJJvrYccDu9E25UTKaJc4CwLz.o4I.axVVbYBpp8W', 'staff',   '2026-03-30T23:31:57.571Z'),
  (39, 'Ali V',              'alive@gmail.com',        '$2b$12$Hj5UjSRoa3vQxXcpeuIf4uhco7Rx2MfaSFHNBM/lUR9GUeaHJLz6q', 'staff',   '2026-03-30T23:32:08.367Z')
ON CONFLICT (id) DO NOTHING;

-- Sync sequence so new inserts don't collide with seeded IDs
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- Bookings
INSERT INTO bookings (id, user_id, visitor_name, visitor_email, visit_date, visit_time, duration_minutes, patient_name, ward, notes, status, rejection_reason, requested_at, reviewed_at, reviewed_by) VALUES
  (1,  2, 'James Wilson', 'visitor@hospitime.demo', '2026-04-05', '10:00', 60, 'Margaret Wilson', 'ICU Ward A', 'Family visit - wife visiting husband', 'approved', NULL,                                    '2026-03-30T21:59:17.043Z', '2026-03-30T21:59:26.838Z', 'Dr. Sarah Mitchell'),
  (2,  2, 'James Wilson', 'visitor@hospitime.demo', '2026-04-07', '14:00', 30, 'Margaret Wilson', 'ICU Ward A', 'Follow-up check visit',               'rejected', 'Capacity limit reached for that time slot', '2026-03-30T21:59:17.094Z', '2026-03-30T21:59:26.922Z', 'Dr. Sarah Mitchell'),
  (3,  2, 'James Wilson', 'visitor@hospitime.demo', '2026-04-10', '11:30', 90, 'Margaret Wilson', 'ICU Ward A', NULL,                                   'pending',  NULL,                                    '2026-03-30T21:59:17.134Z', NULL,                       NULL),
  (4,  4, 'Emily Clarke', 'emily@hospitime.demo',   '2026-04-05', '11:00', 60, 'Robert Clarke',   'ICU Ward B', 'Daily check-in visit',                 'rejected', 'sada',                                  '2026-03-30T21:59:27.356Z', '2026-03-30T23:33:29.358Z', 'Ali V'),
  (5,  4, 'Emily Clarke', 'emily@hospitime.demo',   '2026-04-06', '15:30', 30, 'Robert Clarke',   'ICU Ward B', NULL,                                   'pending',  NULL,                                    '2026-03-30T21:59:27.404Z', NULL,                       NULL),
  (6,  5, 'aa',           'aa@gmail.com',           '2026-03-31', '10:00', 60, 'AA',              'AA',         'AA',                                   'approved', NULL,                                    '2026-03-30T22:17:57.483Z', '2026-03-30T23:33:23.507Z', 'Ali V'),
  (39, 5, 'aa',           'aa@gmail.com',           '2026-04-04', '10:00', 60, 'AA',              '12',         'asadaxc',                              'pending',  NULL,                                    '2026-03-30T23:27:43.101Z', NULL,                       NULL)
ON CONFLICT (id) DO NOTHING;

-- Sync sequence so new inserts don't collide with seeded IDs
SELECT setval('bookings_id_seq', (SELECT MAX(id) FROM bookings));
