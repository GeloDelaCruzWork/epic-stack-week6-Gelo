-- Corrected SQL Query for EmployeePaysheet and EmployeeTimesheet join

-- Option 1: Using quoted identifiers (if tables use PascalCase)
SELECT 
    -- EmployeePaysheet fields (main table)
    ep.id AS paysheet_id,
    
    -- EmployeeTimesheet fields
    et.id AS timesheet_id,
    
    -- DTR IDs array
    et.dtr_ids

FROM 
    payroll."EmployeePaysheet" ep
LEFT JOIN 
    timekeeper."EmployeeTimesheet" et 
    ON ep.company_id = et.company_id 
    AND ep.pay_period_id = et.pay_period_id 
    AND ep.employee_id = et.employee_id

ORDER BY 
    ep.pay_period_id DESC,
    ep.employee_id;


-- Option 2: Using snake_case (most common in PostgreSQL)
SELECT 
    -- EmployeePaysheet fields (main table)
    ep.id AS paysheet_id,
    
    -- EmployeeTimesheet fields  
    et.id AS timesheet_id,
    
    -- DTR IDs array
    et.dtr_ids

FROM 
    payroll.employee_paysheet ep
LEFT JOIN 
    timekeeper.employee_timesheet et 
    ON ep.company_id = et.company_id 
    AND ep.pay_period_id = et.pay_period_id 
    AND ep.employee_id = et.employee_id

ORDER BY 
    ep.pay_period_id DESC,
    ep.employee_id;