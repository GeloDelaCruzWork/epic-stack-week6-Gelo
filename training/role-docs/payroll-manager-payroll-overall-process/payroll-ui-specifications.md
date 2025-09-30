# Payroll System UI Specifications

## Overview

This document provides detailed UI specifications for the three main payroll
officer interfaces, including component layouts, interactions, and user flows.

## Interface 1: Paysheet Management Portal

**Access**: Payroll Officer, Verifier, Controller

### Screen Layout

```
┌────────────────────────────────────────────────────────────────────────┐
│  PAYROLL MANAGEMENT SYSTEM                              [User] [Logout] │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Pay Period: [▼ Jan 1-15, 2024]    View Mode: (●) Guard  ( ) Location  │
│  ──────────────────────────────────────────────────────────────────────│
│                                                                          │
│  ┌─────────────────────┬──────────────────────────────────────────────┐│
│  │ NAVIGATION          │ PAYSHEET DETAILS                              ││
│  │                     │                                               ││
│  │ [Search: ________] │ Guard Name: Juan Dela Cruz                    ││
│  │                     │ Employee ID: EMP-001                          ││
│  │ ○ Guards List      │ Pay Period: Jan 1-15, 2024                   ││
│  │   □ Dela Cruz, J.  │ Status: [Draft] [Actions ▼]                   ││
│  │   □ Santos, M.     │                                               ││
│  │   □ Reyes, A.      │ ┌─────────────────────────────────────────────┐││
│  │                     │ │ PAYSHEET SUMMARY                            │││
│  │ ○ By Location      │ │                                             │││
│  │   ▷ Location A     │ │ Basic Pay:        ₱ 15,500.00              │││
│  │     ▷ Detach. 1    │ │ Overtime:         ₱  2,100.00              │││
│  │       • Guard 1    │ │ Night Diff:       ₱    800.00              │││
│  │       • Guard 2    │ │ ─────────────────────────────               │││
│  │     ▷ Detach. 2    │ │ Gross Pay:        ₱ 18,400.00              │││
│  │   ▷ Location B     │ │                                             │││
│  │                     │ │ Allowances:       ₱  2,500.00 [+]          │││
│  │ [Load More...]      │ │ Deductions:       ₱  3,200.00 [-]          │││
│  │                     │ │ Tax:              ₱  1,200.00              │││
│  │                     │ │ ─────────────────────────────               │││
│  │                     │ │ NET PAY:          ₱ 16,500.00              │││
│  │                     │ └─────────────────────────────────────────────┘││
│  └─────────────────────┴──────────────────────────────────────────────┘│
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐│
│  │ [Timesheets] [Allowances] [Deductions]                             ││
│  ├────────────────────────────────────────────────────────────────────┤│
│  │                                                                     ││
│  │  Active Tab Content Area                                           ││
│  │                                                                     ││
│  └────────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────┘
```

### Tab Details

#### Timesheets Tab

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TIMESHEETS (3)                                    [Export] [Print]      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Location      | Detachment | Position  | Shift | Reg Hrs | OT | Amount │
│ ─────────────────────────────────────────────────────────────────────── │
│ ▼ Location A  | Main Gate  | Guard     | Day   | 96      | 8  | 8,500  │
│   Date Range: Jan 1-8                                                   │
│   Contract Rate: ₱75/hr                                                 │
│   [View DTR ▶]                                                          │
│                                                                          │
│ ▼ Location A  | Building 2 | Guard     | Night | 96      | 4  | 9,200  │
│   Date Range: Jan 9-15                                                  │
│   Contract Rate: ₱85/hr (Night)                                        │
│   [View DTR ▶]                                                          │
│                                                                          │
│ ▼ Location B  | Perimeter  | Supervisor| Day   | 40      | 0  | 4,500  │
│   Date Range: Jan 1-15                                                  │
│   Contract Rate: ₱100/hr                                                │
│   [View DTR ▶]                                                          │
│                                                                          │
│ ─────────────────────────────────────────────────────────────────────── │
│ TOTALS:                                 | 232    | 12     | 22,200     │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Allowances Tab

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ALLOWANCES & BENEFITS                              [Add] [Export]        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Regular Allowances                                                      │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Type          | Amount    | Frequency  | Status  | Actions         │  │
│ │ Transportation| ₱ 1,500   | Monthly    | Active  | [Waive] [Edit]  │  │
│ │ Meal          | ₱   800   | Per Period | Active  | [Waive] [Edit]  │  │
│ │ TOTAL:        | ₱ 2,300   |            |         |                 │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ Rewards & Bonuses                                                       │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Type          | Amount    | Reason              | Actions          │  │
│ │ Performance   | ₱   200   | Perfect Attendance  | [Remove]         │  │
│ │ TOTAL:        | ₱   200   |                     |                  │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ Benefits                                                                │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ No benefits for this period                                        │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ GRAND TOTAL ALLOWANCES: ₱ 2,500                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Deductions Tab

```
┌─────────────────────────────────────────────────────────────────────────┐
│ DEDUCTIONS                                         [Export] [Print]      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Loan Payments                                                           │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Loan Type     | Balance   | Monthly  | This Period | Actions       │  │
│ │ SSS Loan      | ₱ 10,000  | ₱ 500    | ₱ 500      | [Waive][Adjust]│  │
│ │ Emergency     | ₱  3,000  | ₱ 300    | ₱ 300      | [Waive][Adjust]│  │
│ │ TOTAL:        |           |          | ₱ 800      |                │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ Government Contributions                                                │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Type          | Employee  | Employer | Total      | Actions        │  │
│ │ SSS           | ₱ 500     | ₱ 500    | ₱ 1,000   | [View Details] │  │
│ │ PhilHealth    | ₱ 200     | ₱ 200    | ₱   400   | [View Details] │  │
│ │ Pag-IBIG      | ₱ 100     | ₱ 100    | ₱   200   | [View Details] │  │
│ │ TOTAL:        | ₱ 800     | ₱ 800    | ₱ 1,600   |                │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ Other Deductions                                                        │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Type          | Amount    | Reason              | Actions          │  │
│ │ Uniform       | ₱ 600     | Monthly installment | [Waive]          │  │
│ │ TOTAL:        | ₱ 600     |                     |                  │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│ TAX WITHHOLDING: ₱ 1,200                                               │
│ GRAND TOTAL DEDUCTIONS: ₱ 3,200                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### Interactive Elements

#### Waive Deduction Modal

```
┌─────────────────────────────────────────────┐
│ Waive Deduction                        [X]  │
├─────────────────────────────────────────────┤
│                                              │
│ Guard: Juan Dela Cruz                       │
│ Deduction: SSS Loan Payment                 │
│ Amount: ₱500                                 │
│                                              │
│ Reason for Waiver: *                        │
│ ┌──────────────────────────────────────────┐│
│ │                                           ││
│ │                                           ││
│ └──────────────────────────────────────────┘│
│                                              │
│ ⚠ This action will be logged and requires   │
│   approval from supervisor                  │
│                                              │
│        [Cancel]  [Confirm Waiver]           │
└─────────────────────────────────────────────┘
```

## Interface 2: Reference Data Management

### Main Screen

```
┌────────────────────────────────────────────────────────────────────────┐
│  REFERENCE DATA MANAGEMENT                              [Back to Portal]│
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Loans] [Allowances] [Gov Contributions] [Tax Tables] [Positions]      │
│                                                                          │
│  ──────────────────────────────────────────────────────────────────────│
└────────────────────────────────────────────────────────────────────────┘
```

### Loans Management Tab

```
┌────────────────────────────────────────────────────────────────────────┐
│ LOAN TYPES                                [Add New] [Import] [Export]   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Search: [___________] Category: [All ▼]  Status: [Active ▼]            │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────────┐│
│ │ □ | Name            | Category    | Max Amount | Interest | Actions  ││
│ │────────────────────────────────────────────────────────────────────  ││
│ │ □ | SSS Loan        | Government  | 50,000     | 10%      | [✏] [🗑] ││
│ │ □ | Emergency Loan  | Company     | 20,000     | 5%       | [✏] [🗑] ││
│ │ □ | Salary Loan     | Company     | 30,000     | 8%       | [✏] [🗑] ││
│ │ □ | Pag-IBIG Loan   | Government  | 100,000    | 6%       | [✏] [🗑] ││
│ │ □ | Educational     | Company     | 50,000     | 3%       | [✏] [🗑] ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ [Delete Selected]                          Showing 1-5 of 5 items       │
└────────────────────────────────────────────────────────────────────────┘
```

### Government Contributions Tab

```
┌────────────────────────────────────────────────────────────────────────┐
│ GOVERNMENT CONTRIBUTION TABLES              [Add] [Import] [Export]     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ SSS Contribution Table                     Effective: Jan 1, 2024       │
│ ┌──────────────────────────────────────────────────────────────────────┐│
│ │ Salary Range        | Employee Share | Employer Share | Total       ││
│ │────────────────────────────────────────────────────────────────────  ││
│ │ ₱0 - ₱4,250        | ₱180.00       | ₱390.00       | ₱570.00      ││
│ │ ₱4,250 - ₱4,750    | ₱202.50       | ₱437.50       | ₱640.00      ││
│ │ ₱4,750 - ₱5,250    | ₱225.00       | ₱485.00       | ₱710.00      ││
│ │ [View More...]                                                       ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ PhilHealth Contribution                    Premium Rate: 4.5%           │
│ ┌──────────────────────────────────────────────────────────────────────┐│
│ │ Monthly Salary     | Employee (2.25%) | Employer (2.25%) | Total    ││
│ │────────────────────────────────────────────────────────────────────  ││
│ │ ₱10,000 and below | ₱225.00         | ₱225.00         | ₱450.00    ││
│ │ ₱10,000 - ₱99,999 | 2.25% of salary | 2.25% of salary | 4.5%       ││
│ │ ₱100,000 and up   | ₱2,250.00       | ₱2,250.00       | ₱4,500.00  ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ Pag-IBIG Contribution                      [Edit Table]                 │
│ ┌──────────────────────────────────────────────────────────────────────┐│
│ │ Monthly Salary     | Employee       | Employer       | Total        ││
│ │────────────────────────────────────────────────────────────────────  ││
│ │ ₱1,500 and below  | 1% of salary   | 2% of salary   | 3%           ││
│ │ Over ₱1,500       | 2% of salary   | 2% of salary   | 4%           ││
│ │ Maximum            | ₱100           | ₱100           | ₱200         ││
│ └──────────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────────┘
```

## Interface 3: Guard Payment Configuration

### Main Configuration Screen

```
┌────────────────────────────────────────────────────────────────────────┐
│  GUARD PAYMENT CONFIGURATION                            [Back to Portal]│
├────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Guard: [▼ Select Guard...]   Component: [▼ Select Type...]            │
│                                                                          │
│  ──────────────────────────────────────────────────────────────────────│
│                                                                          │
│  Guard Information                                                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Name: Juan Dela Cruz          Employee ID: EMP-001               │  │
│  │ Position: Guard               Status: Active                      │  │
│  │ Hire Date: Jan 1, 2020       Current Location: Location A        │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Active Components                                [Add Component]       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Type       | Name           | Amount/Rate | Status  | Actions     │  │
│  │───────────────────────────────────────────────────────────────── │  │
│  │ Loan       | SSS Loan       | ₱10,000    | Active  | [Schedule]  │  │
│  │ Loan       | Emergency      | ₱3,000     | Active  | [Schedule]  │  │
│  │ Allowance  | Transportation | ₱1,500/mo  | Active  | [Schedule]  │  │
│  │ Allowance  | Meal          | ₱800/period | Active  | [Schedule]  │  │
│  │ Gov Cont.  | SSS           | Standard    | Active  | [View]      │  │
│  │ Gov Cont.  | PhilHealth    | Standard    | Active  | [View]      │  │
│  │ Gov Cont.  | Pag-IBIG      | Standard    | Active  | [View]      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Schedule Management Modal

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PAYMENT SCHEDULE - SSS Loan                                        [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Guard: Juan Dela Cruz                                                   │
│ Loan Details: ₱10,000 @ 10% interest                                   │
│ Monthly Payment: ₱500                                                   │
│ Remaining Balance: ₱8,500                                              │
│                                                                          │
│ Payment Schedule                                    [Generate Schedule] │
│ ┌──────────────────────────────────────────────────────────────────────┐│
│ │ Pay Period      | Scheduled | Paid    | Balance  | Status | Actions ││
│ │────────────────────────────────────────────────────────────────────  ││
│ │ Dec 16-31, 2023 | ₱500     | ₱500    | ₱9,500   | Paid   | [View]  ││
│ │ Jan 1-15, 2024  | ₱500     | ₱500    | ₱9,000   | Paid   | [View]  ││
│ │ Jan 16-31, 2024 | ₱500     | -       | ₱8,500   | Due    | [Pay]   ││
│ │ Feb 1-15, 2024  | ₱500     | -       | ₱8,000   | Sched. | [Edit]  ││
│ │ Feb 16-28, 2024 | ₱500     | -       | ₱7,500   | Sched. | [Edit]  ││
│ │ [View All...]                                                        ││
│ └──────────────────────────────────────────────────────────────────────┘│
│                                                                          │
│ Actions: [Restructure Loan] [Export Schedule] [Print]                   │
│                                                                          │
│                                          [Close]  [Save Changes]        │
└─────────────────────────────────────────────────────────────────────────┘
```

## Common UI Components

### Filter Panel

```
┌─────────────────────────────────────────┐
│ FILTERS                            [-]  │
├─────────────────────────────────────────┤
│ Pay Period:                             │
│ [▼ Jan 1-15, 2024          ]           │
│                                          │
│ Location:                                │
│ [▼ All Locations           ]           │
│                                          │
│ Status:                                  │
│ ☑ Draft                                 │
│ ☑ Verified                              │
│ ☑ Approved                              │
│ ☐ Paid                                  │
│                                          │
│ Guard Name:                             │
│ [_____________________]                 │
│                                          │
│      [Clear]  [Apply Filters]           │
└─────────────────────────────────────────┘
```

### Action Buttons

- Primary Actions: Blue background, white text
- Secondary Actions: White background, blue border
- Danger Actions: Red background, white text
- Disabled: Gray background, light gray text

### Status Indicators

- Draft: Yellow badge
- Verified: Blue badge
- Approved: Green badge
- Paid: Gray badge
- Error/Warning: Red badge

### Data Grid Features

- Sortable columns (click header)
- Resizable columns
- Checkbox selection
- Inline editing (where applicable)
- Pagination controls
- Export functionality

## Responsive Design Breakpoints

- Desktop: 1920px and above (full layout)
- Laptop: 1366px - 1919px (full layout, condensed spacing)
- Tablet: 768px - 1365px (stacked layout, collapsible panels)
- Mobile: Below 768px (single column, accordion navigation)

## Accessibility Requirements

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Focus indicators on all interactive elements
- Alt text for all icons and images

## Performance Specifications

- Initial page load: < 2 seconds
- Data grid loading: < 1 second for 100 records
- Search/filter response: < 500ms
- Modal open/close: < 200ms
- Auto-save draft every 30 seconds

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Features

- Session timeout after 30 minutes of inactivity
- Confirmation dialogs for destructive actions
- Audit trail for all modifications
- Role-based button/feature visibility
- Encrypted data transmission
- CSRF protection on all forms
