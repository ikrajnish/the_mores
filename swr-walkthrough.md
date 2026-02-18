# Walkthrough - New Features

## 1. Walk-in Booking Enhancements
- **View Profile Modal**: Admin can view customer profile directly from booking screen.
- **Service Search**: Admin can search for services by name.
- **Manual Pricing Override**: Admin can manually select a membership tier to override pricing.

## 2. Admin Users Page Responsiveness
The Admin Users page (`/admin/users`) is now fully responsive:
- **Mobile View**: Displays user cards instead of a wide table.
- **Tablet/Desktop**: Retains efficient table layout.
- **Filters**: Stacked on mobile for better usability.

## 3. Account Merge Feature
Resolves conflict between Walk-in (Phone-only) and Google (Email-only) accounts.

### How to Merge Accounts (Admin Scope)
1.  Navigate to **Admin > Users**.
2.  Click the **"Merge Users"** button in the top header (or below search on mobile).
3.  Enter the **Source Phone Number** (The Walk-in account to be merged/deleted).
4.  Enter the **Target Email Address** (The Google account to keep).
5.  Click **"Verify Users"** to see a preview.
6.  Confirm that the source user is correct and the target user is correct.
7.  Click **"CONFIRM MERGE"**.
    - **Outcome**: 
        - All bookings from Source relate to Target.
        - Source Membership is transferred to Target (if Target has none).
        - Target gets Source's phone number.
        - Source User is permanently deleted.
    - **Note**: You cannot merge/delete an **ADMIN** account as a Source. Only **CUSTOMER** accounts can be merged.

### User Support (WhatsApp Link)
If a user tries to adding a phone number in their profile that acts as a duplicate key (already exists), they will see an error message:
> "Phone number already exists. This number is linked to another account."

A **WhatsApp Link** will appear below the error, allowing them to pre-fill a message to admin requesting a merge.

## Modified Files
- `src/app/admin/users/page.tsx` (Responsive UI + Merge Modal)
- `src/app/api/admin/users/merge/route.ts` (New Merge API)
- `src/components/ProfileForm.tsx` (WhatsApp Link logic)
- `src/app/complete-profile/page.tsx` (WhatsApp Link logic for new users)
- `src/app/api/user/profile/route.ts` (Error handling for duplicates)

## Verification Results
- **Build Status**: Passed (`npm run build`)
- **Type Check**: Passed (`tsc --noEmit`)
- **Fixes Applied**:
    - **API Hardening**: Zod validation error handling fixed in `api/user/bookings`.
    - **Frontend**: Strict type handling in `ServicesExplorer` using optional chaining.
    - **Frontend**: Added 'My Membership' to mobile navigation menu.
    - **API**: Updated Admin Bookings default sort to show latest bookings first (`createdAt: -1`).
    - **Routing**: Added `<Suspense>` boundary to `ServicesPage` for `useSearchParams`.
