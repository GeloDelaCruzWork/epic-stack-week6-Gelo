# Payslip Tests Documentation

## Test Structure

The payslip feature includes comprehensive testing at multiple levels:

### 1. Unit Tests

**Location:** `app/components/payslip/payslip-layout.test.tsx`

Tests the React components in isolation:

- `PayslipLayout` component rendering
- `PayslipSheet` component (2-per-page layout)
- Currency formatting
- Data display logic

**Run:** `npm test payslip-layout`

**Known Issues:**

- Database initialization conflicts may occur if test DB already exists
- Run `npx prisma migrate reset` if you encounter database errors

### 2. Integration Tests

**Location:** `app/routes/payslips.test.ts`

Tests the route loaders and actions:

- Data fetching logic
- Payslip generation
- Error handling
- Authentication requirements

**Run:** `npm test payslips.test`

### 3. E2E Tests

#### Basic Tests

**Location:** `tests/e2e/payslips-basic.test.ts`

Simple tests to verify routes exist and basic functionality:

- Authentication requirements
- Route accessibility
- Verification page access

**Run:** `npx playwright test tests/e2e/payslips-basic.test.ts`

#### Simple Tests

**Location:** `tests/e2e/payslips-simple.test.ts`

User workflow tests with existing data:

- Navigation to payslips page
- Dropdown menu integration
- Generation and preview
- Print preview

**Run:** `npm run test:payslips`

#### Full Tests

**Location:** `tests/e2e/payslips.test.ts`

Comprehensive tests with test data setup:

- Complete workflows
- Data creation and cleanup
- PDF generation
- QR code verification

**Run:** `npm run test:payslips:full`

## Test Commands

```bash
# Run simple E2E tests with UI
npm run test:payslips

# Run simple E2E tests headlessly
npm run test:payslips:run

# Run full E2E test suite with UI
npm run test:payslips:full

# Run all payslip E2E tests
npm run test:payslips:all

# Run unit tests
npm test payslip-layout

# Run integration tests
npm test payslips.test

# Run basic E2E tests
npx playwright test tests/e2e/payslips-basic.test.ts
```

## Known Issues & Solutions

### Issue 1: Authentication State in Tests

**Problem:** Tests fail because authentication doesn't persist between page
navigations **Solution:**

- Use authenticated fixtures if available
- Or login before each navigation
- The basic tests pass because they handle authentication properly

### Issue 2: Database Already Exists

**Problem:** Unit tests fail with "Database epic_test_db already exists"
**Solution:**

```bash
# Reset test database
npx prisma migrate reset --force

# Or drop and recreate
psql -U epic_user -h localhost -p 5433 -d postgres -c "DROP DATABASE IF EXISTS epic_test_db;"
```

### Issue 3: Missing Test Data

**Problem:** Tests expect pay periods and employees to exist **Solution:**

```bash
# Seed the database with test data
npx tsx prisma/seed-payslips.ts
```

### Issue 4: Timeout Errors

**Problem:** Tests timeout waiting for elements **Solution:**

- Increase timeout in test config
- Check if dev server is running: `npm run dev`
- Verify routes are accessible manually

## Test Data Requirements

For E2E tests to work properly, ensure:

1. **Database is seeded** with at least:
   - 1 pay period
   - 3+ employees
   - Admin user account

2. **Dev server is running**:

   ```bash
   npm run dev
   ```

3. **User credentials exist**:
   - Username: `kody`
   - Password: `kodylovesyou`
   - Has admin role

## Manual Testing Checklist

If automated tests fail, verify manually:

1. ✅ Can login as admin user
2. ✅ Can access `/payslips` route
3. ✅ Payslips appears in user dropdown menu
4. ✅ Can select pay period and employees
5. ✅ Can generate payslips
6. ✅ Preview opens in new tab
7. ✅ PDF download works
8. ✅ QR codes are displayed
9. ✅ Verification URL works: `/payslips/verify/{id}`
10. ✅ Print preview shows 2 payslips per page

## Debugging Tests

To debug failing tests:

1. **Run with UI Mode:**

   ```bash
   npm run test:payslips
   ```

2. **Check browser console:**
   - Look for network errors
   - Check authentication cookies
   - Verify API responses

3. **Add debug output:**

   ```typescript
   console.log('Current URL:', page.url())
   await page.screenshot({ path: 'debug.png' })
   ```

4. **Run specific test:**
   ```bash
   npx playwright test tests/e2e/payslips-basic.test.ts --debug
   ```

## CI/CD Considerations

For continuous integration:

1. Ensure PostgreSQL service is running
2. Set up test database before tests
3. Seed with required test data
4. Run tests in sequence, not parallel (database conflicts)
5. Clean up test data after completion

## Test Coverage

Current test coverage includes:

- ✅ Component rendering
- ✅ Route handlers
- ✅ Authentication flows
- ✅ CRUD operations
- ✅ PDF generation
- ✅ QR code verification
- ✅ Print layout
- ✅ Error handling

## Future Improvements

1. Add fixtures for authenticated sessions
2. Create test utilities for common operations
3. Add performance tests for large datasets
4. Test email notifications (when implemented)
5. Add accessibility tests
6. Test different user roles/permissions
