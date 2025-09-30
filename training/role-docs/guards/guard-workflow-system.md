# Guard Workflow System

## Biometric Attendance, Mobile App & Self-Service Portal

## Executive Summary

Based on the **Updated Role Narratives - Payroll System (Revised)**, this
document provides a comprehensive workflow and UI design for Guards - the
primary subjects of the payroll system. While guards are not traditional system
users, they interact with the system through biometric devices, mobile
applications, and a self-service web portal. This system ensures accurate time
tracking, provides visibility into their attendance and payroll information, and
enables basic self-service capabilities.

## Guard Role Overview

As defined in the Updated Role Narratives, Guards:

- Provide time and attendance data through biometric devices
- Clock in/out via fingerprint scanning
- Receive payslips and attendance information
- Can view (but not modify) their time records
- Report issues through supervisors or mobile app
- Access limited self-service features

## Core Interactions

### 1. Primary Interaction: Biometric Clock Events

#### A. Daily Routine

```
GUARD DAILY WORKFLOW
═══════════════════════════════════════

Arrival at Post
    ↓
Biometric Clock In
    ↓
Perform Duty
    ↓
Break (Clock Out/In if required)
    ↓
Resume Duty
    ↓
End of Shift
    ↓
Biometric Clock Out
    ↓
Verify Attendance (Optional via App)
```

#### B. Biometric Process

- Approach biometric device
- Place registered finger on scanner
- Wait for confirmation (beep/light)
- Device displays status message
- Clock event recorded and synced

### 2. Secondary Interaction: Mobile App (Android)

The mobile app provides guards with:

- Attendance verification
- Schedule viewing
- Payslip access
- Leave balance checking
- Incident reporting
- Emergency notifications

### 3. Tertiary Interaction: Web Self-Service Portal

Limited web access for:

- Detailed payslip viewing
- Document downloads
- Leave application submission
- Personal information updates
- Training schedules

## Android Mobile App Design

### 1. Login Screen

```
┌─────────────────────────────────┐
│      GUARD PORTAL               │
│   [Company Logo]                │
│                                  │
│   ┌───────────────────────────┐ │
│   │ Employee ID                │ │
│   │ [G-___________]           │ │
│   └───────────────────────────┘ │
│                                  │
│   ┌───────────────────────────┐ │
│   │ Password/PIN               │ │
│   │ [••••••••]                │ │
│   └───────────────────────────┘ │
│                                  │
│   [Login with Fingerprint 👆]   │
│                                  │
│   [LOGIN]                       │
│                                  │
│   Forgot PIN? Contact HR        │
│                                  │
│   Version 2.1.0                 │
└─────────────────────────────────┘
```

### 2. Main Dashboard

```
┌─────────────────────────────────┐
│ 👤 Juan Dela Cruz      [Menu ≡] │
│ Guard - Location A               │
├─────────────────────────────────┤
│                                  │
│   TODAY'S STATUS                │
│   ─────────────────             │
│   Schedule: 06:00 AM - 06:00 PM │
│   Clock In:  ✓ 05:58 AM        │
│   Clock Out: -- Pending         │
│   Status: ON DUTY               │
│                                  │
│   ┌───────────────────────────┐ │
│   │    QUICK ACTIONS          │ │
│   │                           │ │
│   │ [📅 My Schedule]          │ │
│   │ [💰 Payslip]              │ │
│   │ [📊 Attendance]           │ │
│   │ [🏖️ Leave Balance]        │ │
│   │ [📢 Announcements]        │ │
│   │ [🆘 Report Issue]         │ │
│   └───────────────────────────┘ │
│                                  │
│ [Home] [Profile] [Help] [Logout]│
└─────────────────────────────────┘
```

### 3. My Schedule View

```
┌─────────────────────────────────┐
│ ← MY SCHEDULE                   │
├─────────────────────────────────┤
│                                  │
│ January 2024         [Month ▼]  │
│                                  │
│ ┌─────────────────────────────┐ │
│ │ S  M  T  W  T  F  S         │ │
│ │    1  2  3  4  5  6         │ │
│ │    D  D  D  D  D  O         │ │
│ │ 7  8  9  10 11 12 13        │ │
│ │ O  N  N  N  N  N  O         │ │
│ │ 14 15 16 17 18 19 20        │ │
│ │ O  D  D  D  D  D  O         │ │
│ └─────────────────────────────┘ │
│                                  │
│ Legend:                          │
│ D-Day  N-Night  O-Off  L-Leave │
│                                  │
│ UPCOMING SHIFTS                 │
│ ────────────────                │
│ Tomorrow, Jan 16                │
│ Day Shift: 06:00 AM - 06:00 PM │
│ Location: A - Main Gate         │
│                                  │
│ Jan 17, Wednesday               │
│ Day Shift: 06:00 AM - 06:00 PM │
│ Location: A - Main Gate         │
│                                  │
│ [View Detailed Schedule]         │
└─────────────────────────────────┘
```

### 4. Attendance Record

```
┌─────────────────────────────────┐
│ ← ATTENDANCE RECORD             │
├─────────────────────────────────┤
│                                  │
│ Period: [Jan 1-15, 2024 ▼]      │
│                                  │
│ ATTENDANCE SUMMARY              │
│ ┌─────────────────────────────┐ │
│ │ Days Present:    12/15      │ │
│ │ Days Absent:     0          │ │
│ │ Days on Leave:   3          │ │
│ │ Late Count:      1          │ │
│ │ Perfect Days:    11         │ │
│ └─────────────────────────────┘ │
│                                  │
│ DAILY DETAILS                   │
│ ─────────────                   │
│ ┌─────────────────────────────┐ │
│ │ Jan 15 - Monday      ✓      │ │
│ │ In: 05:58 AM Out: 06:02 PM │ │
│ │ Hours: 12.07  Status: OK    │ │
│ ├─────────────────────────────┤ │
│ │ Jan 14 - Sunday      OFF    │ │
│ │ Scheduled Day Off           │ │
│ ├─────────────────────────────┤ │
│ │ Jan 13 - Saturday    ✓      │ │
│ │ In: 06:15 AM Out: 06:00 PM │ │
│ │ Hours: 11.75  Late: 15 min  │ │
│ ├─────────────────────────────┤ │
│ │ Jan 12 - Friday      L      │ │
│ │ Vacation Leave (Approved)   │ │
│ └─────────────────────────────┘ │
│                                  │
│ [View More] [Download Report]    │
└─────────────────────────────────┘
```

### 5. Payslip View

```
┌─────────────────────────────────┐
│ ← PAYSLIP                       │
├─────────────────────────────────┤
│                                  │
│ Period: Jan 1-15, 2024          │
│ Status: PAID ✓                  │
│ Paid Date: Jan 25, 2024         │
│                                  │
│ EARNINGS                        │
│ ┌─────────────────────────────┐ │
│ │ Basic Pay:      ₱ 7,500.00  │ │
│ │ Overtime:       ₱ 1,200.00  │ │
│ │ Night Diff:     ₱   450.00  │ │
│ │ Allowance:      ₱   800.00  │ │
│ │ ──────────────────────────  │ │
│ │ Gross Pay:      ₱ 9,950.00  │ │
│ └─────────────────────────────┘ │
│                                  │
│ DEDUCTIONS                      │
│ ┌─────────────────────────────┐ │
│ │ SSS:            ₱   450.00  │ │
│ │ PhilHealth:     ₱   200.00  │ │
│ │ Pag-IBIG:       ₱   100.00  │ │
│ │ Tax:            ₱   350.00  │ │
│ │ Loan:           ₱   500.00  │ │
│ │ ──────────────────────────  │ │
│ │ Total Ded:      ₱ 1,600.00  │ │
│ └─────────────────────────────┘ │
│                                  │
│ NET PAY:         ₱ 8,350.00     │
│                                  │
│ [Download PDF] [Email Copy]      │
└─────────────────────────────────┘
```

### 6. Leave Balance & Application

```
┌─────────────────────────────────┐
│ ← LEAVE MANAGEMENT              │
├─────────────────────────────────┤
│                                  │
│ LEAVE BALANCES                  │
│ ┌─────────────────────────────┐ │
│ │ Vacation Leave:    9/15     │ │
│ │ Sick Leave:        14/15    │ │
│ │ Emergency Leave:   3/3      │ │
│ └─────────────────────────────┘ │
│                                  │
│ [Apply for Leave]                │
│                                  │
│ RECENT APPLICATIONS             │
│ ─────────────────              │
│ ┌─────────────────────────────┐ │
│ │ Jan 12, 2024                │ │
│ │ Type: Vacation Leave        │ │
│ │ Days: 1                     │ │
│ │ Status: ✓ Approved          │ │
│ ├─────────────────────────────┤ │
│ │ Dec 25-26, 2023             │ │
│ │ Type: Vacation Leave        │ │
│ │ Days: 2                     │ │
│ │ Status: ✓ Approved          │ │
│ └─────────────────────────────┘ │
│                                  │
│ [View History]                   │
└─────────────────────────────────┘
```

### 7. Report Issue / Incident

```
┌─────────────────────────────────┐
│ ← REPORT ISSUE                  │
├─────────────────────────────────┤
│                                  │
│ Issue Type:                     │
│ ┌─────────────────────────────┐ │
│ │ [Select Issue Type ▼]       │ │
│ │ • Biometric Not Working     │ │
│ │ • Missing Clock Event       │ │
│ │ • Schedule Conflict         │ │
│ │ • Safety Concern            │ │
│ │ • Equipment Problem         │ │
│ │ • Other                     │ │
│ └─────────────────────────────┘ │
│                                  │
│ Date & Time:                    │
│ [Jan 15, 2024] [10:30 AM]      │
│                                  │
│ Location:                       │
│ [Location A - Main Gate ▼]      │
│                                  │
│ Description:                    │
│ ┌─────────────────────────────┐ │
│ │ Biometric device not        │ │
│ │ recognizing my fingerprint. │ │
│ │ Tried multiple times.       │ │
│ │ Manual entry needed.        │ │
│ └─────────────────────────────┘ │
│                                  │
│ [📷 Attach Photo]               │
│                                  │
│ Priority: ○ Low ● Medium ○ High │
│                                  │
│ [Submit Report]                  │
└─────────────────────────────────┘
```

### 8. Notifications & Announcements

```
┌─────────────────────────────────┐
│ ← NOTIFICATIONS                 │
├─────────────────────────────────┤
│                                  │
│ 🔔 3 New Notifications          │
│                                  │
│ TODAY                           │
│ ┌─────────────────────────────┐ │
│ │ 💰 Payslip Available        │ │
│ │ 2 hours ago                │ │
│ │ Your payslip for Jan 1-15  │ │
│ │ is now available.           │ │
│ ├─────────────────────────────┤ │
│ │ 📅 Schedule Update          │ │
│ │ 5 hours ago                │ │
│ │ Your schedule for next     │ │
│ │ week has been posted.      │ │
│ ├─────────────────────────────┤ │
│ │ ✓ Leave Approved           │ │
│ │ 8 hours ago                │ │
│ │ Your leave request for     │ │
│ │ Jan 20 has been approved.  │ │
│ └─────────────────────────────┘ │
│                                  │
│ YESTERDAY                       │
│ ┌─────────────────────────────┐ │
│ │ 📢 Company Announcement     │ │
│ │ New safety protocols...    │ │
│ └─────────────────────────────┘ │
│                                  │
│ [Mark All Read] [Settings]       │
└─────────────────────────────────┘
```

## Web Self-Service Portal

### 1. Login Page

```
┌────────────────────────────────────────────────────────────────────────┐
│  GUARD SELF-SERVICE PORTAL                             [Company Logo]   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                         EMPLOYEE LOGIN                                  │
│                                                                          │
│                    ┌─────────────────────────┐                         │
│                    │                         │                         │
│                    │    [Company Logo]       │                         │
│                    │                         │                         │
│                    │  Employee ID:           │                         │
│                    │  [G-_______________]    │                         │
│                    │                         │                         │
│                    │  Password:              │                         │
│                    │  [•••••••••••••••]     │                         │
│                    │                         │                         │
│                    │  □ Remember me          │                         │
│                    │                         │                         │
│                    │     [LOGIN]             │                         │
│                    │                         │                         │
│                    │  Forgot Password?       │                         │
│                    │  Contact HR Department  │                         │
│                    └─────────────────────────┘                         │
│                                                                          │
│  Download Mobile App: [Android] [iOS Coming Soon]                       │
└────────────────────────────────────────────────────────────────────────┘
```

### 2. Dashboard

```
┌────────────────────────────────────────────────────────────────────────┐
│  GUARD PORTAL                                   Juan Dela Cruz [Logout] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Dashboard] [Schedule] [Attendance] [Payslips] [Leave] [Documents]     │
│                                                                          │
│  WELCOME, JUAN!                                        Today: Jan 15    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                         QUICK OVERVIEW                            │  │
│  │                                                                   │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│  │
│  │  │  Current    │  │  This Month │  │    Leave    │  │  Next   ││  │
│  │  │   Status    │  │  Attendance │  │   Balance   │  │  Shift  ││  │
│  │  │  ON DUTY    │  │   12/15     │  │   VL: 9     │  │  6:00 AM││  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────┘│  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────────────────┬────────────────────────────┐  │
│  │ TODAY'S SCHEDULE                    │ RECENT ACTIVITIES          │  │
│  │                                     │                             │  │
│  │ Shift: Day Shift                    │ • Clocked in at 5:58 AM    │  │
│  │ Time: 06:00 AM - 06:00 PM          │ • Payslip generated         │  │
│  │ Location: Location A - Main Gate   │ • Schedule updated          │  │
│  │ Position: Security Guard           │ • Leave balance updated    │  │
│  │                                     │                             │  │
│  │ Clock In: ✓ 05:58 AM              │ [View All Activities]       │  │
│  │ Clock Out: -- Pending              │                             │  │
│  └─────────────────────────────────────┴────────────────────────────┘  │
│                                                                          │
│  ANNOUNCEMENTS                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 📢 Uniform distribution on Jan 20 at HR Office                   │  │
│  │ 📢 Safety training scheduled for all guards on Jan 25            │  │
│  │ 📢 Deadline for government ID updates: Jan 31                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 3. Schedule Calendar View

```
┌────────────────────────────────────────────────────────────────────────┐
│  MY SCHEDULE                                                   [Print]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Month: [January 2024 ▼]               View: [Calendar ▼] [List]       │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Sunday   Monday   Tuesday  Wednesday Thursday  Friday   Saturday │  │
│  │         1        2        3         4        5        6         │  │
│  │         DAY      DAY      DAY       DAY      DAY      OFF       │  │
│  │         6-6      6-6      6-6       6-6      6-6                │  │
│  │                                                                   │  │
│  │ 7       8        9        10        11       12       13        │  │
│  │ OFF     NIGHT    NIGHT    NIGHT     NIGHT    NIGHT    OFF       │  │
│  │         6PM-6AM  6PM-6AM  6PM-6AM   6PM-6AM  6PM-6AM            │  │
│  │                                                                   │  │
│  │ 14      15       16       17        18       19       20        │  │
│  │ OFF     DAY ●    DAY      DAY       DAY      DAY      OFF       │  │
│  │         6-6      6-6      6-6       6-6      6-6                │  │
│  │         TODAY                                                    │  │
│  │                                                                   │  │
│  │ 21      22       23       24        25       26       27        │  │
│  │ OFF     DAY      DAY      DAY       DAY      DAY      OFF       │  │
│  │         6-6      6-6      6-6       6-6      6-6                │  │
│  │                                                                   │  │
│  │ 28      29       30       31                                    │  │
│  │ OFF     NIGHT    NIGHT    NIGHT                                 │  │
│  │         6PM-6AM  6PM-6AM  6PM-6AM                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  SCHEDULE LEGEND                                                        │
│  DAY: Day Shift (6AM-6PM)  NIGHT: Night Shift (6PM-6AM)  OFF: Day Off  │
│  LEAVE: Approved Leave     HOLIDAY: Company Holiday                     │
└────────────────────────────────────────────────────────────────────────┘
```

### 4. Detailed Payslip View

```
┌────────────────────────────────────────────────────────────────────────┐
│  PAYSLIP DETAILS                                      [Download] [Print]│
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Pay Period: January 1-15, 2024                    Payment Date: Jan 25 │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ EMPLOYEE INFORMATION                                              │  │
│  │ Name: Juan Miguel Dela Cruz          Employee ID: G-001          │  │
│  │ Position: Security Guard             Department: Security        │  │
│  │ Location: Location A                 Tax Status: S               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌─────────────────────────────────────┬────────────────────────────┐  │
│  │ EARNINGS                            │ DEDUCTIONS                  │  │
│  │                                     │                             │  │
│  │ Basic Pay (96 hrs)    ₱ 7,200.00   │ SSS              ₱ 450.00  │  │
│  │ Overtime (16 hrs)     ₱ 1,500.00   │ PhilHealth       ₱ 200.00  │  │
│  │ Night Diff (48 hrs)   ₱   480.00   │ Pag-IBIG         ₱ 100.00  │  │
│  │ Holiday Pay           ₱   500.00   │ Tax              ₱ 350.00  │  │
│  │ Allowances:                         │ Loans:                      │  │
│  │  Transportation       ₱   500.00   │  SSS Loan        ₱ 300.00  │  │
│  │  Meal                 ₱   300.00   │  Company Loan    ₱ 200.00  │  │
│  │                                     │ Other:                      │  │
│  │                                     │  Uniform         ₱ 150.00  │  │
│  │                                     │                             │  │
│  │ GROSS PAY            ₱10,480.00    │ TOTAL DED       ₱1,750.00  │  │
│  └─────────────────────────────────────┴────────────────────────────┘  │
│                                                                          │
│  NET PAY: ₱ 8,730.00 (Eight Thousand Seven Hundred Thirty Pesos)      │
│                                                                          │
│  YEAR-TO-DATE TOTALS                                                   │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ YTD Gross: ₱10,480.00   YTD Tax: ₱350.00   YTD Net: ₱8,730.00  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 5. Leave Application Form

```
┌────────────────────────────────────────────────────────────────────────┐
│  LEAVE APPLICATION                                            [Cancel]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  LEAVE DETAILS                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Leave Type: [Vacation Leave ▼]                                   │  │
│  │             • Vacation Leave (Balance: 9 days)                   │  │
│  │             • Sick Leave (Balance: 14 days)                      │  │
│  │             • Emergency Leave (Balance: 3 days)                  │  │
│  │                                                                   │  │
│  │ Start Date: [____/____/______]  End Date: [____/____/______]     │  │
│  │                                                                   │  │
│  │ Number of Days: [___] (Auto-calculated)                         │  │
│  │                                                                   │  │
│  │ Reason:                                                          │  │
│  │ ┌────────────────────────────────────────────────────────────┐  │  │
│  │ │                                                              │  │  │
│  │ │                                                              │  │  │
│  │ └────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │ Contact During Leave:                                            │  │
│  │ Phone: [+63 _______________]  Alt: [___________________]        │  │
│  │                                                                   │  │
│  │ □ I understand that this leave is subject to approval           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  LEAVE BALANCE AFTER APPLICATION                                        │
│  Current: 9 days → After Approval: 6 days                              │
│                                                                          │
│  [Save as Draft] [Submit Application]                                   │
└────────────────────────────────────────────────────────────────────────┘
```

## Biometric Device Interface

### Device Display Messages

```
┌─────────────────────┐
│  BIOMETRIC DEVICE   │
├─────────────────────┤
│                     │
│   Place Finger      │
│   ▼                 │
│  ┌───────────────┐  │
│  │               │  │
│  │  [Fingerprint │  │
│  │    Scanner]   │  │
│  │               │  │
│  └───────────────┘  │
│                     │
│  Status Messages:   │
│                     │
│  "Welcome"          │
│  "Processing..."    │
│  "Accepted ✓"       │
│  "Try Again ✗"      │
│  "Unknown User"     │
│                     │
│  [Time: 05:58 AM]   │
└─────────────────────┘
```

### Clock Event Confirmation

```
SUCCESS SCENARIOS:

Clock In:
┌─────────────────────┐
│  ✓ CLOCK IN         │
│  Juan Dela Cruz     │
│  05:58 AM           │
│  Have a good day!   │
│  [BEEP]             │
└─────────────────────┘

Clock Out:
┌─────────────────────┐
│  ✓ CLOCK OUT        │
│  Juan Dela Cruz     │
│  06:02 PM           │
│  Total: 12.07 hrs   │
│  [BEEP]             │
└─────────────────────┘

ERROR SCENARIOS:

Not Recognized:
┌─────────────────────┐
│  ✗ NOT RECOGNIZED   │
│  Please try again   │
│  or contact HR      │
│  [BEEP BEEP]        │
└─────────────────────┘

Already Clocked:
┌─────────────────────┐
│  ⚠ ALREADY IN       │
│  Last: 05:58 AM     │
│  Clock out first    │
│  [BEEP]             │
└─────────────────────┘
```

## Database Schema (Guard-Specific Tables)

```sql
-- Guard Mobile App Data
model GuardAppSession {
  id                String   @id @default(cuid())
  guardId           String

  -- Session Details
  deviceId          String
  deviceModel       String
  appVersion        String
  fcmToken          String?  // For push notifications

  -- Session State
  loginAt           DateTime @default(now())
  lastActivityAt    DateTime
  logoutAt          DateTime?
  isActive          Boolean @default(true)

  guard             Guard @relation(fields: [guardId], references: [id])

  @@index([guardId])
  @@index([deviceId])
}

-- Guard Notifications
model GuardNotification {
  id                String   @id @default(cuid())
  guardId           String

  -- Notification Details
  type              NotificationType
  title             String
  message           String
  data              Json?    // Additional data

  -- Delivery Status
  sentAt            DateTime @default(now())
  deliveredAt       DateTime?
  readAt            DateTime?

  -- Priority
  priority          Priority @default(NORMAL)
  expiresAt         DateTime?

  guard             Guard @relation(fields: [guardId], references: [id])

  @@index([guardId])
  @@index([type])
  @@index([readAt])
}

-- Guard Document Access
model GuardDocument {
  id                String   @id @default(cuid())
  guardId           String

  -- Document Details
  documentType      GuardDocType
  documentName      String
  fileUrl           String

  -- Access Control
  isVisible         Boolean @default(true)
  downloadCount     Int @default(0)
  lastDownloadAt    DateTime?

  -- Metadata
  uploadedBy        String
  uploadedAt        DateTime @default(now())

  guard             Guard @relation(fields: [guardId], references: [id])

  @@index([guardId])
  @@index([documentType])
}

-- Guard Self-Service Requests
model GuardRequest {
  id                String   @id @default(cuid())
  guardId           String

  -- Request Details
  requestType       RequestType
  subject           String
  description       String
  attachments       Json?    // Array of file URLs

  -- Status
  status            RequestStatus @default(PENDING)
  priority          Priority @default(NORMAL)

  -- Response
  respondedBy       String?
  respondedAt       DateTime?
  response          String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  guard             Guard @relation(fields: [guardId], references: [id])

  @@index([guardId])
  @@index([requestType])
  @@index([status])
}

-- Guard Training Records
model GuardTraining {
  id                String   @id @default(cuid())
  guardId           String

  -- Training Details
  trainingName      String
  trainingType      TrainingType
  description       String?

  -- Schedule
  scheduledDate     DateTime
  completedDate     DateTime?

  -- Results
  status            TrainingStatus @default(SCHEDULED)
  score             Int?
  certificateUrl    String?

  -- Tracking
  notifiedAt        DateTime?
  reminderSentAt    DateTime?

  guard             Guard @relation(fields: [guardId], references: [id])

  @@index([guardId])
  @@index([scheduledDate])
  @@index([status])
}

-- Enums
enum NotificationType {
  SCHEDULE_UPDATE
  PAYSLIP_READY
  LEAVE_STATUS
  ANNOUNCEMENT
  REMINDER
  ALERT
  SYSTEM
}

enum Priority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum GuardDocType {
  PAYSLIP
  CONTRACT
  MEMO
  CERTIFICATE
  ID_CARD
  POLICY
  OTHER
}

enum RequestType {
  DOCUMENT_REQUEST
  INFORMATION_UPDATE
  SCHEDULE_INQUIRY
  PAYROLL_INQUIRY
  LEAVE_APPLICATION
  COMPLAINT
  OTHER
}

enum RequestStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
  REJECTED
  CANCELLED
}

enum TrainingType {
  ORIENTATION
  SAFETY
  SECURITY
  COMPLIANCE
  SKILL_DEVELOPMENT
  REFRESHER
}

enum TrainingStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  FAILED
  CANCELLED
  POSTPONED
}
```

## Integration Points

### 1. With Biometric System

- Fingerprint enrollment
- Daily clock events
- Device status monitoring
- Sync verification

### 2. With Android Mobile Sync

- Real-time clock event transmission
- Offline data queuing
- Batch synchronization
- Conflict resolution

### 3. With Timekeeper System

- Clock events flow to timelogs
- Attendance verification
- Exception reporting

### 4. With Payroll System

- Payslip generation and delivery
- Deduction visibility
- Net pay information

### 5. With HR System

- Leave balance updates
- Document distribution
- Training schedules
- Personal information

## Business Rules

### Biometric Rules

1. **Enrollment Requirements**
   - Minimum 3 fingerprint scans
   - Quality threshold > 70%
   - At least 2 fingers enrolled
   - Backup finger mandatory

2. **Clock Event Rules**
   - Minimum 5 minutes between events
   - Grace period: 15 minutes
   - Auto clock-out after 24 hours
   - Duplicate prevention

### Mobile App Rules

1. **Access Control**
   - PIN/Password required
   - Biometric login optional
   - Session timeout: 30 minutes
   - Device registration required

2. **Data Visibility**
   - Current and previous month only
   - Last 3 payslips
   - Cannot view other guards' data
   - Cannot modify historical data

### Self-Service Rules

1. **Leave Applications**
   - Advance notice required
   - Balance must be sufficient
   - Supervisor approval needed
   - Cannot overlap with scheduled duty

2. **Document Access**
   - Payslips for last 6 months
   - Current year documents only
   - Download limits apply
   - Watermarked PDFs

## Security Features

### Mobile App Security

- Encrypted data transmission
- Certificate pinning
- Root detection
- App tampering detection
- Secure local storage

### Portal Security

- HTTPS only
- Session management
- CAPTCHA for login
- Account lockout
- Password complexity

### Biometric Security

- Template encryption
- Anti-spoofing detection
- Liveness detection
- Template versioning
- Audit logging

## Notification System

### Push Notifications

- Schedule changes
- Payslip availability
- Leave approvals
- Emergency alerts
- System announcements

### SMS Notifications (Optional)

- Critical alerts
- Payslip PIN
- Password reset
- Emergency instructions

### In-App Notifications

- All system messages
- Read receipts
- Priority levels
- Expiration handling

## Offline Capabilities

### Mobile App Offline Mode

- View cached schedule
- View last payslip
- View attendance history
- Queue leave applications
- Store incident reports

### Sync on Connection

- Upload queued data
- Download updates
- Resolve conflicts
- Update cache

## Success Metrics

### Adoption Metrics

- App installation rate: > 90%
- Daily active users: > 80%
- Portal login frequency: > 60%
- Biometric enrollment: 100%

### Usage Metrics

- Clock event success rate: > 98%
- App session duration: > 3 minutes
- Feature utilization: > 70%
- Self-service adoption: > 50%

### Satisfaction Metrics

- App rating: > 4.0/5
- Portal usability: > 4/5
- Issue resolution time: < 24 hours
- Feature request implementation: > 30%

## Implementation Priorities

### Phase 1: Biometric Foundation

1. Enrollment process
2. Clock event capture
3. Basic sync capability
4. Device management

### Phase 2: Mobile App MVP

1. Login and authentication
2. Schedule viewing
3. Attendance display
4. Basic notifications

### Phase 3: Enhanced Features

1. Payslip access
2. Leave management
3. Issue reporting
4. Full notifications

### Phase 4: Web Portal

1. Self-service portal
2. Document management
3. Advanced features
4. Integration completion

## Conclusion

This Guard Workflow System provides:

1. **Seamless Biometric Integration** - Reliable attendance capture
2. **Comprehensive Mobile App** - Full-featured Android application
3. **Self-Service Portal** - Web access for detailed information
4. **Real-Time Information** - Immediate access to schedules and payslips
5. **Two-Way Communication** - Issue reporting and notifications

The system empowers guards with visibility and limited self-service capabilities
while maintaining the integrity of the time and attendance system through
biometric authentication and controlled data access.
