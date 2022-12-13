create table Departments(

    id serial primary key,
    name text not null unique

);

create table Employees(

    id serial primary key,
    name text not null,
    salary integer default 0,
    departmentId integer not null,
    constraint fk_emp_dep foreign key(departmentId) references Departments(id)
);