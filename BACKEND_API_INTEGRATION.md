# Backend API Integration Status

## Overview
This document tracks the integration status between the frontend application and the backend API at `http://13.232.37.184:8008`.

## ✅ Fully Integrated (Using Backend API)

### 1. Profiles API
- **Status**: ✅ Fully integrated
- **Endpoints Used**:
  - `GET /api/v1/profiles` - Get all profiles
  - `GET /api/v1/profiles/profile-id/{profileId}` - Get profile by profileId
  - `GET /api/v1/profiles/type/{type}` - Get profiles by type (baby/mother)
  - `GET /api/v1/profiles/user/{userId}/type/{type}` - Get profiles by userId and type
  - `POST /api/v1/profiles` - Create profile
  - `PUT /api/v1/profiles/{id}` - Update profile
  - `POST /api/v1/profiles/with-image` - Create profile with image
  - `PUT /api/v1/profiles/{id}/with-image` - Update profile with image
- **Location**: `server/apiClient.ts` - `profileApi`
- **Routes**: `server/routes.ts` - Baby and Mother profile routes

### 2. Vaccines API
- **Status**: ✅ Fully integrated
- **Endpoints Used**:
  - `GET /api/v1/vaccines/baby/{babyId}` - Get vaccines by babyId
  - `GET /api/v1/vaccines/{id}` - Get vaccine by ID
  - `PUT /api/v1/vaccines/{id}` - Update vaccine
  - `POST /api/v1/vaccines/generate/{babyId}/dob/{dob}` - Generate vaccine schedule
  - `POST /api/v1/vaccines/{vaccineId}/complete` - Mark vaccine as completed
- **Location**: `server/apiClient.ts` - `vaccineApi`
- **Routes**: `server/routes.ts` - Vaccine routes

### 3. Plans API
- **Status**: ✅ Fully integrated
- **Endpoints Used**:
  - `GET /api/v1/plans` - Get all plans
  - `GET /api/v1/plans/category/{category}` - Get plans by category
  - `GET /api/v1/plans/search?name={name}` - Search plans by name
  - `GET /api/v1/plans/plan-id/{planId}` - Get plan by planId
- **Location**: `server/apiClient.ts` - `planApi`
- **Routes**: Used in frontend components

### 4. User Plans API
- **Status**: ✅ Fully integrated
- **Endpoints Used**:
  - `GET /api/v1/user-plans/user/{userId}` - Get all plans for user
  - `GET /api/v1/user-plans/user/{userId}/active` - Get active plan
  - `GET /api/v1/user-plans/user/{userId}/service/{serviceName}/availability` - Check service availability
  - `POST /api/v1/user-plans/assign` - Assign plan to user
  - `POST /api/v1/user-plans/consume` - Consume service
  - `PUT /api/v1/user-plans/{userPlanId}/deactivate` - Deactivate plan
- **Location**: `server/apiClient.ts` - `userPlanApi`
- **Routes**: Used in frontend components

### 5. OpenAI Chat API
- **Status**: ✅ Fully integrated
- **Endpoints Used**:
  - `POST /api/v1/openai/chat` - Chat with pediatric assistant
  - `DELETE /api/v1/openai/chat/session/{sessionId}` - Clear conversation history
- **Location**: `server/apiClient.ts` - `chatApi`
- **Routes**: `server/routes.ts` - Chat routes (partially - chat history still uses memory storage)

## ⚠️ Partially Integrated (Using Memory Storage)

### 6. Chat Messages History
- **Status**: ⚠️ Partially integrated
- **Current**: Chat API calls use backend, but chat history is stored in memory
- **Backend Endpoint**: Not available
- **Location**: `server/routes.ts` - Chat routes use `storage.getChatMessagesByBabyId()`
- **Action Required**: Backend needs to implement chat history storage/retrieval

## ❌ Not Available in Backend (Using Memory Storage)

The following features are currently using in-memory storage (`server/storage.ts` - `MemStorage`) because the backend API does not have corresponding endpoints:

### 1. Growth Entries
- **Status**: ❌ Using memory storage
- **Routes**: 
  - `GET /api/baby-profiles/:babyId/growth`
  - `POST /api/baby-profiles/:babyId/growth`
- **Backend Endpoints Needed**:
  - `GET /api/v1/growth/baby/{babyId}` - Get growth entries by babyId
  - `POST /api/v1/growth` - Create growth entry
  - `PUT /api/v1/growth/{id}` - Update growth entry
  - `DELETE /api/v1/growth/{id}` - Delete growth entry
- **Data Model**: See `shared/schema.ts` - `GrowthEntry`
- **Impact**: Data is lost on server restart

### 2. Milestones
- **Status**: ❌ Using memory storage
- **Routes**:
  - `GET /api/baby-profiles/:babyId/milestones`
  - `PATCH /api/milestones/:id`
- **Backend Endpoints Needed**:
  - `GET /api/v1/milestones/baby/{babyId}` - Get milestones by babyId
  - `POST /api/v1/milestones` - Create milestone
  - `PUT /api/v1/milestones/{id}` - Update milestone
  - `POST /api/v1/milestones/baby/{babyId}/initialize` - Initialize milestones for baby
- **Data Model**: See `shared/schema.ts` - `Milestone`
- **Impact**: Data is lost on server restart

### 3. Milestone Memories
- **Status**: ❌ Using memory storage
- **Routes**:
  - `GET /api/baby-profiles/:babyId/memories`
  - `GET /api/milestones/:milestoneId/memories`
  - `POST /api/baby-profiles/:babyId/memories`
  - `DELETE /api/memories/:id`
- **Backend Endpoints Needed**:
  - `GET /api/v1/milestone-memories/baby/{babyId}` - Get memories by babyId
  - `GET /api/v1/milestone-memories/milestone/{milestoneId}` - Get memories by milestoneId
  - `POST /api/v1/milestone-memories` - Create memory
  - `PUT /api/v1/milestone-memories/{id}` - Update memory
  - `DELETE /api/v1/milestone-memories/{id}` - Delete memory
- **Data Model**: See `shared/schema.ts` - `MilestoneMemory`
- **Impact**: Data is lost on server restart

### 4. Doctor Visits
- **Status**: ❌ Using memory storage
- **Routes**:
  - `GET /api/baby-profiles/:babyId/visits`
  - `POST /api/baby-profiles/:babyId/visits`
- **Backend Endpoints Needed**:
  - `GET /api/v1/doctor-visits/baby/{babyId}` - Get visits by babyId
  - `POST /api/v1/doctor-visits` - Create visit
  - `PUT /api/v1/doctor-visits/{id}` - Update visit
  - `DELETE /api/v1/doctor-visits/{id}` - Delete visit
- **Data Model**: See `shared/schema.ts` - `DoctorVisit`
- **Impact**: Data is lost on server restart

### 5. Medical Reports
- **Status**: ❌ Using memory storage
- **Routes**:
  - `GET /api/baby-profiles/:babyId/reports`
  - `POST /api/baby-profiles/:babyId/reports`
- **Backend Endpoints Needed**:
  - `GET /api/v1/medical-reports/baby/{babyId}` - Get reports by babyId
  - `POST /api/v1/medical-reports` - Create report (with file upload support)
  - `PUT /api/v1/medical-reports/{id}` - Update report
  - `DELETE /api/v1/medical-reports/{id}` - Delete report
  - `GET /api/v1/medical-reports/{id}/download` - Download report file
- **Data Model**: See `shared/schema.ts` - `MedicalReport`
- **Impact**: Data is lost on server restart

### 6. User Preferences
- **Status**: ❌ Using memory storage
- **Routes**:
  - `GET /api/user-preferences/:babyId`
  - `POST /api/user-preferences`
- **Backend Endpoints Needed**:
  - `GET /api/v1/user-preferences/baby/{babyId}` - Get preferences by babyId
  - `POST /api/v1/user-preferences` - Create preferences
  - `PUT /api/v1/user-preferences/{id}` - Update preferences
- **Data Model**: See `shared/schema.ts` - `UserPreferences`
- **Impact**: Data is lost on server restart

## Migration Path

To fully migrate from memory storage to backend APIs:

1. **Backend Team**: Implement the missing endpoints listed above
2. **Frontend Team**: 
   - Add API client methods in `server/apiClient.ts` for each new endpoint
   - Update routes in `server/routes.ts` to use backend APIs instead of `storage`
   - Remove `MemStorage` class once all features are migrated
   - Update error handling to handle backend API failures gracefully

## Current Memory Storage Usage

The `MemStorage` class in `server/storage.ts` is currently used for:
- Growth entries
- Milestones (including initialization)
- Milestone memories
- Doctor visits
- Medical reports
- User preferences
- Chat message history (temporary storage)

**Note**: All data stored in memory is lost when the server restarts. This is acceptable for development but not for production.

