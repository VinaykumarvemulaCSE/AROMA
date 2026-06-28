# Staff Management Documentation

## Scope
The staff management system in AROMA-CAFE is designed for **admin overview only**. It provides basic staff directory functionality without complex scheduling or shift management features.

## Current Features
- **Add Staff Members**: Add new staff with name, role, email, phone, and active status
- **View Staff Directory**: See all staff members in a table view
- **Update Staff Status**: Toggle active/inactive status for staff members
- **Remove Staff**: Delete staff members from the directory

## Staff Roles Supported
- Owner
- Manager
- Chef
- Waiter
- Delivery

## What Staff Management Does NOT Include
- ❌ Shift scheduling
- ❌ Time tracking
- ❌ Attendance management
- ❌ Payroll management
- ❌ Permission-based access control (all staff entries are visible to admin only)
- ❌ Staff authentication/login to the system
- ❌ Task assignment

## Technical Implementation
- **Store**: `src/lib/store/staff.ts` - Zustand store with Firestore integration
- **Admin Page**: `src/routes/admin.staff.tsx` - Admin interface for staff management
- **Firestore Collection**: `staff` - Stores staff member documents
- **Security**: Admin-only access via Firestore security rules

## Future Enhancements (Optional)
If expanded in the future, consider adding:
- Shift scheduling
- Attendance tracking
- Staff-specific permissions
- Staff login/authentication
- Task assignment system
