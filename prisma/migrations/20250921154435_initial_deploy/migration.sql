-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "admin";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audit";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "benefits";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "catalog";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "hr";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ops";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "org";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "payroll";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "timekeeper";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "workflow";

-- CreateEnum
CREATE TYPE "timekeeper"."ManualUploadStatus" AS ENUM ('DRAFT', 'VERIFIED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "timekeeper"."ClockMode" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "hr"."EmployeeType" AS ENUM ('REGULAR', 'CONTRACTUAL', 'PROBATIONARY', 'PROJECT', 'CONSULTANT', 'PART_TIME', 'INTERN');

-- CreateEnum
CREATE TYPE "hr"."EmploymentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TERMINATED', 'RESIGNED', 'RETIRED', 'ON_LEAVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "hr"."CompensationType" AS ENUM ('TIME_BASED', 'FIXED_SALARY', 'PROJECT_BASED', 'COMMISSION', 'HYBRID');

-- CreateTable
CREATE TABLE "admin"."User" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "username" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin"."Role" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin"."Feature" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin"."UserRole" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin"."RoleFeature" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "feature_id" TEXT NOT NULL,

    CONSTRAINT "RoleFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin"."Password" (
    "hash" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "admin"."Session" (
    "id" TEXT NOT NULL,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin"."Permission" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin"."Verification" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "digits" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "charSet" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin"."Connection" (
    "id" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Connection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin"."Passkey" (
    "id" TEXT NOT NULL,
    "aaguid" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "userId" TEXT NOT NULL,
    "webauthnUserId" TEXT NOT NULL,
    "counter" BIGINT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "backedUp" BOOLEAN NOT NULL,
    "transports" TEXT,

    CONSTRAINT "Passkey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."Company" (
    "id" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tin" TEXT,
    "address" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."Area" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."Subarea" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "area_id" TEXT,
    "name" TEXT,
    "code" TEXT,

    CONSTRAINT "Subarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."Location" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "area_id" TEXT NOT NULL,
    "subarea_id" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."EmployeeAssignment" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "assignment_type" TEXT NOT NULL,
    "location_id" TEXT,
    "department_id" TEXT,
    "project_id" TEXT,
    "client_id" TEXT,
    "position_id" TEXT,
    "shift_id" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),

    CONSTRAINT "EmployeeAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."GuardQualification" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "GuardQualification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."Position" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."Shift" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "night_start" TEXT,
    "night_end" TEXT,

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."ContractRate" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "base_monthly_rate" DECIMAL(14,2) NOT NULL,
    "ot_multiplier" DECIMAL(6,4) NOT NULL DEFAULT 1.25,
    "night_diff_multiplier" DECIMAL(6,4) NOT NULL DEFAULT 1.10,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "last_approval_id" TEXT,

    CONSTRAINT "ContractRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."LoanType" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LoanType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."AllowanceType" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AllowanceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."DeductionType" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DeductionType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."GovTableSSS" (
    "id" TEXT NOT NULL,
    "ord" INTEGER NOT NULL DEFAULT 0,
    "range1" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "range2" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "msc" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "employerContrib" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "employeeContrib" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovTableSSS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."GovTablePhilHealth" (
    "id" TEXT NOT NULL,
    "ord" INTEGER NOT NULL DEFAULT 0,
    "min" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "max" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "employerContrib" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "employeeContrib" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovTablePhilHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."GovTableHDMF" (
    "id" TEXT NOT NULL,
    "ord" INTEGER NOT NULL DEFAULT 0,
    "min" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "max" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "reference" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "employerRate" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "employeeRate" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "employerContrib" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovTableHDMF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."GovTableBIR" (
    "id" TEXT NOT NULL,
    "bracket" INTEGER NOT NULL DEFAULT 0,
    "period_type" TEXT NOT NULL DEFAULT 'MONTHLY',
    "min" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "max" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "fixedTax" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "rateOnExcess" DOUBLE PRECISION NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),

    CONSTRAINT "GovTableBIR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."WorkCalendarMonth" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "working_days" INTEGER NOT NULL,
    "hours_per_day" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "WorkCalendarMonth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."PayPeriod" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "from" INTEGER NOT NULL,
    "to" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "PayPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."WorkSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "guard_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_approval_id" TEXT,

    CONSTRAINT "WorkSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."RelieverSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "work_schedule_id" TEXT,
    "guard_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_approval_id" TEXT,

    CONSTRAINT "RelieverSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."Device" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "serial_no" TEXT NOT NULL,
    "label" TEXT,
    "location_id" TEXT,
    "last_seen_at" TIMESTAMP(3),

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."ClockEvent" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "guard_id" TEXT,
    "location_id" TEXT,
    "device_id" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "kind" TEXT NOT NULL,
    "raw_payload" JSONB,
    "resolved_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_approval_id" TEXT,
    "manual_detail_id" TEXT,

    CONSTRAINT "ClockEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timekeeper"."ManualClockEventHeader" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "upload_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "file_size" INTEGER NOT NULL,
    "prepared_by" TEXT NOT NULL,
    "verified_by" TEXT,
    "approved_by" TEXT,
    "submitted_by" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "date_sent" TIMESTAMP(3),
    "status" "timekeeper"."ManualUploadStatus" NOT NULL DEFAULT 'DRAFT',
    "processed_date" TIMESTAMP(3),
    "processed_by" TEXT,
    "total_records" INTEGER NOT NULL DEFAULT 0,
    "valid_records" INTEGER NOT NULL DEFAULT 0,
    "error_records" INTEGER NOT NULL DEFAULT 0,
    "warnings" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualClockEventHeader_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timekeeper"."ManualClockEventDetail" (
    "id" TEXT NOT NULL,
    "header_id" TEXT NOT NULL,
    "row_number" INTEGER NOT NULL,
    "employee_no" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "location" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "event_time" TEXT NOT NULL,
    "event_timestamp" TIMESTAMP(3) NOT NULL,
    "event_mode" "timekeeper"."ClockMode" NOT NULL,
    "is_valid" BOOLEAN NOT NULL DEFAULT true,
    "validation_errors" TEXT,
    "is_processed" BOOLEAN NOT NULL DEFAULT false,
    "clock_event_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManualClockEventDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timekeeper"."TimeLog" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "guard_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "work_schedule_id" TEXT,
    "reliever_schedule_id" TEXT,
    "clock_in_event_id" TEXT,
    "clock_out_event_id" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_approval_id" TEXT,
    "time_in" TIMESTAMP(3),
    "time_out" TIMESTAMP(3),

    CONSTRAINT "TimeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timekeeper"."Dtr" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "guard_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time_log_ids" TEXT[],
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_approval_id" TEXT,
    "hours_8h" DECIMAL(8,2) DEFAULT 0.00,
    "hours_ot" DECIMAL(8,2) DEFAULT 0.00,
    "hours_night" DECIMAL(8,2) DEFAULT 0.00,
    "contract_rate_version_id" TEXT,

    CONSTRAINT "Dtr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timekeeper"."EmployeeTimesheet" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "tracking_method" TEXT NOT NULL,
    "dtr_ids" TEXT[],
    "total_hours_regular" DECIMAL(8,2),
    "total_hours_ot" DECIMAL(8,2),
    "total_hours_night" DECIMAL(8,2),
    "total_hours_holiday" DECIMAL(8,2),
    "days_worked" INTEGER,
    "days_absent" INTEGER,
    "days_leave" INTEGER,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeTimesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."Employee" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_no" TEXT NOT NULL,
    "employee_type" "hr"."EmployeeType" NOT NULL DEFAULT 'REGULAR',
    "classification" TEXT,
    "last_name" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "suffix" TEXT,
    "email" TEXT,
    "hire_date" TIMESTAMP(3) NOT NULL,
    "regularization_date" TIMESTAMP(3),
    "separation_date" TIMESTAMP(3),
    "employment_status" "hr"."EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "compensation_type" "hr"."CompensationType" NOT NULL DEFAULT 'TIME_BASED',
    "pay_frequency" TEXT,
    "requires_timesheet" BOOLEAN NOT NULL DEFAULT true,
    "base_salary" DECIMAL(14,2),
    "hourly_rate" DECIMAL(14,2),
    "daily_rate" DECIMAL(14,2),
    "department_id" TEXT,
    "cost_center_id" TEXT,
    "reports_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."GuardProfile" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "license_no" TEXT,
    "license_expiry" TIMESTAMP(3),
    "security_clearance" TEXT,

    CONSTRAINT "GuardProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."RegularEmployeeProfile" (
    "id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "department" TEXT,
    "job_level" TEXT,
    "direct_report" TEXT,

    CONSTRAINT "RegularEmployeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."Department" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" TEXT,
    "manager_id" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."CostCenter" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."EmploymentContract" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "contract_type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "probation_end_date" TIMESTAMP(3),
    "notice_period_days" INTEGER,
    "base_salary" DECIMAL(14,2),
    "allowances_json" JSONB,
    "benefits_json" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmploymentContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeeLoan" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "loan_type_id" TEXT NOT NULL,
    "principal_amount" DECIMAL(14,2) NOT NULL,
    "interest_rate" DECIMAL(5,2),
    "installment_count" INTEGER NOT NULL,
    "installment_amount" DECIMAL(14,2) NOT NULL,
    "start_pay_period_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "approval_date" TIMESTAMP(3),
    "completion_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeLoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeeAllowance" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "allowance_type_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "frequency" TEXT NOT NULL,
    "taxable" BOOLEAN NOT NULL DEFAULT true,
    "start_pay_period_id" TEXT NOT NULL,
    "end_pay_period_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeAllowance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeeDeduction" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "deduction_type_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "frequency" TEXT NOT NULL,
    "start_pay_period_id" TEXT NOT NULL,
    "end_pay_period_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeeGovContribution" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "contribution_type" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "employer_share" DECIMAL(14,2),
    "employee_share" DECIMAL(14,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeGovContribution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeeLoanSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_loan_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "EmployeeLoanSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeeAllowanceSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_allowance_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "EmployeeAllowanceSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeeDeductionSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_deduction_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "EmployeeDeductionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll"."PayrollRun" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "payroll_type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "computed_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "posted_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "reviewed_by" TEXT,
    "approved_by" TEXT,

    CONSTRAINT "PayrollRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll"."EmployeePayslip" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "payroll_run_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "basic_pay" DECIMAL(14,2) NOT NULL,
    "overtime_pay" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "night_diff_pay" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "holiday_pay" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "allowances_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "allowances_detail" JSONB,
    "absences_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tardiness_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "loans_total" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "other_deductions" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sss_ee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sss_er" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "philhealth_ee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "philhealth_er" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "hdmf_ee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "hdmf_er" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "taxable_income" DECIMAL(14,2) NOT NULL,
    "withholding_tax" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "gross_pay" DECIMAL(14,2) NOT NULL,
    "total_deductions" DECIMAL(14,2) NOT NULL,
    "net_pay" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeePayslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll"."CompensationPlan" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "employee_type" TEXT NOT NULL,
    "base_calculation" TEXT NOT NULL,
    "overtime_eligible" BOOLEAN NOT NULL DEFAULT false,
    "night_diff_eligible" BOOLEAN NOT NULL DEFAULT false,
    "holiday_pay_eligible" BOOLEAN NOT NULL DEFAULT true,
    "sss_eligible" BOOLEAN NOT NULL DEFAULT true,
    "philhealth_eligible" BOOLEAN NOT NULL DEFAULT true,
    "hdmf_eligible" BOOLEAN NOT NULL DEFAULT true,
    "tax_eligible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompensationPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll"."DtrCost" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "dtr_id" TEXT NOT NULL,
    "contract_rate_version_id" TEXT NOT NULL,
    "calendar_year" INTEGER NOT NULL,
    "calendar_month" INTEGER NOT NULL,
    "working_days_used" INTEGER NOT NULL,
    "hours_per_day_used" INTEGER NOT NULL,
    "derived_hourly_base" DECIMAL(14,4) NOT NULL,
    "derived_hourly_ot" DECIMAL(14,4) NOT NULL,
    "derived_hourly_night" DECIMAL(14,4) NOT NULL,
    "amount_8h" DECIMAL(14,2) NOT NULL,
    "amount_ot" DECIMAL(14,2) NOT NULL,
    "amount_night" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "last_approval_id" TEXT,

    CONSTRAINT "DtrCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll"."TimesheetCost" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "timesheet_id" TEXT NOT NULL,
    "amount_8h" DECIMAL(14,2) NOT NULL,
    "amount_ot" DECIMAL(14,2) NOT NULL,
    "amount_night" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "last_approval_id" TEXT,

    CONSTRAINT "TimesheetCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll"."EmployeePaysheet" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "employee_type" TEXT NOT NULL,
    "timesheet_ids" TEXT[],
    "amount_8h" DECIMAL(14,2) NOT NULL,
    "amount_ot" DECIMAL(14,2) NOT NULL,
    "amount_night" DECIMAL(14,2) NOT NULL,
    "basic_pay" DECIMAL(14,2) NOT NULL,
    "overtime_pay" DECIMAL(14,2),
    "night_diff_pay" DECIMAL(14,2),
    "holiday_pay" DECIMAL(14,2),
    "allowances_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "loans_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "deductions_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sss_ee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sss_er" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "philhealth_ee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "philhealth_er" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "hdmf_ee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "hdmf_er" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tax_withheld" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "gross_pay" DECIMAL(14,2) NOT NULL,
    "net_pay" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeePaysheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll"."Payslip" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "paysheet_id" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdf_url" TEXT,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit"."ChangeLog" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "actor_user_id" TEXT,
    "actor_source" TEXT,
    "schema_name" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "before_data" JSONB,
    "after_data" JSONB,
    "reason" TEXT,
    "request_id" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prev_hash" TEXT,
    "curr_hash" TEXT,
    "approval_id" TEXT,
    "requester_user_id" TEXT,
    "verifier_user_id" TEXT,
    "approver_user_id" TEXT,

    CONSTRAINT "ChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow"."Approval" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "schema_name" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "requester_user_id" TEXT NOT NULL,
    "verifier_user_id" TEXT,
    "approver_user_id" TEXT,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "before_data" JSONB,
    "proposed_after" JSONB,
    "diff_hint" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow"."ApprovalPolicy" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "schema_name" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "enforced" BOOLEAN NOT NULL DEFAULT true,
    "require_verifier" BOOLEAN NOT NULL DEFAULT true,
    "require_approver" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,

    CONSTRAINT "ApprovalPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin"."Note" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin"."NoteImage" (
    "id" TEXT NOT NULL,
    "altText" TEXT,
    "objectKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "noteId" TEXT NOT NULL,

    CONSTRAINT "NoteImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin"."UserImage" (
    "id" TEXT NOT NULL,
    "altText" TEXT,
    "objectKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin"."Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timekeeper"."timesheet_" (
    "id" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "payPeriod" TEXT NOT NULL,
    "detachment" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "regularHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nightDifferential" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheet__pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timekeeper"."DTR_" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "regularHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nightDifferential" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "timesheetId" TEXT NOT NULL,

    CONSTRAINT "DTR__pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timekeeper"."timelog_" (
    "id" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "dtrId" TEXT NOT NULL,

    CONSTRAINT "timelog__pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timekeeper"."clockEvent_" (
    "id" TEXT NOT NULL,
    "clockTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "timelogId" TEXT NOT NULL,

    CONSTRAINT "clockEvent__pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."Operation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."Incident" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'reported',
    "reportedBy" TEXT,
    "reportedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedDate" TIMESTAMP(3),
    "responseTime" INTEGER,
    "resolutionTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "operationId" TEXT NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'unassigned',
    "estimatedHours" DOUBLE PRECISION,
    "actualHours" DOUBLE PRECISION,
    "dueDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "assignedTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "incidentId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ops"."Resource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "status" TEXT NOT NULL DEFAULT 'available',
    "skills" TEXT,
    "location" TEXT,
    "cost" DOUBLE PRECISION,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "utilizationRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "taskId" TEXT,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timekeeper"."EmployeeSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location_id" TEXT,
    "department_id" TEXT,
    "shift_id" TEXT,
    "scheduled_in" TIMESTAMP(3) NOT NULL,
    "scheduled_out" TIMESTAMP(3) NOT NULL,
    "break_minutes" INTEGER NOT NULL DEFAULT 60,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timekeeper"."EmployeeAttendance" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "actual_in" TIMESTAMP(3),
    "actual_out" TIMESTAMP(3),
    "break_start" TIMESTAMP(3),
    "break_end" TIMESTAMP(3),
    "regular_hours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "overtime_hours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "night_diff_hours" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "tardiness_mins" INTEGER NOT NULL DEFAULT 0,
    "undertime_mins" INTEGER NOT NULL DEFAULT 0,
    "attendance_status" TEXT NOT NULL,
    "validation_status" TEXT NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."EmployeeLeave" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "leave_type" TEXT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "days_count" DECIMAL(5,2) NOT NULL,
    "reason" TEXT,
    "supporting_docs" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "EmployeeLeave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."EmployeeLeaveBalance" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "leave_type" TEXT NOT NULL,
    "entitled_days" DECIMAL(5,2) NOT NULL,
    "used_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "remaining_days" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "EmployeeLeaveBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog"."Holiday" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "rate" DECIMAL(3,2) NOT NULL DEFAULT 1.0,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeeSSS" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "sss_no" TEXT NOT NULL,
    "monthly_salary" DECIMAL(14,2),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSSS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeePhilHealth" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "philhealth_no" TEXT NOT NULL,
    "monthly_salary" DECIMAL(14,2),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeePhilHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeeHDMF" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "hdmf_no" TEXT NOT NULL,
    "monthly_salary" DECIMAL(14,2),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeHDMF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeeTax" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "tin" TEXT NOT NULL,
    "rdo_code" TEXT,
    "tax_code" TEXT,
    "exemption_status" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeTax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeeSSSSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_sss_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "gross_income" DECIMAL(14,2) NOT NULL,
    "ee_amount" DECIMAL(14,2) NOT NULL,
    "er_amount" DECIMAL(14,2) NOT NULL,
    "ec_amount" DECIMAL(14,2) NOT NULL DEFAULT 10,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "waived_reason" TEXT,
    "rescheduled_to" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSSSSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeePhilHealthSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_philhealth_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "gross_income" DECIMAL(14,2) NOT NULL,
    "ee_amount" DECIMAL(14,2) NOT NULL,
    "er_amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "waived_reason" TEXT,
    "rescheduled_to" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeePhilHealthSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeeHDMFSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_hdmf_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "gross_income" DECIMAL(14,2) NOT NULL,
    "ee_amount" DECIMAL(14,2) NOT NULL,
    "er_amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "waived_reason" TEXT,
    "rescheduled_to" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeHDMFSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."EmployeeTaxSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_tax_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "gross_income" DECIMAL(14,2) NOT NULL,
    "taxable_income" DECIMAL(14,2) NOT NULL,
    "tax_bracket" INTEGER NOT NULL DEFAULT 1,
    "fixed_tax" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tax_on_excess" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_withholding" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "waived_reason" TEXT,
    "rescheduled_to" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeTaxSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."Guard" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "employee_no" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "hire_date" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."GuardLoan" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_id" TEXT NOT NULL,
    "loan_type_id" TEXT NOT NULL,
    "principal_amount" DECIMAL(14,2) NOT NULL,
    "installment_count" INTEGER NOT NULL,
    "start_pay_period_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuardLoan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."GuardAllowance" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_id" TEXT NOT NULL,
    "allowance_type_id" TEXT NOT NULL,
    "total_amount" DECIMAL(14,2),
    "per_period_amount" DECIMAL(14,2),
    "start_pay_period_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuardAllowance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."GuardDeduction" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_id" TEXT NOT NULL,
    "deduction_type_id" TEXT NOT NULL,
    "total_amount" DECIMAL(14,2),
    "per_period_amount" DECIMAL(14,2),
    "start_pay_period_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuardDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."GuardSSS" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_id" TEXT NOT NULL,
    "sss_no" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "GuardSSS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."GuardPhilHealth" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_id" TEXT NOT NULL,
    "philhealth_no" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "GuardPhilHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."GuardHDMF" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_id" TEXT NOT NULL,
    "hdmf_no" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "GuardHDMF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."GuardTax" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_id" TEXT NOT NULL,
    "tin" TEXT NOT NULL,
    "rdo_code" TEXT,
    "tax_code" TEXT,
    "exemption_status" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuardTax_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."GuardLoanSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_loan_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3),
    "last_approval_id" TEXT,

    CONSTRAINT "GuardLoanSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."GuardAllowanceSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_allowance_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "GuardAllowanceSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."GuardDeductionSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_deduction_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "GuardDeductionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."GuardSSSSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_sss_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "ee_amount" DECIMAL(14,2) NOT NULL,
    "er_amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "GuardSSSSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."GuardPhilHealthSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_philhealth_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "ee_amount" DECIMAL(14,2) NOT NULL,
    "er_amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "GuardPhilHealthSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."GuardHDMFSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "base_amount" DECIMAL(14,2),
    "ee_amount" DECIMAL(14,2) NOT NULL,
    "er_amount" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL,
    "waived_reason" TEXT,
    "rescheduled_to" TEXT,
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuardHDMFSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "benefits"."GuardTaxSchedule" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_tax_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "gross_income" DECIMAL(14,2) NOT NULL,
    "taxable_income" DECIMAL(14,2) NOT NULL,
    "tax_bracket" INTEGER NOT NULL DEFAULT 1,
    "fixed_tax" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tax_on_excess" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_withholding" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuardTaxSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll"."Paysheet" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "guard_id" TEXT NOT NULL,
    "timesheet_ids" TEXT[],
    "hours_8h" DECIMAL(8,2) NOT NULL,
    "hours_ot" DECIMAL(8,2) NOT NULL,
    "hours_night" DECIMAL(8,2) NOT NULL,
    "amount_8h" DECIMAL(14,2) NOT NULL,
    "amount_ot" DECIMAL(14,2) NOT NULL,
    "amount_night" DECIMAL(14,2) NOT NULL,
    "allowances_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "loans_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "deductions_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sss_ee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sss_er" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "philhealth_ee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "philhealth_er" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "hdmf_ee" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "hdmf_er" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "lwop_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "absences_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "gross_pay" DECIMAL(14,2) NOT NULL,
    "net_pay" DECIMAL(14,2) NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Paysheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timekeeper"."Timesheet" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "pay_period_id" TEXT NOT NULL,
    "guard_id" TEXT NOT NULL,
    "dtr_ids" TEXT[],
    "total_hours_8h" DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    "total_hours_ot" DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    "total_hours_night" DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    "contract_rate_version_id" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_approval_id" TEXT,

    CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."Assignment" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "guard_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin"."_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "admin"."_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "admin"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "admin"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Role_code_key" ON "admin"."Role"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Feature_code_key" ON "admin"."Feature"("code");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_user_id_role_id_key" ON "admin"."UserRole"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "RoleFeature_role_id_feature_id_key" ON "admin"."RoleFeature"("role_id", "feature_id");

-- CreateIndex
CREATE UNIQUE INDEX "Password_userId_key" ON "admin"."Password"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "admin"."Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_entity_access_key" ON "admin"."Permission"("action", "entity", "access");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_target_type_key" ON "admin"."Verification"("target", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Connection_providerName_providerId_key" ON "admin"."Connection"("providerName", "providerId");

-- CreateIndex
CREATE INDEX "Passkey_userId_idx" ON "admin"."Passkey"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_code_key" ON "org"."Company"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Area_company_id_code_key" ON "org"."Area"("company_id", "code");

-- CreateIndex
CREATE INDEX "Subarea_company_id_area_id_idx" ON "org"."Subarea"("company_id", "area_id");

-- CreateIndex
CREATE INDEX "Location_company_id_area_id_subarea_id_idx" ON "org"."Location"("company_id", "area_id", "subarea_id");

-- CreateIndex
CREATE UNIQUE INDEX "Location_company_id_code_key" ON "org"."Location"("company_id", "code");

-- CreateIndex
CREATE INDEX "EmployeeAssignment_company_id_employee_id_effective_from_idx" ON "hr"."EmployeeAssignment"("company_id", "employee_id", "effective_from");

-- CreateIndex
CREATE INDEX "GuardQualification_company_id_position_id_idx" ON "hr"."GuardQualification"("company_id", "position_id");

-- CreateIndex
CREATE UNIQUE INDEX "GuardQualification_company_id_guard_id_position_id_key" ON "hr"."GuardQualification"("company_id", "guard_id", "position_id");

-- CreateIndex
CREATE UNIQUE INDEX "Position_company_id_code_key" ON "catalog"."Position"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Shift_company_id_code_key" ON "catalog"."Shift"("company_id", "code");

-- CreateIndex
CREATE INDEX "ContractRate_company_id_location_id_position_id_shift_id_ef_idx" ON "catalog"."ContractRate"("company_id", "location_id", "position_id", "shift_id", "effective_from", "effective_to");

-- CreateIndex
CREATE UNIQUE INDEX "LoanType_company_id_code_key" ON "catalog"."LoanType"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "AllowanceType_company_id_code_key" ON "catalog"."AllowanceType"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "DeductionType_company_id_code_key" ON "catalog"."DeductionType"("company_id", "code");

-- CreateIndex
CREATE INDEX "GovTableSSS_effective_from_effective_to_idx" ON "catalog"."GovTableSSS"("effective_from", "effective_to");

-- CreateIndex
CREATE INDEX "GovTablePhilHealth_effective_from_effective_to_idx" ON "catalog"."GovTablePhilHealth"("effective_from", "effective_to");

-- CreateIndex
CREATE INDEX "GovTableHDMF_effective_from_effective_to_idx" ON "catalog"."GovTableHDMF"("effective_from", "effective_to");

-- CreateIndex
CREATE INDEX "GovTableBIR_effective_from_effective_to_idx" ON "catalog"."GovTableBIR"("effective_from", "effective_to");

-- CreateIndex
CREATE INDEX "GovTableBIR_period_type_idx" ON "catalog"."GovTableBIR"("period_type");

-- CreateIndex
CREATE UNIQUE INDEX "WorkCalendarMonth_company_id_year_month_key" ON "catalog"."WorkCalendarMonth"("company_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "PayPeriod_company_id_code_key" ON "ops"."PayPeriod"("company_id", "code");

-- CreateIndex
CREATE INDEX "WorkSchedule_company_id_pay_period_id_date_guard_id_idx" ON "ops"."WorkSchedule"("company_id", "pay_period_id", "date", "guard_id");

-- CreateIndex
CREATE INDEX "RelieverSchedule_company_id_guard_id_idx" ON "ops"."RelieverSchedule"("company_id", "guard_id");

-- CreateIndex
CREATE UNIQUE INDEX "Device_company_id_serial_no_key" ON "ops"."Device"("company_id", "serial_no");

-- CreateIndex
CREATE INDEX "ClockEvent_company_id_occurred_at_idx" ON "ops"."ClockEvent"("company_id", "occurred_at");

-- CreateIndex
CREATE INDEX "ClockEvent_company_id_pay_period_id_guard_id_idx" ON "ops"."ClockEvent"("company_id", "pay_period_id", "guard_id");

-- CreateIndex
CREATE INDEX "ManualClockEventHeader_company_id_pay_period_id_idx" ON "timekeeper"."ManualClockEventHeader"("company_id", "pay_period_id");

-- CreateIndex
CREATE INDEX "ManualClockEventHeader_status_idx" ON "timekeeper"."ManualClockEventHeader"("status");

-- CreateIndex
CREATE INDEX "ManualClockEventHeader_upload_date_idx" ON "timekeeper"."ManualClockEventHeader"("upload_date");

-- CreateIndex
CREATE INDEX "ManualClockEventDetail_header_id_idx" ON "timekeeper"."ManualClockEventDetail"("header_id");

-- CreateIndex
CREATE INDEX "ManualClockEventDetail_employee_no_idx" ON "timekeeper"."ManualClockEventDetail"("employee_no");

-- CreateIndex
CREATE INDEX "ManualClockEventDetail_is_valid_idx" ON "timekeeper"."ManualClockEventDetail"("is_valid");

-- CreateIndex
CREATE INDEX "ManualClockEventDetail_is_processed_idx" ON "timekeeper"."ManualClockEventDetail"("is_processed");

-- CreateIndex
CREATE INDEX "TimeLog_company_id_pay_period_id_guard_id_date_idx" ON "timekeeper"."TimeLog"("company_id", "pay_period_id", "guard_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Dtr_company_id_guard_id_date_shift_id_key" ON "timekeeper"."Dtr"("company_id", "guard_id", "date", "shift_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeTimesheet_company_id_pay_period_id_employee_id_key" ON "timekeeper"."EmployeeTimesheet"("company_id", "pay_period_id", "employee_id");

-- CreateIndex
CREATE INDEX "Employee_company_id_employment_status_idx" ON "hr"."Employee"("company_id", "employment_status");

-- CreateIndex
CREATE INDEX "Employee_company_id_employee_type_idx" ON "hr"."Employee"("company_id", "employee_type");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_company_id_employee_no_key" ON "hr"."Employee"("company_id", "employee_no");

-- CreateIndex
CREATE UNIQUE INDEX "GuardProfile_employee_id_key" ON "hr"."GuardProfile"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "RegularEmployeeProfile_employee_id_key" ON "hr"."RegularEmployeeProfile"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "Department_company_id_code_key" ON "hr"."Department"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "CostCenter_company_id_code_key" ON "hr"."CostCenter"("company_id", "code");

-- CreateIndex
CREATE INDEX "EmploymentContract_company_id_employee_id_idx" ON "hr"."EmploymentContract"("company_id", "employee_id");

-- CreateIndex
CREATE INDEX "EmployeeLoan_company_id_employee_id_idx" ON "benefits"."EmployeeLoan"("company_id", "employee_id");

-- CreateIndex
CREATE INDEX "EmployeeAllowance_company_id_employee_id_idx" ON "benefits"."EmployeeAllowance"("company_id", "employee_id");

-- CreateIndex
CREATE INDEX "EmployeeDeduction_company_id_employee_id_idx" ON "benefits"."EmployeeDeduction"("company_id", "employee_id");

-- CreateIndex
CREATE INDEX "EmployeeGovContribution_employee_id_idx" ON "benefits"."EmployeeGovContribution"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeGovContribution_company_id_employee_id_contribution_key" ON "benefits"."EmployeeGovContribution"("company_id", "employee_id", "contribution_type");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeLoanSchedule_company_id_employee_loan_id_pay_period_key" ON "benefits"."EmployeeLoanSchedule"("company_id", "employee_loan_id", "pay_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeAllowanceSchedule_company_id_employee_allowance_id__key" ON "benefits"."EmployeeAllowanceSchedule"("company_id", "employee_allowance_id", "pay_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeDeductionSchedule_company_id_employee_deduction_id__key" ON "benefits"."EmployeeDeductionSchedule"("company_id", "employee_deduction_id", "pay_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "PayrollRun_company_id_pay_period_id_payroll_type_key" ON "payroll"."PayrollRun"("company_id", "pay_period_id", "payroll_type");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePayslip_company_id_payroll_run_id_employee_id_key" ON "payroll"."EmployeePayslip"("company_id", "payroll_run_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "CompensationPlan_company_id_code_key" ON "payroll"."CompensationPlan"("company_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "DtrCost_dtr_id_key" ON "payroll"."DtrCost"("dtr_id");

-- CreateIndex
CREATE INDEX "DtrCost_company_id_calendar_year_calendar_month_idx" ON "payroll"."DtrCost"("company_id", "calendar_year", "calendar_month");

-- CreateIndex
CREATE UNIQUE INDEX "TimesheetCost_timesheet_id_key" ON "payroll"."TimesheetCost"("timesheet_id");

-- CreateIndex
CREATE INDEX "TimesheetCost_company_id_computed_at_idx" ON "payroll"."TimesheetCost"("company_id", "computed_at");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePaysheet_company_id_pay_period_id_employee_id_key" ON "payroll"."EmployeePaysheet"("company_id", "pay_period_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payslip_paysheet_id_key" ON "payroll"."Payslip"("paysheet_id");

-- CreateIndex
CREATE INDEX "ChangeLog_company_id_schema_name_table_name_entity_id_occur_idx" ON "audit"."ChangeLog"("company_id", "schema_name", "table_name", "entity_id", "occurred_at");

-- CreateIndex
CREATE INDEX "ChangeLog_approval_id_idx" ON "audit"."ChangeLog"("approval_id");

-- CreateIndex
CREATE INDEX "Approval_company_id_schema_name_table_name_entity_id_idx" ON "workflow"."Approval"("company_id", "schema_name", "table_name", "entity_id");

-- CreateIndex
CREATE INDEX "Approval_company_id_status_requested_at_idx" ON "workflow"."Approval"("company_id", "status", "requested_at");

-- CreateIndex
CREATE UNIQUE INDEX "ApprovalPolicy_company_id_schema_name_table_name_action_key" ON "workflow"."ApprovalPolicy"("company_id", "schema_name", "table_name", "action");

-- CreateIndex
CREATE INDEX "Note_ownerId_idx" ON "admin"."Note"("ownerId");

-- CreateIndex
CREATE INDEX "Note_ownerId_updatedAt_idx" ON "admin"."Note"("ownerId", "updatedAt");

-- CreateIndex
CREATE INDEX "NoteImage_noteId_idx" ON "admin"."NoteImage"("noteId");

-- CreateIndex
CREATE UNIQUE INDEX "UserImage_userId_key" ON "admin"."UserImage"("userId");

-- CreateIndex
CREATE INDEX "DTR__timesheetId_idx" ON "timekeeper"."DTR_"("timesheetId");

-- CreateIndex
CREATE INDEX "timelog__dtrId_idx" ON "timekeeper"."timelog_"("dtrId");

-- CreateIndex
CREATE INDEX "clockEvent__timelogId_idx" ON "timekeeper"."clockEvent_"("timelogId");

-- CreateIndex
CREATE INDEX "Operation_status_idx" ON "ops"."Operation"("status");

-- CreateIndex
CREATE INDEX "Operation_priority_idx" ON "ops"."Operation"("priority");

-- CreateIndex
CREATE INDEX "Incident_operationId_idx" ON "ops"."Incident"("operationId");

-- CreateIndex
CREATE INDEX "Incident_severity_idx" ON "ops"."Incident"("severity");

-- CreateIndex
CREATE INDEX "Incident_status_idx" ON "ops"."Incident"("status");

-- CreateIndex
CREATE INDEX "Task_incidentId_idx" ON "ops"."Task"("incidentId");

-- CreateIndex
CREATE INDEX "Task_status_idx" ON "ops"."Task"("status");

-- CreateIndex
CREATE INDEX "Task_assignedTo_idx" ON "ops"."Task"("assignedTo");

-- CreateIndex
CREATE INDEX "Resource_taskId_idx" ON "ops"."Resource"("taskId");

-- CreateIndex
CREATE INDEX "Resource_type_idx" ON "ops"."Resource"("type");

-- CreateIndex
CREATE INDEX "Resource_status_idx" ON "ops"."Resource"("status");

-- CreateIndex
CREATE INDEX "EmployeeSchedule_company_id_date_idx" ON "timekeeper"."EmployeeSchedule"("company_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSchedule_company_id_employee_id_date_key" ON "timekeeper"."EmployeeSchedule"("company_id", "employee_id", "date");

-- CreateIndex
CREATE INDEX "EmployeeAttendance_company_id_date_idx" ON "timekeeper"."EmployeeAttendance"("company_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeAttendance_company_id_employee_id_date_key" ON "timekeeper"."EmployeeAttendance"("company_id", "employee_id", "date");

-- CreateIndex
CREATE INDEX "EmployeeLeave_company_id_employee_id_idx" ON "hr"."EmployeeLeave"("company_id", "employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeLeaveBalance_company_id_employee_id_year_leave_type_key" ON "hr"."EmployeeLeaveBalance"("company_id", "employee_id", "year", "leave_type");

-- CreateIndex
CREATE INDEX "Holiday_company_id_date_idx" ON "catalog"."Holiday"("company_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_company_id_date_key" ON "catalog"."Holiday"("company_id", "date");

-- CreateIndex
CREATE INDEX "EmployeeSSS_employee_id_idx" ON "benefits"."EmployeeSSS"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSSS_company_id_sss_no_key" ON "benefits"."EmployeeSSS"("company_id", "sss_no");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSSS_company_id_employee_id_key" ON "benefits"."EmployeeSSS"("company_id", "employee_id");

-- CreateIndex
CREATE INDEX "EmployeePhilHealth_employee_id_idx" ON "benefits"."EmployeePhilHealth"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePhilHealth_company_id_philhealth_no_key" ON "benefits"."EmployeePhilHealth"("company_id", "philhealth_no");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePhilHealth_company_id_employee_id_key" ON "benefits"."EmployeePhilHealth"("company_id", "employee_id");

-- CreateIndex
CREATE INDEX "EmployeeHDMF_employee_id_idx" ON "benefits"."EmployeeHDMF"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeHDMF_company_id_hdmf_no_key" ON "benefits"."EmployeeHDMF"("company_id", "hdmf_no");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeHDMF_company_id_employee_id_key" ON "benefits"."EmployeeHDMF"("company_id", "employee_id");

-- CreateIndex
CREATE INDEX "EmployeeTax_employee_id_idx" ON "benefits"."EmployeeTax"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeTax_company_id_tin_key" ON "benefits"."EmployeeTax"("company_id", "tin");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeTax_company_id_employee_id_key" ON "benefits"."EmployeeTax"("company_id", "employee_id");

-- CreateIndex
CREATE INDEX "EmployeeSSSSchedule_employee_sss_id_status_idx" ON "benefits"."EmployeeSSSSchedule"("employee_sss_id", "status");

-- CreateIndex
CREATE INDEX "EmployeeSSSSchedule_pay_period_id_status_idx" ON "benefits"."EmployeeSSSSchedule"("pay_period_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSSSSchedule_company_id_employee_sss_id_pay_period_i_key" ON "benefits"."EmployeeSSSSchedule"("company_id", "employee_sss_id", "pay_period_id");

-- CreateIndex
CREATE INDEX "EmployeePhilHealthSchedule_employee_philhealth_id_status_idx" ON "benefits"."EmployeePhilHealthSchedule"("employee_philhealth_id", "status");

-- CreateIndex
CREATE INDEX "EmployeePhilHealthSchedule_pay_period_id_status_idx" ON "benefits"."EmployeePhilHealthSchedule"("pay_period_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePhilHealthSchedule_company_id_employee_philhealth_i_key" ON "benefits"."EmployeePhilHealthSchedule"("company_id", "employee_philhealth_id", "pay_period_id");

-- CreateIndex
CREATE INDEX "EmployeeHDMFSchedule_employee_hdmf_id_status_idx" ON "benefits"."EmployeeHDMFSchedule"("employee_hdmf_id", "status");

-- CreateIndex
CREATE INDEX "EmployeeHDMFSchedule_pay_period_id_status_idx" ON "benefits"."EmployeeHDMFSchedule"("pay_period_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeHDMFSchedule_company_id_employee_hdmf_id_pay_period_key" ON "benefits"."EmployeeHDMFSchedule"("company_id", "employee_hdmf_id", "pay_period_id");

-- CreateIndex
CREATE INDEX "EmployeeTaxSchedule_employee_tax_id_status_idx" ON "benefits"."EmployeeTaxSchedule"("employee_tax_id", "status");

-- CreateIndex
CREATE INDEX "EmployeeTaxSchedule_pay_period_id_status_idx" ON "benefits"."EmployeeTaxSchedule"("pay_period_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeTaxSchedule_company_id_employee_tax_id_pay_period_i_key" ON "benefits"."EmployeeTaxSchedule"("company_id", "employee_tax_id", "pay_period_id");

-- CreateIndex
CREATE INDEX "Guard_company_id_status_idx" ON "hr"."Guard"("company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Guard_company_id_employee_no_key" ON "hr"."Guard"("company_id", "employee_no");

-- CreateIndex
CREATE INDEX "GuardLoan_company_id_guard_id_idx" ON "benefits"."GuardLoan"("company_id", "guard_id");

-- CreateIndex
CREATE INDEX "GuardAllowance_company_id_guard_id_idx" ON "benefits"."GuardAllowance"("company_id", "guard_id");

-- CreateIndex
CREATE INDEX "GuardDeduction_company_id_guard_id_idx" ON "benefits"."GuardDeduction"("company_id", "guard_id");

-- CreateIndex
CREATE UNIQUE INDEX "GuardSSS_company_id_sss_no_key" ON "benefits"."GuardSSS"("company_id", "sss_no");

-- CreateIndex
CREATE UNIQUE INDEX "GuardPhilHealth_company_id_philhealth_no_key" ON "benefits"."GuardPhilHealth"("company_id", "philhealth_no");

-- CreateIndex
CREATE UNIQUE INDEX "GuardHDMF_company_id_hdmf_no_key" ON "benefits"."GuardHDMF"("company_id", "hdmf_no");

-- CreateIndex
CREATE INDEX "GuardTax_guard_id_idx" ON "benefits"."GuardTax"("guard_id");

-- CreateIndex
CREATE UNIQUE INDEX "GuardTax_company_id_tin_key" ON "benefits"."GuardTax"("company_id", "tin");

-- CreateIndex
CREATE UNIQUE INDEX "GuardTax_company_id_guard_id_key" ON "benefits"."GuardTax"("company_id", "guard_id");

-- CreateIndex
CREATE UNIQUE INDEX "GuardLoanSchedule_company_id_guard_loan_id_pay_period_id_key" ON "benefits"."GuardLoanSchedule"("company_id", "guard_loan_id", "pay_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "GuardAllowanceSchedule_company_id_guard_allowance_id_pay_pe_key" ON "benefits"."GuardAllowanceSchedule"("company_id", "guard_allowance_id", "pay_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "GuardDeductionSchedule_company_id_guard_deduction_id_pay_pe_key" ON "benefits"."GuardDeductionSchedule"("company_id", "guard_deduction_id", "pay_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "GuardSSSSchedule_company_id_guard_sss_id_pay_period_id_key" ON "benefits"."GuardSSSSchedule"("company_id", "guard_sss_id", "pay_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "GuardPhilHealthSchedule_company_id_guard_philhealth_id_pay__key" ON "benefits"."GuardPhilHealthSchedule"("company_id", "guard_philhealth_id", "pay_period_id");

-- CreateIndex
CREATE INDEX "GuardHDMFSchedule_guard_id_status_idx" ON "benefits"."GuardHDMFSchedule"("guard_id", "status");

-- CreateIndex
CREATE INDEX "GuardHDMFSchedule_pay_period_id_status_idx" ON "benefits"."GuardHDMFSchedule"("pay_period_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GuardHDMFSchedule_company_id_guard_id_pay_period_id_key" ON "benefits"."GuardHDMFSchedule"("company_id", "guard_id", "pay_period_id");

-- CreateIndex
CREATE INDEX "GuardTaxSchedule_guard_tax_id_status_idx" ON "benefits"."GuardTaxSchedule"("guard_tax_id", "status");

-- CreateIndex
CREATE INDEX "GuardTaxSchedule_pay_period_id_status_idx" ON "benefits"."GuardTaxSchedule"("pay_period_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GuardTaxSchedule_company_id_guard_tax_id_pay_period_id_key" ON "benefits"."GuardTaxSchedule"("company_id", "guard_tax_id", "pay_period_id");

-- CreateIndex
CREATE UNIQUE INDEX "Paysheet_company_id_pay_period_id_guard_id_key" ON "payroll"."Paysheet"("company_id", "pay_period_id", "guard_id");

-- CreateIndex
CREATE UNIQUE INDEX "Timesheet_company_id_pay_period_id_guard_id_key" ON "timekeeper"."Timesheet"("company_id", "pay_period_id", "guard_id");

-- CreateIndex
CREATE INDEX "Assignment_company_id_guard_id_effective_from_idx" ON "hr"."Assignment"("company_id", "guard_id", "effective_from");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "admin"."_RoleToUser"("B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "admin"."_PermissionToRole"("B");

-- AddForeignKey
ALTER TABLE "admin"."Password" ADD CONSTRAINT "Password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin"."Connection" ADD CONSTRAINT "Connection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin"."Passkey" ADD CONSTRAINT "Passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."ClockEvent" ADD CONSTRAINT "ClockEvent_manual_detail_id_fkey" FOREIGN KEY ("manual_detail_id") REFERENCES "timekeeper"."ManualClockEventDetail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timekeeper"."ManualClockEventHeader" ADD CONSTRAINT "ManualClockEventHeader_pay_period_id_fkey" FOREIGN KEY ("pay_period_id") REFERENCES "ops"."PayPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timekeeper"."ManualClockEventDetail" ADD CONSTRAINT "ManualClockEventDetail_header_id_fkey" FOREIGN KEY ("header_id") REFERENCES "timekeeper"."ManualClockEventHeader"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."GuardProfile" ADD CONSTRAINT "GuardProfile_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."RegularEmployeeProfile" ADD CONSTRAINT "RegularEmployeeProfile_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "hr"."Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin"."Note" ADD CONSTRAINT "Note_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "admin"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin"."NoteImage" ADD CONSTRAINT "NoteImage_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "admin"."Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin"."UserImage" ADD CONSTRAINT "UserImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admin"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timekeeper"."DTR_" ADD CONSTRAINT "DTR__timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "timekeeper"."timesheet_"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timekeeper"."timelog_" ADD CONSTRAINT "timelog__dtrId_fkey" FOREIGN KEY ("dtrId") REFERENCES "timekeeper"."DTR_"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timekeeper"."clockEvent_" ADD CONSTRAINT "clockEvent__timelogId_fkey" FOREIGN KEY ("timelogId") REFERENCES "timekeeper"."timelog_"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Incident" ADD CONSTRAINT "Incident_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "ops"."Operation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Task" ADD CONSTRAINT "Task_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "ops"."Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ops"."Resource" ADD CONSTRAINT "Resource_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ops"."Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin"."_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "admin"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin"."_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "admin"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin"."_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "admin"."Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin"."_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "admin"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
