-- Insert Courses
-- Eng-Mech
INSERT INTO se_project.courses("code", "course", "facultyId","creditHours")
	VALUES ('EM 301', 'EM-I', 1 , 5);
INSERT INTO se_project.courses("code", "course", "facultyId","creditHours")
	VALUES ('EM 302', 'EM-II', 1 , 5);
INSERT INTO se_project.courses("code", "course", "facultyId","creditHours")
	VALUES ('EM 303', 'EM-III', 1 , 5);
INSERT INTO se_project.courses("code", "course", "facultyId","creditHours")
	VALUES ('EM 304', 'EM-IV', 1 , 5);

-- Eng-Elect
INSERT INTO se_project.courses("code", "course", "facultyId","creditHours")
	VALUES ('EE 301', 'EE-I', 2 , 5);
INSERT INTO se_project.courses("code", "course", "facultyId","creditHours")
	VALUES ('EE 302', 'EE-II', 2 , 5);
INSERT INTO se_project.courses("code", "course", "facultyId","creditHours")
	VALUES ('EE 303', 'EE-III', 2 , 5);
INSERT INTO se_project.courses("code", "course", "facultyId","creditHours")
	VALUES ('EE 304', 'EM-IV', 2 , 5);


-- Insert Roles
INSERT INTO se_project.roles("role")
	VALUES ('student');
INSERT INTO se_project.roles("role")
	VALUES ('admin');

-- Set user role as Admin
UPDATE se_project.users
	SET "roleId"=2
	WHERE "email"='desoukya@gmail.com';