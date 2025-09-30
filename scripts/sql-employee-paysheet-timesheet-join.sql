-- SQL Query to join EmployeePaysheet with EmployeeTimesheet
-- This query provides a comprehensive view of employee payroll and timesheet data

-- Basic join query
SELECT 
    -- EmployeePaysheet fields (main table)
    ep.id AS paysheet_id,
    ep.company_id,
    ep.pay_period_id,
    ep.employee_id,
    ep.employee_type,
    
    -- Amount fields from paysheet
    ep.amount_8h,
    ep.amount_ot,
    ep.amount_night,
    
    -- Earnings from paysheet
    ep.basic_pay,
    ep.overtime_pay,
    ep.night_diff_pay,
    ep.holiday_pay,
    
    -- Financial fields from paysheet
    ep.allowances_amount,
    ep.loans_amount,
    ep.deductions_amount,
    ep.gross_pay,
    ep.net_pay,
    
    -- Government contributions
    ep.sss_ee,
    ep.sss_er,
    ep.philhealth_ee,
    ep.philhealth_er,
    ep.hdmf_ee,
    ep.hdmf_er,
    ep.tax_withheld,
    
    -- Paysheet status and dates
    ep.status AS paysheet_status,
    ep.created_at AS paysheet_created_at,
    
    -- EmployeeTimesheet fields
    et.id AS timesheet_id,
    et.tracking_method,
    
    -- Hours from timesheet (for TIME_LOG employees)
    et.total_hours_regular,
    et.total_hours_ot,
    et.total_hours_night,
    et.total_hours_holiday,
    
    -- Days tracking (for FIXED_HOURS employees)
    et.days_worked,
    et.days_absent,
    et.days_leave,
    
    -- Timesheet status
    et.status AS timesheet_status,
    et.created_at AS timesheet_created_at,
    
    -- DTR IDs array
    et.dtr_ids

FROM 
    payroll.EmployeePaysheet ep
LEFT JOIN 
    timekeeper.EmployeeTimesheet et 
    ON ep.company_id = et.company_id 
    AND ep.pay_period_id = et.pay_period_id 
    AND ep.employee_id = et.employee_id

ORDER BY 
    ep.pay_period_id DESC,
    ep.employee_id;


-- Query with additional employee information
SELECT 
    -- Employee information
    e.employee_no,
    e.first_name,
    e.last_name,
    e.classification,
    e.compensation_type,
    
    -- EmployeePaysheet fields
    ep.id AS paysheet_id,
    ep.pay_period_id,
    pp.code AS pay_period_code,
    
    -- Amounts and earnings
    ep.amount_8h,
    ep.amount_ot,
    ep.amount_night,
    ep.basic_pay,
    ep.overtime_pay,
    ep.night_diff_pay,
    ep.gross_pay,
    ep.net_pay,
    
    -- Deductions
    ep.sss_ee + ep.philhealth_ee + ep.hdmf_ee AS total_govt_deductions,
    ep.loans_amount + ep.deductions_amount AS total_other_deductions,
    
    -- EmployeeTimesheet data
    et.tracking_method,
    et.total_hours_regular,
    et.total_hours_ot,
    et.total_hours_night,
    et.days_worked,
    
    -- Status
    ep.status AS paysheet_status,
    et.status AS timesheet_status

FROM 
    payroll.EmployeePaysheet ep
LEFT JOIN 
    timekeeper.EmployeeTimesheet et 
    ON ep.company_id = et.company_id 
    AND ep.pay_period_id = et.pay_period_id 
    AND ep.employee_id = et.employee_id
LEFT JOIN 
    hr.Employee e 
    ON ep.employee_id = e.id
LEFT JOIN 
    ops.PayPeriod pp 
    ON ep.pay_period_id = pp.id

WHERE 
    ep.company_id = 'default-company' -- Filter by company if needed

ORDER BY 
    pp.year DESC,
    pp.month DESC,
    pp.from DESC,
    e.employee_no;


-- Summary query with calculations
SELECT 
    pp.code AS pay_period,
    COUNT(DISTINCT ep.employee_id) AS total_employees,
    
    -- Paysheet totals
    SUM(ep.gross_pay) AS total_gross_pay,
    SUM(ep.net_pay) AS total_net_pay,
    SUM(ep.amount_8h) AS total_regular_amount,
    SUM(ep.amount_ot) AS total_overtime_amount,
    SUM(ep.amount_night) AS total_night_amount,
    
    -- Government contribution totals
    SUM(ep.sss_ee + ep.sss_er) AS total_sss,
    SUM(ep.philhealth_ee + ep.philhealth_er) AS total_philhealth,
    SUM(ep.hdmf_ee + ep.hdmf_er) AS total_hdmf,
    
    -- Timesheet hour totals
    SUM(et.total_hours_regular) AS total_regular_hours,
    SUM(et.total_hours_ot) AS total_overtime_hours,
    SUM(et.total_hours_night) AS total_night_hours,
    
    -- Average calculations
    AVG(ep.gross_pay) AS avg_gross_pay,
    AVG(ep.net_pay) AS avg_net_pay

FROM 
    payroll.EmployeePaysheet ep
LEFT JOIN 
    timekeeper.EmployeeTimesheet et 
    ON ep.company_id = et.company_id 
    AND ep.pay_period_id = et.pay_period_id 
    AND ep.employee_id = et.employee_id
LEFT JOIN 
    ops.PayPeriod pp 
    ON ep.pay_period_id = pp.id

GROUP BY 
    pp.id, pp.code
ORDER BY 
    pp.year DESC, pp.month DESC, pp.from DESC;


-- Query to find discrepancies between paysheet and timesheet
SELECT 
    e.employee_no,
    e.first_name || ' ' || e.last_name AS employee_name,
    pp.code AS pay_period,
    
    -- Paysheet amounts
    ep.amount_8h AS paysheet_regular_amount,
    ep.amount_ot AS paysheet_ot_amount,
    
    -- Timesheet hours
    et.total_hours_regular AS timesheet_regular_hours,
    et.total_hours_ot AS timesheet_ot_hours,
    
    -- Calculate expected amounts (assuming hourly rate)
    CASE 
        WHEN et.total_hours_regular > 0 
        THEN ROUND(CAST(ep.amount_8h AS DECIMAL) / CAST(et.total_hours_regular AS DECIMAL), 2)
        ELSE 0 
    END AS implied_hourly_rate,
    
    -- Status comparison
    ep.status AS paysheet_status,
    et.status AS timesheet_status,
    
    -- Flag mismatches
    CASE 
        WHEN ep.status != et.status THEN 'Status Mismatch'
        WHEN et.total_hours_regular = 0 AND ep.amount_8h > 0 THEN 'Hours Missing'
        WHEN et.total_hours_regular > 0 AND ep.amount_8h = 0 THEN 'Amount Missing'
        ELSE 'OK'
    END AS validation_status

FROM 
    payroll.EmployeePaysheet ep
INNER JOIN 
    timekeeper.EmployeeTimesheet et 
    ON ep.company_id = et.company_id 
    AND ep.pay_period_id = et.pay_period_id 
    AND ep.employee_id = et.employee_id
LEFT JOIN 
    hr.Employee e 
    ON ep.employee_id = e.id
LEFT JOIN 
    ops.PayPeriod pp 
    ON ep.pay_period_id = pp.id

WHERE 
    -- Filter for potential issues
    (ep.status != et.status 
    OR (et.total_hours_regular = 0 AND ep.amount_8h > 0)
    OR (et.total_hours_regular > 0 AND ep.amount_8h = 0))

ORDER BY 
    pp.code DESC, e.employee_no;


-- Query for payroll processing view
SELECT 
    e.employee_no,
    e.first_name,
    e.last_name,
    e.classification,
    pp.code AS pay_period,
    pp.start_date,
    pp.end_date,
    
    -- Timesheet data
    et.tracking_method,
    COALESCE(et.total_hours_regular, 0) AS hours_regular,
    COALESCE(et.total_hours_ot, 0) AS hours_overtime,
    COALESCE(et.total_hours_night, 0) AS hours_night,
    COALESCE(et.days_worked, 0) AS days_worked,
    
    -- Paysheet calculations
    ep.amount_8h + ep.amount_ot + ep.amount_night AS total_earnings,
    ep.allowances_amount,
    ep.sss_ee + ep.philhealth_ee + ep.hdmf_ee + ep.tax_withheld AS total_statutory_deductions,
    ep.loans_amount + ep.deductions_amount AS total_other_deductions,
    ep.gross_pay,
    ep.net_pay,
    
    -- Processing status
    CASE 
        WHEN ep.id IS NULL THEN 'No Paysheet'
        WHEN et.id IS NULL THEN 'No Timesheet'
        WHEN ep.status = 'DRAFT' THEN 'Draft'
        WHEN ep.status = 'CALCULATED' THEN 'Calculated'
        WHEN ep.status = 'APPROVED' THEN 'Approved'
        WHEN ep.status = 'POSTED' THEN 'Posted'
        ELSE ep.status
    END AS processing_status,
    
    -- Audit fields
    ep.created_at AS paysheet_created,
    et.created_at AS timesheet_created

FROM 
    hr.Employee e
CROSS JOIN 
    ops.PayPeriod pp
LEFT JOIN 
    payroll.EmployeePaysheet ep 
    ON e.id = ep.employee_id 
    AND pp.id = ep.pay_period_id
    AND e.company_id = ep.company_id
LEFT JOIN 
    timekeeper.EmployeeTimesheet et 
    ON e.id = et.employee_id 
    AND pp.id = et.pay_period_id
    AND e.company_id = et.company_id

WHERE 
    pp.status = 'ACTIVE'
    AND e.employment_status = 'ACTIVE'

ORDER BY 
    pp.start_date DESC,
    e.employee_no;