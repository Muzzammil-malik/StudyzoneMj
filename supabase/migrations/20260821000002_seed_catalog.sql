insert into public.semesters (name, display_order) values
  ('Semester 1', 1), ('Semester 2', 2), ('Semester 3', 3), ('Semester 4', 4),
  ('Semester 5', 5), ('Semester 6', 6), ('Semester 7', 7), ('Semester 8', 8)
on conflict (name) do nothing;

insert into public.resource_categories (name, description, display_order, icon_name) values
  ('Notes', 'Lecture notes and module summaries.', 1, 'BookOpen'),
  ('PYQs (Previous Years)', 'Previous university and internal examination papers.', 2, 'Archive'),
  ('Question Banks', 'Faculty-compiled question banks.', 3, 'HelpCircle'),
  ('Lab Manuals', 'Experiment manuals and procedural guides.', 4, 'FlaskConical'),
  ('Lab Records', 'Verified record sheets and observations.', 5, 'FileText'),
  ('Assignments', 'Assignments, tutorials, and problem sets.', 6, 'FileCode2'),
  ('Syllabus', 'Official curriculum outlines and course outcomes.', 7, 'ListTree')
on conflict (name) do nothing;

insert into public.subjects (name, code, semester_id, description, department, display_order, icon_name, color_tone)
select catalog.name, catalog.code, semesters.id, catalog.description, catalog.department, catalog.display_order, catalog.icon_name, catalog.color_tone
from (values
  ('Engineering Physics', 'BS-PH101', 'Semester 1', 'Wave optics, lasers, fiber optics, quantum mechanics, and solid-state physics.', 'Humanities & Sciences', 1, 'Atom', 'blue'),
  ('Basic Electrical Engineering', 'ES-EE101', 'Semester 1', 'Fundamental circuit theorems, AC and DC machines, and transformers.', 'Electrical & Electronics', 2, 'Zap', 'amber'),
  ('Programming for Problem Solving', 'ES-CS101', 'Semester 1', 'Procedural programming, algorithms, pointers, and file operations.', 'Computer Science & Engineering', 3, 'Code', 'emerald'),
  ('Data Structures & Algorithms', 'PC-CS301', 'Semester 3', 'Linear and hierarchical data structures, graphs, sorting, and searching.', 'Computer Science & Engineering', 4, 'Binary', 'indigo'),
  ('Discrete Mathematics', 'BS-M301', 'Semester 3', 'Logic, set theory, combinatorics, recurrence relations, and graph theory.', 'Mathematics', 5, 'Sigma', 'violet'),
  ('Database Management Systems', 'PC-CS401', 'Semester 4', 'Relational database models, SQL, normalization, transactions, and indexing.', 'Information Technology', 6, 'Database', 'blue'),
  ('Computer Networks', 'PC-IT501', 'Semester 5', 'OSI and TCP/IP models, routing, transport protocols, and socket APIs.', 'Information Technology', 7, 'Network', 'slate'),
  ('Digital Signal Processing', 'PC-EC501', 'Semester 5', 'DFT, FFT, Z-transforms, and IIR/FIR digital filter design.', 'Electronics & Communication', 8, 'Activity', 'indigo')
) as catalog(name, code, semester_name, description, department, display_order, icon_name, color_tone)
join public.semesters on semesters.name = catalog.semester_name
on conflict (semester_id, code) do nothing;

insert into public.folders (subject_id, name, description, display_order)
select subjects.id, 'Lecture Notes', 'Course notes and module summaries.', 1
from public.subjects
where subjects.code in ('BS-PH101', 'ES-EE101', 'ES-CS101', 'PC-CS301', 'BS-M301', 'PC-CS401', 'PC-IT501', 'PC-EC501')
  and not exists (select 1 from public.folders f where f.subject_id = subjects.id and f.name = 'Lecture Notes');
