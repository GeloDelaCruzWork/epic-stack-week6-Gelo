-- SQL Query joining EmployeePaysheet, EmployeeTimesheet, and DTR records
-- This query includes all DTR details associated with the timesheet

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
    et.dtr_ids,
    
    -- DTR Details
    dtr.id AS dtr_id,
    dtr.date AS dtr_date,
    dtr.location_id,
    dtr.position_id,
    dtr.shift_id,
    dtr.hours_8h AS dtr_hours_regular,
    dtr.hours_ot AS dtr_hours_ot,
    dtr.hours_night AS dtr_hours_night,
    dtr.status AS dtr_status,
    dtr.created_at AS dtr_created_at

FROM 
    payroll."EmployeePaysheet" ep
LEFT JOIN 
    timekeeper."EmployeeTimesheet" et 
    ON ep.company_id = et.company_id 
    AND ep.pay_period_id = et.pay_period_id 
    AND ep.employee_id = et.employee_id
LEFT JOIN 
    timekeeper."Dtr" dtr
    ON dtr.company_id = et.company_id
    AND dtr.guard_id = et.employee_id  -- Note: DTR uses guard_id, which maps to employee_id
    AND dtr.id = ANY(et.dtr_ids)  -- Match DTR IDs from the array

ORDER BY 
    ep.pay_period_id DESC,
    ep.employee_id,
    dtr.date;


-- Alternative: Using UNNEST to expand DTR array and join
-- This version creates one row per DTR record
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
    
    -- DTR Details
    dtr.id AS dtr_id,
    dtr.date AS dtr_date,
    dtr.location_id,
    dtr.position_id,
    dtr.shift_id,
    dtr.hours_8h AS dtr_hours_regular,
    dtr.hours_ot AS dtr_hours_ot,
    dtr.hours_night AS dtr_hours_night,
    dtr.status AS dtr_status,
    dtr.created_at AS dtr_created_at,
    dtr.contract_rate_version_id

FROM 
    payroll."EmployeePaysheet" ep
LEFT JOIN 
    timekeeper."EmployeeTimesheet" et 
    ON ep.company_id = et.company_id 
    AND ep.pay_period_id = et.pay_period_id 
    AND ep.employee_id = et.employee_id
LEFT JOIN LATERAL 
    unnest(et.dtr_ids) AS dtr_id_unnest ON true
LEFT JOIN 
    timekeeper."Dtr" dtr
    ON dtr.id = dtr_id_unnest

ORDER BY 
    ep.pay_period_id DESC,
    ep.employee_id,
    dtr.date;


-- Aggregated version: One row per paysheet with DTR summary
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
    et.dtr_ids,
    array_length(et.dtr_ids, 1) AS total_dtr_count,
    
    -- DTR Summary (aggregated)
    COUNT(dtr.id) AS matched_dtr_count,
    MIN(dtr.date) AS first_dtr_date,
    MAX(dtr.date) AS last_dtr_date,
    SUM(dtr.hours_8h) AS total_dtr_regular_hours,
    SUM(dtr.hours_ot) AS total_dtr_ot_hours,
    SUM(dtr.hours_night) AS total_dtr_night_hours,
    STRING_AGG(DISTINCT dtr.location_id::text, ', ') AS dtr_locations,
    STRING_AGG(DISTINCT dtr.shift_id::text, ', ') AS dtr_shifts

FROM 
    payroll."EmployeePaysheet" ep
LEFT JOIN 
    timekeeper."EmployeeTimesheet" et 
    ON ep.company_id = et.company_id 
    AND ep.pay_period_id = et.pay_period_id 
    AND ep.employee_id = et.employee_id
LEFT JOIN 
    timekeeper."Dtr" dtr
    ON dtr.company_id = et.company_id
    AND dtr.guard_id = et.employee_id
    AND dtr.id = ANY(et.dtr_ids)

GROUP BY 
    ep.id, ep.company_id, ep.pay_period_id, ep.employee_id, ep.employee_type,
    ep.amount_8h, ep.amount_ot, ep.amount_night,
    ep.basic_pay, ep.overtime_pay, ep.night_diff_pay, ep.holiday_pay,
    ep.allowances_amount, ep.loans_amount, ep.deductions_amount,
    ep.gross_pay, ep.net_pay,
    ep.sss_ee, ep.sss_er, ep.philhealth_ee, ep.philhealth_er,
    ep.hdmf_ee, ep.hdmf_er, ep.tax_withheld,
    ep.status, ep.created_at,
    et.id, et.tracking_method,
    et.total_hours_regular, et.total_hours_ot, et.total_hours_night, et.total_hours_holiday,
    et.days_worked, et.days_absent, et.days_leave,
    et.status, et.created_at, et.dtr_ids

ORDER BY 
    ep.pay_period_id DESC,
    ep.employee_id;


-- Simple version with JSON aggregation of DTR details
-- Returns one row per paysheet with DTR details as JSON
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
    et.dtr_ids,
    
    -- DTR Details as JSON array
    COALESCE(
        json_agg(
            json_build_object(
                'dtr_id', dtr.id,
                'date', dtr.date,
                'location_id', dtr.location_id,
                'position_id', dtr.position_id,
                'shift_id', dtr.shift_id,
                'hours_regular', dtr.hours_8h,
                'hours_ot', dtr.hours_ot,
                'hours_night', dtr.hours_night,
                'status', dtr.status
            ) ORDER BY dtr.date
        ) FILTER (WHERE dtr.id IS NOT NULL),
        '[]'::json
    ) AS dtr_details

FROM 
    payroll."EmployeePaysheet" ep
LEFT JOIN 
    timekeeper."EmployeeTimesheet" et 
    ON ep.company_id = et.company_id 
    AND ep.pay_period_id = et.pay_period_id 
    AND ep.employee_id = et.employee_id
LEFT JOIN 
    timekeeper."Dtr" dtr
    ON dtr.company_id = et.company_id
    AND dtr.guard_id = et.employee_id
    AND dtr.id = ANY(et.dtr_ids)

GROUP BY 
    ep.id, ep.company_id, ep.pay_period_id, ep.employee_id, ep.employee_type,
    ep.amount_8h, ep.amount_ot, ep.amount_night,
    ep.basic_pay, ep.overtime_pay, ep.night_diff_pay, ep.holiday_pay,
    ep.allowances_amount, ep.loans_amount, ep.deductions_amount,
    ep.gross_pay, ep.net_pay,
    ep.sss_ee, ep.sss_er, ep.philhealth_ee, ep.philhealth_er,
    ep.hdmf_ee, ep.hdmf_er, ep.tax_withheld,
    ep.status, ep.created_at,
    et.id, et.tracking_method,
    et.total_hours_regular, et.total_hours_ot, et.total_hours_night, et.total_hours_holiday,
    et.days_worked, et.days_absent, et.days_leave,
    et.status, et.created_at, et.dtr_ids

ORDER BY 
    ep.pay_period_id DESC,
    ep.employee_id;