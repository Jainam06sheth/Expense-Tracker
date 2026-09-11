# Integration Plan for Expense Tracker

## Overview
This plan outlines the steps to integrate the existing React frontend with the existing Node.js/Express/MongoDB backend, replacing localStorage/mock data with backend API calls while preserving the existing frontend UI and user experience.

## Current State Analysis
### Frontend
- Located in `/frontend`
- Uses React with Vite
- Services layer: `userService`, `groupService`, `expenseService`, `paymentService`, `activityService`, `memberService`
- Utilities: `api.js` (centralized API configuration), `storage.js` (localStorage wrapper)
- State management: Services directly manipulate localStorage via `getData`/`setData`/`removeData`
- Routes: Protected and public routes defined in `App.jsx`

### Backend
- Located in `/Backend`
- Node.js/Express with MongoDB
- RESTful API structure:
  - `/api/users` - authentication, profile
  - `/api/groups` - group management
  - `/api/invitations` - group invitations
  - `/api/expenses` - expense tracking
  - `/api/expense-items` - expense items
  - `/api/expense-splits` - expense splits
  - `/api/payments` - payments/settlements
  - `/api/balances` - group balances
  - `/api/activities` - activity feed
  - `/api/settings` - user settings
- Authentication: JWT-based via `auth.middleware.js`
- Controllers: Handle business logic and database operations
- Models: Mongoose schemas for each entity

## Integration Strategy
### Core Principles
1. **Preserve Frontend Exactly**: No changes to UI, components, navigation, styling, or user experience unless absolutely required for API integration
2. **Service Layer Adaptation**: Modify only the service layer to replace localStorage calls with API calls
3. **Centralized API Configuration**: Use existing `api.js` with `VITE_API_BASE_URL` environment variable
4. **Authentication**: Maintain JWT token storage and transmission via `Authorization: Bearer <token>` header
5. **Data Mapping**: Create adapters in service layer where backend response structure differs from frontend expectations
6. **Error Handling**: Preserve existing toast/notification/error UI; handle API errors appropriately
7. **Loading States**: Maintain existing loading indicators; update only where synchronous operations become asynchronous

## Detailed Service Integration Plan

### 1. User Service (`userService.js`)
**Current LocalStorage Usage**:
- `getAll()`: Gets all users from `campussettle_users`
- `getById(id)`: Gets user by ID from cached users
- `getByEmail(email)`: Gets user by email from cached users
- `getCurrentUser()`: Gets current user from `campussettle_current_user`
- `setCurrentUser(user)`: Sets current user
- `login(email, password)`: Already uses API (`/api/users/login`)
- `signup(userData)`: Already uses API (`/api/users/register`)
- `update(id, updates)`: Already uses API (`/api/users/profile` PUT)
- `loadProfile()`: Already uses API (`/api/users/profile` GET)
- `logout()`: Clears localStorage and token

**Required Changes**:
- Add backend endpoints for user retrieval:
  - `GET /api/users` - Get all users (with optional email query for filtering)
  - `GET /api/users/:id` - Get user by ID
  - `GET /api/users?email=:email` - Get user by email (via query parameter on `/api/users`)
- Replace localStorage calls with API calls:
  - `getAll()` → `GET /api/users`
  - `getById(id)` → `GET /api/users/:id`
  - `getByEmail(email)` → `GET /api/users?email=${email}`
- Keep existing API-based methods (login, signup, update, loadProfile) as they are already correct
- Ensure token is properly set and retrieved via `api.js`

### 2. Group Service (`groupService.js`)
**Current LocalStorage Usage**:
- `getAll()`: Gets all groups from `campussettle_groups`
- `getById(id)`: Gets group by ID from cached groups
- `create(data, currentUser)`: Creates group in localStorage with simulated ID and timestamps
- `update(id, updates, currentUser)`: Updates group in localStorage
- `delete(id, currentUser)`: Deletes group and cascades to delete expenses/payments (localStorage only)

**Required Backend Endpoints** (already exist):
- `POST /api/groups` - Create group
- `GET /api/groups` - Get all groups for user
- `GET /api/groups/:groupId` - Get group by ID
- `GET /api/groups/:groupId/members` - Get group members
- `PUT /api/groups/:groupId` - Update group
- `DELETE /api/groups/:groupId/member/:userId` - Remove member from group

**Required Changes**:
- Replace localStorage calls with API calls:
  - `getAll()` → `GET /api/groups` (with auth)
  - `getById(id)` → `GET /api/groups/${id}` (with auth)
  - `create(data, currentUser)` → `POST /api/groups` (send name, category, description)
  - `update(id, updates, currentUser)` → `PUT /api/groups/${id}` (send updates)
  - `delete(id, currentUser)` → **Not directly mappable** - Backend only supports member removal, not group deletion
    - **Solution**: Remove group deletion functionality OR add `DELETE /api/groups/:groupId` endpoint in backend
    - **Recommendation**: Add group deletion endpoint since frontend uses it
- Remove localStorage cascading deletes (expenses/payments) - backend should handle related data cleanup or frontend should fetch fresh data after group deletion
- Keep activityService calls but ensure they still work (activity service will be updated separately)

### 3. Expense Service (`expenseService.js`)
**Current LocalStorage Usage**:
- `getAll()`: Gets all expenses from `campussettle_expenses`
- `getById(id)`: Gets expense by ID from cached expenses
- `getByGroupId(groupId)`: Gets expenses by group ID from cached expenses
- `create(data, currentUser)`: Creates expense in localStorage with simulated ID and timestamps
- `update(id, updates, currentUser)`: Updates expense in localStorage
- `delete(id, currentUser)`: Deletes expense from localStorage

**Required Backend Endpoints** (already exist):
- `POST /api/expenses` - Create expense
- `GET /api/expenses/group/:groupId` - Get expenses for group
- `GET /api/expenses/:expenseId` - Get expense by ID
- `PUT /api/expenses/:expenseId` - Update expense
- `DELETE /api/expenses/:expenseId` - Delete expense

**Required Changes**:
- Replace localStorage calls with API calls:
  - `getAll()` → **Not directly needed** - Frontend seems to use `getByGroupId` primarily; `getAll` may be unused or for dashboard
    - **Check usage**: If unused, can remove or implement as aggregate call (but backend doesn't have global expenses endpoint)
    - **Alternative**: Keep `getAll()` but make it return empty array or remove if not used
    - **Investigation needed**: Search frontend for `expenseService.getAll()`
  - `getById(id)` → `GET /api/expenses/${id}` (with auth)
  - `getByGroupId(groupId)` → `GET /api/expenses/group/${groupId}` (with auth)
  - `create(data, currentUser)` → `POST /api/expenses` (send name, groupId, category, amount, paidBy, date, notes, splitMethod, items, participants, splits)
  - `update(id, updates, currentUser)` → `PUT /api/expenses/${id}` (send updates)
  - `delete(id, currentUser)` → `DELETE /api/expenses/${id}` (with auth)
- Handle ID mapping: Backend uses MongoDB ObjectId, frontend may expect string IDs - ensure service returns `_id` as `id`
- Keep activityService calls but update activity service to use backend

### 4. Payment Service (`paymentService.js`)
**Current LocalStorage Usage**:
- `getAll()`: Gets all payments from `campussettle_payments`
- `getById(id)`: Gets payment by ID from cached payments
- `create(data, currentUser)`: Creates payment in localStorage with simulated data
- `update(id, updates, currentUser)`: Updates payment in localStorage
- `delete(id, currentUser)`: Deletes payment from localStorage

**Required Backend Endpoints** (already exist):
- `POST /api/payments` - Create payment
- `GET /api/payments/me` - Get current user's payments
- `GET /api/payments/group/:groupId` - Get payments for group
- `PUT /api/payments/:paymentId/complete` - Mark payment as complete
- `PUT /api/payments/:paymentId/reject` - Reject payment

**Required Changes**:
- Replace localStorage calls with API calls:
  - `getAll()` → **Not directly mappable** - Backend has no global payments endpoint
    - **Check usage**: Likely unused or for dashboard; may need to remove or aggregate from group calls
    - **Alternative**: Keep but return empty array or implement as combination of user and group payments
  - `getById(id)` → **No direct endpoint** - Need to add `GET /api/payments/:paymentId` or derive from other calls
    - **Solution**: Add `GET /api/payments/:paymentId` endpoint in backend
  - `create(data, currentUser)` → `POST /api/payments` (send groupId, fromUser, toUser, amount, date, notes)
    - **Note**: Backend expects `status` to be set via complete/reject endpoints, not in create
  - `update(id, updates, currentUser)` → **Not directly supported** - Backend only has complete/reject endpoints
    - **Solution**: Remove update functionality or map to appropriate endpoints
    - **Investigation needed**: Check if frontend actually updates payments (likely only status changes via complete/reject)
  - `delete(id, currentUser)` → **Not directly supported** - Backend has no payment deletion endpoint
    - **Solution**: Remove delete functionality or add endpoint
    - **Investigation needed**: Check if frontend deletes payments
- Handle status mapping: Backend has separate endpoints for completing/rejecting payments
- Keep activityService calls but update activity service to use backend

### 5. Activity Service (`activityService.js`)
**Current LocalStorage Usage**:
- `getAll()`: Gets all activities from `campussettle_activities`
- `create(activity)`: Creates activity in localStorage with simulated ID and timestamp

**Required Backend Endpoints** (already exist):
- `GET /api/activities/me` - Get current user's activities
- `GET /api/activities/group/:groupId` - Get activities for group

**Required Changes**:
- **Fundamental Change**: Activity creation should happen exclusively in backend (when groups, expenses, payments occur)
- Frontend should **not** create activities directly - remove `create` method and all calls to `activityService.create()` from other services
- Replace localStorage calls with API calls:
  - `getAll()` → **Not directly mappable** - Backend has no global activities endpoint
    - **Check usage**: Likely unused or for dashboard; may need to remove
    - **Alternative**: For dashboard, use `getActivitiesForCurrentUser()` equivalent
  - Implement new method `getForCurrentUser()` → `GET /api/activities/me` (with auth)
  - Implement new method `getForGroup(groupId)` → `GET /api/activities/group/${groupId}` (with auth)
- Remove localStorage usage entirely
- Ensure frontend components that display activities use the new methods

### 6. Member Service (`memberService.js`)
**Current LocalStorage Usage**:
- `getByGroupId(groupId)`: Gets members of group from cached groups
- `create(groupId, memberData, currentUser)`: Adds member to group in localStorage
- `update(groupId, memberId, updates, currentUser)`: Updates member in group in localStorage
- `delete(groupId, memberId, currentUser)`: Removes member from group in localStorage (with expense check)

**Required Backend Endpoints**:
- `GET /api/groups/:groupId/members` - Get group members (exists)
- **Missing**: Endpoints to add/update/remove members in group (besides invitation system and remove member endpoint)
  - Backend has: `DELETE /api/groups/:groupId/member/:userId` - Remove member from group (exists)
  - Missing: `POST /api/groups/:groupId/members` - Add member to group
  - Missing: `PUT /api/groups/:groupId/members/:memberId` - Update member in group

**Required Changes**:
- Analyze frontend usage: 
  - How are members actually added? Likely through invitation flow (accept invitation triggers backend to add member via groupMember model)
  - Check if frontend `memberService.create` is actually used or if invitation system handles it
- If member addition happens through invitations:
  - `create()` may be redundant or simulated - check usage
  - If used, need to add backend endpoint for adding members
- `update()`: Likely not used if member data is immutable after addition (except role/status)
  - Check if frontend updates member details
- `delete()` → Maps to `DELETE /api/groups/:groupId/member/:userId` (exists)
- Replace localStorage calls with appropriate API calls based on actual usage
- Remove localStorage usage entirely

### 7. Settings Service (if exists)
**Check if frontend has settings service**:
- Backend has: `GET /api/settings`, `PUT /api/settings`
- If frontend has settings service using localStorage, replace with API calls
- If not, no action needed

### 8. Invitations
**Check frontend for invitation-related services or direct API calls**:
- Backend has: 
  - `POST /api/invitations` - Send invitation
  - `GET /api/invitations` - Get invitations
  - `PUT /api/invitations/:invitationId/accept` - Accept invitation
  - `PUT /api/invitations/:invitationId/reject` - Reject invitation
- If frontend has invitation service or direct calls in components, replace with API calls
- Likely handled through group service or custom logic

### 9. Expense Items and Splits
**Check frontend for direct usage**:
- Backend has:
  - `POST /api/expense-items` - Add expense item
  - `GET /api/expense-items/:expenseId` - Get expense items
  - `DELETE /api/expense-items/:itemId` - Delete expense item
  - `GET /api/splits/me` - Get current user's splits
  - `GET /api/splits/:expenseId` - Get splits for expense
  - `PUT /api/splits/:splitId/pay` - Mark split as paid
- If frontend uses these through expense service or custom logic, ensure service methods map correctly
- If frontend has direct localStorage usage for these, replace with API calls

## Implementation Order
Following the user-specified order:

**STEP 1**: Inspect frontend and backend (COMPLETED - we have done initial inspection)
**STEP 2**: Understand current frontend architecture (ONGOING)
**STEP 3**: Identify all localStorage/mock services (IN PROGRESS)
**STEP 4**: Map each frontend service to backend APIs (THIS PLAN)
**STEP 5**: Create/use centralized API configuration (ALREADY EXISTS in `api.js`)
**STEP 6**: Integrate authentication (PARTIALLY DONE in userService)
**STEP 7**: Integrate users/profile (PARTIALLY DONE)
**STEP 8**: Integrate groups
**STEP 9**: Integrate invitations
**STEP 10**: Integrate expenses
**STEP 11**: Integrate expense items
**STEP 12**: Integrate expense splits
**STEP 13**: Integrate balances
**STEP 14**: Integrate payments
**STEP 15**: Integrate activities
**STEP 16**: Integrate settings
**STEP 17**: Remove obsolete localStorage/mock logic
**STEP 18**: Test the complete application flow

## Backend Modifications Needed
Based on analysis, the following backend additions/modifications are required:

### User Controller
- Add `getAllUsers` route (already implemented in controller, need to add route)
- Add `getUserById` route (need controller method and route)
- Modify `getAllUsers` to handle email query parameter for filtering

### Group Controller
- Add `deleteGroup` endpoint: `DELETE /api/groups/:groupId` (if frontend uses group deletion)

### Payment Controller
- Add `getPaymentById` endpoint: `GET /api/payments/:paymentId`
- Evaluate if update/delete endpoints are needed based on frontend usage

### Activity Controller
- No creation endpoint needed if activities are only created by backend actions
- Ensure all relevant backend actions (expenses, payments) create activities

### General
- Verify that all existing endpoints return data in expected format or create mappers in frontend services
- Ensure proper error handling and status codes
- Verify authentication middleware is applied correctly to all protected routes

## Frontend Files to Modify (Services Only)
- `frontend/src/services/userService.js`
- `frontend/src/services/groupService.js`
- `frontend/src/services/expenseService.js`
- `frontend/src/services/paymentService.js`
- `frontend/src/services/activityService.js`
- `frontend/src/services/memberService.js`
- Potentially: `frontend/src/services/invitationService.js` (if exists)
- Potentially: `frontend/src/services/expenseItemService.js` (if exists)
- Potentially: `frontend/src/services/expenseSplitService.js` (if exists)
- Potentially: `frontend/src/services/settingsService.js` (if exists)

## Files to Create
- None (if we reuse existing service structure)
- Possibly: New service files if modular separation is preferred (but reuse existing)

## Testing Plan
After implementing service changes:
1. Start backend: `cd Backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Test complete flow:
   - Register new user
   - Login with credentials
   - Create group
   - Invite user (via email)
   - Accept invitation
   - Create expense
   - View splits
   - Make payment
   - Check balances
   - View activity feed
   - Update settings
   - Logout

## Risk Mitigation
- **Backward Compatibility**: Keep service method signatures identical so components don't need changes
- **Gradual Migration**: If needed, feature flag to switch between localStorage and API (but requirement is full replacement)
- **Error Cases**: Handle network errors, 401/403 redirects to login, 404s appropriately
- **Data Consistency**: Ensure ID mapping between frontend string IDs and backend ObjectIds
- **Loading States**: Show loading indicators during API calls where synchronous operations were instant

## Environment Variables
Frontend needs:
- `VITE_API_BASE_URL=http://localhost:5000/api` (already in api.js with fallback)

## Conclusion
This plan preserves the existing frontend UI and user experience completely while migrating the data layer from localStorage/mock to the existing backend APIs. The focus is on the service layer as the adapter between UI and API.