# Find Hypnotherapy - User Acceptance Testing Document

**Version:** 1.7
**Test Environment:** https://findhypnotherapy.co.uk
**Last Updated:** February 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
   - 1.1 [Document Purpose](#11-document-purpose)
   - 1.2 [How to Use This Document](#12-how-to-use-this-document)
   - 1.3 [Test Data Requirements](#13-test-data-requirements)
   - 1.4 [Glossary of Terms](#14-glossary-of-terms)

2. [Member (Therapist) Testing](#2-member-therapist-testing)
   - 2.1 [Registration & Login](#21-registration--login)
   - 2.2 [Dashboard Home](#22-dashboard-home)
   - 2.3 [Clients Page](#23-clients-page) *(All Clients, Enquiries, Intro Calls tabs)*
     - 2.3.1 [All Clients Tab](#231-all-clients-tab)
     - 2.3.2 [Enquiries Tab](#232-enquiries-tab)
     - 2.3.3 [Intro Calls Tab](#233-intro-calls-tab)
     - 2.3.4 [Client Detail Page](#234-client-detail-page)
   - 2.4 [Schedule Page](#24-schedule-page) *(Calendar, Appointments, Availability, Sync tabs)*
     - 2.4.1 [Calendar Tab](#241-calendar-tab)
     - 2.4.2 [Appointments Tab](#242-appointments-tab)
     - 2.4.3 [Availability Tab](#243-availability-tab)
     - 2.4.4 [Sync Tab](#244-sync-tab)
   - 2.5 [Practice Page](#25-practice-page) *(Profile, Services, Content, Visibility tabs)*
     - 2.5.1 [Profile Tab](#251-profile-tab)
     - 2.5.2 [Services Tab](#252-services-tab)
     - 2.5.3 [Content Tab](#253-content-tab)
     - 2.5.4 [Visibility Tab](#254-visibility-tab)
   - 2.6 [Settings Page](#26-settings-page)

3. [Client/Visitor Testing](#3-clientvisitor-testing)
   - 3.1 [Homepage](#31-homepage)
   - 3.2 [Directory Search](#32-directory-search)
   - 3.3 [Therapist Profile](#33-therapist-profile)
   - 3.4 [Service Details](#34-service-details)
   - 3.5 [About Page](#35-about-page)
   - 3.6 [Videos Page](#36-videos-page)
   - 3.7 [For Practitioners Page](#37-for-practitioners-page) *(NEW)*
   - 3.8 [Subscribe Page](#38-subscribe-page) *(NEW)*
   - 3.9 [Booking Flow](#39-booking-flow)
   - 3.10 [Messaging Flow](#310-messaging-flow)
   - 3.11 [Client Onboarding Flow](#311-client-onboarding-flow) *(NEW)*
   - 3.12 [Session RSVP Flow](#312-session-rsvp-flow) *(NEW)*
   - 3.13 [Client Portal](#313-client-portal)
     - 3.13.1 [Portal Login](#3131-portal-login)
     - 3.13.2 [Portal Dashboard](#3132-portal-dashboard)
     - 3.13.3 [Portal Sessions](#3133-portal-sessions)
     - 3.13.4 [Portal Profile](#3134-portal-profile)
     - 3.13.5 [Portal Messages](#3135-portal-messages)
     - 3.13.6 [Portal Therapists](#3136-portal-therapists)

4. [End-to-End Workflows](#4-end-to-end-workflows)
   - 4.1 [New Therapist: Registration to First Booking](#41-new-therapist-registration-to-first-booking)
   - 4.2 [Visitor Journey: Find, Book, Become Client](#42-visitor-journey-find-book-become-client)
   - 4.3 [Client Session Lifecycle with RSVP](#43-client-session-lifecycle-with-rsvp)
   - 4.4 [Complete Message Conversation Flow](#44-complete-message-conversation-flow)

5. [Email Testing Checklist](#5-email-testing-checklist)
   - 5.1 [Email Summary Table](#51-email-summary-table)
   - 5.2 [Email Content Verification Guide](#52-email-content-verification-guide)

---

## 1. Introduction

### 1.1 Document Purpose

This User Acceptance Testing (UAT) document provides comprehensive test cases for the Find Hypnotherapy platform. It is designed for testers who may not have prior experience with the application and need detailed guidance on:

- What each page looks like and its purpose
- All features and functionality available
- Step-by-step test procedures
- Expected results for each test
- Email verification procedures

The document covers two primary user personas:
1. **Member (Therapist)** - Healthcare professionals who list their services
2. **Client/Visitor** - People searching for and booking hypnotherapy services

### 1.2 How to Use This Document

**For Each Page Section:**
1. Read the **Page Description** to understand what the page does
2. Review the **Visual Layout** to know what to expect
3. Execute each **Test Case** in order
4. Check off completed tests
5. Note any issues with the test ID, steps to reproduce, and actual vs expected results

**Test Case Format:**
```
TEST ID: [Section]-[Number]
Prerequisite: What must be done before this test
Steps:
  1. First action
  2. Second action
  ...
Expected Result: What should happen
Email Check: (if applicable) What email to verify
```

**Placeholder Notation:**
- `[YOUR_EMAIL]` - Use your test email address
- `[THERAPIST_NAME]` - Use a test therapist name
- `[PASSWORD]` - Use a secure test password
- `[PHONE]` - Use a test phone number

### 1.3 Test Data Requirements

Before testing, prepare the following:

| Data Type | Recommendation |
|-----------|----------------|
| Email addresses | At least 2 unique email addresses you can access (e.g., Gmail with +alias) |
| Test names | Realistic names for member and visitor personas |
| Phone number | Any valid UK phone format |
| Address | Any valid UK address |
| Profile photo | Any JPEG/PNG image under 5MB |
| Banner image | Landscape image (1200x400px recommended) |
| Service image | Square image (800x800px recommended) |
| Video file | MP4/WebM/MOV video under 50MB |

### 1.4 Glossary of Terms

| Term | Definition |
|------|------------|
| **Member** | A registered therapist with a profile on the platform |
| **Visitor** | An unregistered person browsing the website |
| **Client** | A visitor who has been invited by a member to become an ongoing client |
| **Intro Call** | A free initial consultation booking request |
| **Session** | A scheduled appointment between member and client |
| **RSVP** | Request for client to confirm attendance for a session |
| **Magic Link** | Passwordless login link sent via email |
| **Verification Email** | Email sent to confirm visitor's email address |
| **Dashboard** | Member's private management area |
| **Portal** | Client's private area to manage sessions and messages |

---

## 2. Member (Therapist) Testing

### 2.1 Registration & Login

#### 2.1.1 Registration Page

**URL:** https://findhypnotherapy.co.uk/register

**Page Description:**
The registration page allows new therapists to create an account. It features a clean, minimal form with the Find Hypnotherapy branding at the top. The page has a light background with a centered white card containing the registration form.

**Visual Layout:**
- Header: "Find Hypnotherapy" logo
- Title: "Create your account" or similar
- Form fields stacked vertically
- "Create Account" button at bottom
- Link to login page for existing users

**Form Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Invitation Code | Text | Yes | Must match valid invitation code |
| Full Name | Text | Yes | 1-100 characters, letters/spaces/hyphens only |
| Email | Email | Yes | Valid email format, max 255 characters |
| Password | Password | Yes | Min 8 chars, must include: uppercase, lowercase, number, special character |
| Confirm Password | Password | Yes | Must match password |

> **Note:** Registration requires an invitation code. Contact the platform administrator if you don't have one.

---

**TEST ID: REG-001**
**Test: Successful Registration**
```
Prerequisite: No existing account with test email, have valid invitation code
Steps:
  1. Navigate to https://findhypnotherapy.co.uk/register
  2. Enter invitation code in Invitation Code field
  3. Enter [YOUR_NAME] in Full Name field
  4. Enter [YOUR_EMAIL] in Email field
  5. Enter [PASSWORD] in Password field (must include uppercase, lowercase, number, special char)
  6. Enter [PASSWORD] in Confirm Password field
  7. Click "Create Account" button
Expected Result:
  - Success message: "Registration successful! Please check your email to confirm your account."
  - Link to sign in shown
Email Check:
  - Check inbox for verification email
  - Subject: "Confirm your email" or similar
  - Click verification link in email
  - Should redirect to success page
```

---

**TEST ID: REG-002**
**Test: Duplicate Email Registration**
```
Prerequisite: Account already exists with [YOUR_EMAIL]
Steps:
  1. Navigate to https://findhypnotherapy.co.uk/register
  2. Enter any name in Full Name field
  3. Enter [YOUR_EMAIL] (existing email) in Email field
  4. Enter valid password in both password fields
  5. Click "Create Account" button
Expected Result:
  - Error message: "Email already registered" or similar
  - Form remains on page
  - No email sent
```

---

**TEST ID: REG-003**
**Test: Password Validation - Length**
```
Prerequisite: None
Steps:
  1. Navigate to https://findhypnotherapy.co.uk/register
  2. Enter valid invitation code, name, and email
  3. Enter "short" (less than 8 chars) in Password field
  4. Tab out of field
Expected Result:
  - Error message: "Password must be at least 8 characters"
  - Form does not submit
```

---

**TEST ID: REG-003b**
**Test: Password Validation - Complexity**
```
Prerequisite: None
Steps:
  1. Navigate to https://findhypnotherapy.co.uk/register
  2. Enter valid invitation code, name, and email
  3. Enter "password123" (no uppercase or special char) in Password field
  4. Tab out of field
Expected Result:
  - Error message about missing uppercase letter or special character
  - Password strength indicator shows weak
  - Form does not submit until password meets all requirements:
    * At least 8 characters
    * At least one uppercase letter
    * At least one lowercase letter
    * At least one number
    * At least one special character
```

---

**TEST ID: REG-004**
**Test: Password Mismatch**
```
Prerequisite: None
Steps:
  1. Navigate to https://findhypnotherapy.co.uk/register
  2. Enter valid name and email
  3. Enter "ValidPassword123" in Password field
  4. Enter "DifferentPassword456" in Confirm Password field
  5. Click "Create Account" button
Expected Result:
  - Error message: "Passwords do not match" or similar
  - Form does not submit
```

---

#### 2.1.2 Login Page

**URL:** https://findhypnotherapy.co.uk/login

**Page Description:**
The login page allows existing members to access their dashboard. It has the same minimal design as registration with a centered white card. Below the form are links for forgotten password and new registration.

**Visual Layout:**
- Header: "Find Hypnotherapy" logo
- Title: "Sign in to your account"
- Email and password fields
- "Sign In" button
- "Forgot password?" link
- "Create account" link

**Form Fields:**
| Field | Type | Required |
|-------|------|----------|
| Email | Email | Yes |
| Password | Password | Yes |

---

**TEST ID: LOGIN-001**
**Test: Successful Login**
```
Prerequisite: Verified member account exists
Steps:
  1. Navigate to https://findhypnotherapy.co.uk/login
  2. Enter [YOUR_EMAIL] in Email field
  3. Enter [PASSWORD] in Password field
  4. Click "Sign In" button
Expected Result:
  - Redirected to /dashboard
  - Dashboard home page loads
  - User's name visible in sidebar or header
```

---

**TEST ID: LOGIN-002**
**Test: Invalid Password**
```
Prerequisite: Member account exists
Steps:
  1. Navigate to https://findhypnotherapy.co.uk/login
  2. Enter [YOUR_EMAIL] in Email field
  3. Enter "WrongPassword123" in Password field
  4. Click "Sign In" button
Expected Result:
  - Error message: "Invalid email or password" or similar
  - Remains on login page
```

---

**TEST ID: LOGIN-003**
**Test: Non-existent Email**
```
Prerequisite: None
Steps:
  1. Navigate to https://findhypnotherapy.co.uk/login
  2. Enter "nonexistent@example.com" in Email field
  3. Enter any password
  4. Click "Sign In" button
Expected Result:
  - Error message: "Invalid email or password" or similar
  - Does NOT reveal that email doesn't exist (security)
```

---

#### 2.1.3 Forgot Password Flow

**URL:** https://findhypnotherapy.co.uk/forgot-password

**Page Description:**
A simple form for members who have forgotten their password. Enter email address to receive a password reset link.

---

**TEST ID: FORGOT-001**
**Test: Password Reset Request**
```
Prerequisite: Member account exists
Steps:
  1. Navigate to https://findhypnotherapy.co.uk/forgot-password
  2. Enter [YOUR_EMAIL] in Email field
  3. Click "Send Reset Link" button
Expected Result:
  - Success message: "If an account exists with that email, you will receive a password reset link shortly."
  - Message appears regardless of whether email exists (security)
Email Check:
  - Check inbox for password reset email
  - Subject: "Reset your password" or similar
  - Contains "Reset Password" button/link
  - Link expires after set time (typically 1 hour)
```

---

**TEST ID: FORGOT-002**
**Test: Password Reset Completion**
```
Prerequisite: Received password reset email
Steps:
  1. Click reset link in email
  2. Page opens at /reset-password with token
  3. Enter new password in New Password field
  4. Enter same password in Confirm Password field
  5. Click "Reset Password" button
Expected Result:
  - Success message: "Password updated successfully"
  - Redirected to login page
  - Can login with new password
```

---

### 2.2 Dashboard Home

**URL:** https://findhypnotherapy.co.uk/dashboard

**Page Description:**
The dashboard home is the member's main landing page after login. It provides an at-a-glance overview of their practice with key metrics, today's schedule, action items, and recent activity. The page uses a card-based layout with statistics at the top and various widgets below.

**Sidebar Navigation:**
The member dashboard uses a consolidated navigation with 5 main sections:

| Sidebar Link | URL | Description |
|--------------|-----|-------------|
| Home | `/dashboard` | Overview with stats and activity |
| Clients | `/dashboard/clients` | 3 tabs: All Clients, Enquiries, Intro Calls |
| Schedule | `/dashboard/schedule` | 4 tabs: Calendar, Appointments, Availability, Sync |
| Practice | `/dashboard/practice` | 4 tabs: Profile, Services, Content, Visibility |
| Settings | `/dashboard/settings` | Account, Terms, Billing |

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR          │  MAIN CONTENT                          │
│                   │                                         │
│  🏠 Home          │  Good morning, [Name]!                  │
│  👥 Clients       │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│  📅 Schedule      │  │Today│ │Pend.│ │Unread│ │Active│      │
│  💼 Practice      │  │Sess.│ │Intro│ │Msgs  │ │Client│      │
│  ⚙️ Settings      │  └─────┘ └─────┘ └─────┘ └─────┘       │
│                   │                                         │
│                   │  Today's Schedule    Action Items       │
│                   │  ┌─────────────┐    ┌─────────────┐    │
│                   │  │ 10:00 AM... │    │ • Pending...│    │
│                   │  │ 2:00 PM...  │    │ • Unread... │    │
│                   │  └─────────────┘    └─────────────┘    │
│                   │                                         │
│                   │  Charts Row                             │
│                   │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│                   │  │Trend │ │Client│ │Servic│ │Format│   │
│                   │  │Chart │ │Status│ │Popul.│ │Chart │   │
│                   │  └──────┘ └──────┘ └──────┘ └──────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Key Elements:**

| Element | Description |
|---------|-------------|
| Greeting | Personalized greeting based on time of day ("Good morning/afternoon/evening, [Name]!") |
| Today's Sessions | Count of sessions scheduled for today |
| Pending Intro Calls | Count of bookings awaiting confirmation (orange highlight if > 0) |
| Unread Messages | Count of unread visitor messages (orange highlight if > 0) |
| Active Clients | Count of active clients with invited count subtitle |
| Today's Schedule | List of today's appointments with times |
| Action Items | Priority tasks requiring attention |
| Quick Actions | Buttons for common actions |
| Recent Activity | Recent activity log |
| Charts | Sessions Over Time, Client Distribution, Popular Services, Session Formats |

---

**TEST ID: DASH-001**
**Test: Dashboard Loads Correctly**
```
Prerequisite: Logged in as member with some activity
Steps:
  1. Navigate to /dashboard or click "Dashboard" in sidebar
  2. Wait for page to fully load
Expected Result:
  - Personalized greeting appears with your name
  - All 4 stat cards display numbers (may be 0)
  - Today's Schedule section visible
  - Action Items section visible
  - No error messages
```

---

**TEST ID: DASH-002**
**Test: Stat Card Navigation**
```
Prerequisite: Logged in as member
Steps:
  1. Click on "Today's Sessions" stat card
Expected Result: Navigates to /dashboard/calendar

  2. Return to dashboard, click "Pending Intro Calls" card
Expected Result: Navigates to /dashboard/bookings

  3. Return to dashboard, click "Unread Messages" card
Expected Result: Navigates to /dashboard/messages

  4. Return to dashboard, click "Active Clients" card
Expected Result: Navigates to /dashboard/clients
```

---

**TEST ID: DASH-003**
**Test: Today's Schedule Display**
```
Prerequisite: Member has at least one session scheduled for today
Steps:
  1. Navigate to /dashboard
  2. Locate "Today's Schedule" section
  3. Verify session details shown
Expected Result:
  - Session(s) listed with time
  - Client name visible
  - Session type/title shown
  - Clicking a session navigates to details
```

---

**TEST ID: DASH-004**
**Test: New Member Setup Prompt**
```
Prerequisite: New member account with no therapist profile
Steps:
  1. Log in with new account
  2. Navigate to /dashboard
Expected Result:
  - Setup prompt/banner appears
  - Message encourages completing profile
  - Link/button to profile setup
```

---

### 2.3 Clients Page

**URL:** https://findhypnotherapy.co.uk/dashboard/clients

**Page Description:**
The Clients page is a consolidated hub for managing all client-related activities. It combines client management, visitor enquiries (messages), and intro call requests into a single page with three tabs. This eliminates the need to navigate between separate pages for different client interactions.

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Clients                                  [+ Invite Client] │
│  ┌────────────┬────────────┬────────────┐                   │
│  │All Clients │ Enquiries  │ Intro Calls│                   │
│  │            │ (3)        │ (1)        │                   │
│  └────────────┴────────────┴────────────┘                   │
│                                                             │
│  [Tab Content Based on Selection]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Tab Structure:**

| Tab | Purpose | Badge |
|-----|---------|-------|
| All Clients | View and manage all client relationships | Total count |
| Enquiries | Visitor message conversations (contacts from directory) | Unread count |
| Intro Calls | Booking requests from visitors | Pending count |

---

#### 2.3.1 All Clients Tab

**Tab Description:**
Displays all clients (invited and active), allows inviting new clients, and shows client relationship status.

**Client Statuses:**
| Status | Description |
|--------|-------------|
| Invited | Invitation sent, awaiting onboarding completion |
| Active | Client has completed onboarding |
| Archived | Relationship ended/archived |

---

**TEST ID: CLIENT-001**
**Test: View All Clients**
```
Prerequisite: At least one client exists
Steps:
  1. Navigate to /dashboard/clients
  2. Ensure "All Clients" tab is selected (default)
Expected Result:
  - List of all clients displayed
  - Each card shows name, email, status, relationship start
  - Action buttons visible (View, Message, Schedule Session)
```

---

**TEST ID: CLIENT-002**
**Test: Invite New Client**
```
Prerequisite: Terms & Conditions set up in Practice > Profile
Steps:
  1. Click "+ Invite Client" button
  2. Dialog opens
  3. Enter client name: [CLIENT_NAME]
  4. Enter client email: [CLIENT_EMAIL]
  5. Optionally select a service to link to invitation
  6. Optionally enter personal message
  7. Click "Send Invitation"
Expected Result:
  - Success toast: "Invitation sent"
  - Client appears in list with "INVITED" status
Email Check:
  - Client receives invitation email
  - Subject: "[YOUR_NAME] has invited you to join as a client"
  - Contains personal message if added
  - "Complete Onboarding" button with link
  - Link expires in 7 days
```

---

**TEST ID: CLIENT-003**
**Test: Invite Without Terms**
```
Prerequisite: No terms & conditions configured in Practice > Profile
Steps:
  1. Click "+ Invite Client" button
Expected Result:
  - Error message: "Please set up your terms and conditions first"
  - Link to Practice > Profile > Terms section
  - Cannot send invitation until terms are set
```

---

#### 2.3.2 Enquiries Tab

**Tab Description:**
Shows all conversations with visitors who have contacted you through your public profile. This is the same content that was previously at `/dashboard/messages` but is now integrated into the Clients page.

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Enquiries                                                  │
│  ┌───────────────────┬─────────────────────────────────────┐│
│  │ Conversations     │ Conversation with John Smith        ││
│  │ ┌───────────────┐ │                                     ││
│  │ │ John Smith    │ │ ┌─────────────────────────────────┐ ││
│  │ │ "Hi, I'd li..."│ │ │ John: "Hi, I'd like to..."    │ ││
│  │ │ 2 hours ago   │ │ │ 10:30 AM                        │ ││
│  │ │ ● unread      │ │ │                                 │ ││
│  │ └───────────────┘ │ │ You: "Thank you for..."         │ ││
│  └───────────────────┴─────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

**TEST ID: ENQ-001**
**Test: View Enquiries Tab**
```
Prerequisite: Have at least one visitor conversation
Steps:
  1. Navigate to /dashboard/clients
  2. Click "Enquiries" tab
Expected Result:
  - Shows conversations from contact form
  - Unread count in tab badge
  - Conversations listed with most recent first
```

---

**TEST ID: ENQ-002**
**Test: Read Conversation**
```
Prerequisite: Conversation exists
Steps:
  1. Click on a conversation in the list
  2. Read full conversation thread
Expected Result:
  - Full message history displayed
  - Messages show sender (you/visitor) and timestamp
  - Unread indicator clears after viewing
```

---

**TEST ID: ENQ-003**
**Test: Reply to Message**
```
Prerequisite: Conversation open
Steps:
  1. Type reply in message input field
  2. Click "Send" button
Expected Result:
  - Message appears in thread immediately
  - Input field clears
  - Message shows as sent
Email Check:
  - Visitor receives reply notification
  - Subject: "Reply from [YOUR_NAME]"
  - Contains your reply text
  - Link to continue conversation
```

---

#### 2.3.3 Intro Calls Tab

**Tab Description:**
Shows all booking requests (intro calls) from visitors. This is the same content that was previously at `/dashboard/bookings` but is now integrated into the Clients page. Members can view pending requests, confirm or cancel bookings.

**Booking Statuses:**
| Status | Description | Colour |
|--------|-------------|--------|
| Awaiting Verification | Visitor hasn't clicked email verification | Grey |
| Pending | Verified, awaiting therapist confirmation | Yellow |
| Confirmed | Therapist accepted the booking | Green |
| Cancelled | Booking was cancelled | Red |
| No Show | Client didn't attend | Grey |
| Completed | Session completed | Grey |

---

**TEST ID: INTRO-001**
**Test: View Intro Calls Tab**
```
Prerequisite: At least one pending booking exists
Steps:
  1. Navigate to /dashboard/clients
  2. Click "Intro Calls" tab
Expected Result:
  - Shows pending intro call requests
  - Pending count in tab badge
  - Each card shows: visitor name, email, date/time, format, notes
```

---

**TEST ID: INTRO-002**
**Test: Confirm Booking**
```
Prerequisite: Pending booking exists
Steps:
  1. On Intro Calls tab, find a pending booking
  2. Click "Confirm" button
  3. Confirmation dialog may appear
  4. Confirm the action
Expected Result:
  - Status changes to "CONFIRMED" (green)
  - Meeting URL appears (for online sessions)
Email Check:
  - Visitor receives confirmation email
  - Subject: "Booking confirmed with [YOUR_NAME]"
  - Contains date, time, and meeting link if online
```

---

**TEST ID: INTRO-003**
**Test: Cancel Booking**
```
Prerequisite: Pending or confirmed booking exists
Steps:
  1. Find a booking to cancel
  2. Click "Cancel" button
  3. Cancellation dialog opens
  4. Enter reason: "Unfortunately I need to reschedule"
  5. Confirm cancellation
Expected Result:
  - Status changes to "CANCELLED" (red)
  - Cancellation reason visible on card
Email Check:
  - Visitor receives cancellation email
  - Subject: "Booking cancelled - [DATE]"
  - Contains cancellation reason
```

---

**TEST ID: INTRO-004**
**Test: Invite Visitor as Client**
```
Prerequisite: Confirmed booking with visitor
Steps:
  1. Find a confirmed booking
  2. Click "Invite as Client" button (if available)
  3. Follow invitation flow
Expected Result:
  - Client invitation sent
  - Visitor receives invitation email
  - Client appears in "All Clients" tab with INVITED status
```

---

#### 2.3.4 Client Detail Page

**URL:** https://findhypnotherapy.co.uk/dashboard/clients/[slug]

**Page Description:**
The client detail page shows comprehensive information about a specific client. It has four tabs: Sessions, Messages, Notes, and Details. Access by clicking "View" on any client card.

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Clients                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ [Photo]  Sarah Johnson                                 │ │
│  │          sarah@example.com                             │ │
│  │          +44 7700 900000                               │ │
│  │          ACTIVE                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌──────────┬──────────┬──────────┬──────────┐             │
│  │ Sessions │ Messages │ Notes    │ Details  │             │
│  └──────────┴──────────┴──────────┴──────────┘             │
│                                                             │
│  [Tab Content]                                              │
└─────────────────────────────────────────────────────────────┘
```

**Tabs:**
| Tab | Content |
|-----|---------|
| Sessions | All scheduled sessions with this client |
| Messages | Conversation thread with client |
| Notes | Private notes about the client |
| Details | Client profile, emergency contact, onboarding data |

---

**TEST ID: CDET-001**
**Test: View Client Detail**
```
Prerequisite: Active client exists
Steps:
  1. From Clients page, click "View" on a client card
  2. Client detail page opens
Expected Result:
  - Client header shows photo, name, email, phone
  - Status badge visible
  - All four tabs accessible
```

---

**TEST ID: CDET-002**
**Test: Schedule New Session**
```
Prerequisite: On client detail page
Steps:
  1. Click "Schedule Session" or "+ New Session" button
  2. Select date and time
  3. Select service/session type
  4. Add optional notes
  5. Click "Create Session"
Expected Result:
  - Session created and visible in Sessions tab
  - Confirmation dialog shows session details
Email Check:
  - Client receives session invitation email with RSVP link
  - Subject: "New session scheduled with [YOUR_NAME]"
```

---

**TEST ID: CDET-003**
**Test: Send Session RSVP Reminder**
```
Prerequisite: Session exists without client response
Steps:
  1. Go to Sessions tab
  2. Find session awaiting RSVP
  3. Click "Send Reminder" button
Expected Result:
  - Success toast: "Reminder sent"
Email Check:
  - Client receives RSVP reminder email
  - Contains same accept/decline buttons as original
```

---

**TEST ID: CDET-004**
**Test: View Client Notes**
```
Prerequisite: On client detail page
Steps:
  1. Click "Notes" tab
  2. Click "Add Note"
  3. Enter note text
  4. Click "Save"
Expected Result:
  - Note saved with timestamp
  - Notes visible only to you (private)
  - Multiple notes can be added
```

---

### 2.4 Schedule Page

**URL:** https://findhypnotherapy.co.uk/dashboard/schedule

**Page Description:**
The Schedule page is a consolidated hub for managing your calendar, appointments, availability settings, and external calendar sync. It combines what were previously separate pages into a single location with four tabs.

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Schedule                                                   │
│  ┌───────────┬───────────────┬──────────────┬──────────┐   │
│  │ Calendar  │ Appointments  │ Availability │   Sync   │   │
│  └───────────┴───────────────┴──────────────┴──────────┘   │
│                                                             │
│  [Tab Content Based on Selection]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Tab Structure:**

| Tab | Purpose |
|-----|---------|
| Calendar | Monthly calendar view of all bookings and sessions |
| Appointments | List view of upcoming and past appointments |
| Availability | Weekly schedule editor for available slots |
| Sync | External calendar connection status (Google/Microsoft) |

---

#### 2.4.1 Calendar Tab

**Tab Description:**
A visual monthly calendar showing all appointments overlaid with your availability. Different colours indicate different appointment types and statuses.

---

**TEST ID: SCHED-001**
**Test: View Calendar**
```
Prerequisite: Have at least one booking or session
Steps:
  1. Navigate to /dashboard/schedule
  2. Ensure "Calendar" tab is selected (default)
Expected Result:
  - Calendar displays current month
  - Bookings/sessions shown on their dates
  - Different colours for different statuses
  - Can navigate to previous/next months
```

---

**TEST ID: SCHED-002**
**Test: Click Calendar Event**
```
Prerequisite: Event exists on calendar
Steps:
  1. Click on a booking/session on the calendar
Expected Result:
  - Event details popup or panel appears
  - Shows: Client name, time, type
  - Link to full booking/session details
```

---

**TEST ID: SCHED-003**
**Test: Calendar Navigation**
```
Prerequisite: Logged in as member
Steps:
  1. Click "Next Month" arrow
  2. Click "Previous Month" arrow
  3. Click "Today" button
Expected Result:
  - Calendar navigates correctly
  - Returns to current date on "Today"
  - Events visible on relevant dates
```

---

#### 2.4.2 Appointments Tab

**Tab Description:**
A list view of all appointments (intro calls and sessions) with filtering options. Provides quick access to confirm, cancel, or manage bookings.

**Filter Options:**
| Tab | Shows |
|-----|-------|
| Pending | Only pending confirmation bookings |
| Upcoming | Pending + Confirmed future bookings |
| Past | Completed and past bookings |
| All | All appointments |

---

**TEST ID: APPT-001**
**Test: View Appointments**
```
Prerequisite: At least one booking exists
Steps:
  1. Click "Appointments" tab
  2. Review appointment list
Expected Result:
  - Appointments listed with most recent first
  - Each shows client name, date/time, status
  - Filter tabs work correctly
```

---

**TEST ID: APPT-002**
**Test: Filter Appointments**
```
Prerequisite: Multiple bookings in different statuses
Steps:
  1. Click "Pending" filter
  2. Click "Upcoming" filter
  3. Click "Past" filter
  4. Click "All" filter
Expected Result:
  - Each filter shows appropriate bookings
  - Counts update correctly
```

---

#### 2.4.3 Availability Tab

**Tab Description:**
Set your weekly availability schedule. Define which days and times you're available for bookings.

**Form Elements:**
| Element | Description |
|---------|-------------|
| Day Toggles | Enable/disable each day of the week |
| Time Slots | Start and end times for each day |
| Add Slot | Add multiple time slots per day |
| Date Overrides | Block specific dates or add special hours |

---

**TEST ID: AVAIL-001**
**Test: Set Weekly Availability**
```
Prerequisite: On Availability tab
Steps:
  1. Enable "Monday" toggle
  2. Set start time to 09:00
  3. Set end time to 17:00
  4. Click "Save"
Expected Result:
  - Monday 9am-5pm now available for booking
  - Public booking calendar shows these slots
```

---

**TEST ID: AVAIL-002**
**Test: Add Multiple Slots**
```
Prerequisite: Day already has one slot
Steps:
  1. Find Monday's availability
  2. Click "+ Add Slot" button
  3. Set second slot: 18:00-20:00
  4. Save changes
Expected Result:
  - Two time slots visible for Monday
  - Gap between 17:00-18:00 blocks bookings
```

---

**TEST ID: AVAIL-003**
**Test: Block Specific Date**
```
Prerequisite: On Availability tab
Steps:
  1. Find "Date Overrides" section
  2. Click "Add Override"
  3. Select a date (e.g., next Friday)
  4. Set as "Unavailable" or block specific times
  5. Save
Expected Result:
  - That date no longer shows available slots
  - Booking calendar reflects the override
```

---

#### 2.4.4 Sync Tab

**Tab Description:**
Connect external calendars (Google/Microsoft) to sync busy times and push bookings to your calendar. Shows connection status and sync options. Zoom integration is planned (Coming Soon).

> **Note:** Calendar sync testing is excluded from manual UAT scope but the connection status UI should be verified.

---

**TEST ID: SYNC-001**
**Test: View Sync Status**
```
Prerequisite: On Sync tab
Steps:
  1. Click "Sync" tab
  2. Review connection status
Expected Result:
  - Shows Google Calendar connection status
  - Shows Microsoft Calendar connection status
  - Shows Zoom status (Coming Soon)
  - Connect buttons visible for unconnected services
```

---

### 2.5 Practice Page

**URL:** https://findhypnotherapy.co.uk/dashboard/practice

**Page Description:**
The Practice page is a consolidated hub for managing your professional profile, services, content, and visibility settings. It combines profile management, service configuration, video uploads, and SEO/publishing controls into a single location with four tabs.

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Practice                                                   │
│  ┌──────────┬───────────┬───────────┬────────────┐         │
│  │ Profile  │ Services  │ Content   │ Visibility │         │
│  └──────────┴───────────┴───────────┴────────────┘         │
│                                                             │
│  [Tab Content Based on Selection]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Tab Structure:**

| Tab | Purpose |
|-----|---------|
| Profile | Professional profile with 5 sub-tabs |
| Services | Service management (pricing, descriptions) |
| Content | Video uploads and management |
| Visibility | Profile publishing, SEO, URL settings |

---

#### 2.5.1 Profile Tab

**Tab Description:**
Manage your professional profile information. This tab has 5 sub-tabs for organizing different aspects of your profile.

**Profile Sub-tabs:**
| Sub-tab | Purpose |
|---------|---------|
| Basic Info | Professional title, bio, credentials, experience |
| Contact | Phone, website, booking URL |
| Location | Address with visibility options |
| Sessions | Session formats, consultation options |
| Specializations | Multi-select list of specializations |

---

##### Sub-tab: Basic Info

**Form Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Professional Title | Text | Yes | Max 100 chars (e.g., "Clinical Hypnotherapist") |
| Bio | Textarea | Yes | Up to 5000 characters |
| Years of Experience | Number | No | 0-100 |
| Credentials | Text | No | Comma-separated list |
| Profile Photo | Upload | No | JPEG/PNG under 5MB |
| Banner Image | Upload | No | 1200x400px recommended |

---

**TEST ID: PRAC-001**
**Test: Update Account Photo**
```
Prerequisite: On Practice > Profile tab
Steps:
  1. Navigate to /dashboard/practice
  2. Click "Profile" tab (should be default)
  3. Click "Basic Info" sub-tab
  4. Locate photo upload area
  5. Upload a JPEG or PNG image under 5MB
  6. Click "Save Changes"
Expected Result:
  - Photo preview updates immediately
  - Photo appears in sidebar/header
  - Photo visible on public profile
```

---

**TEST ID: PRAC-002**
**Test: Complete Basic Info**
```
Prerequisite: On Practice > Profile > Basic Info
Steps:
  1. Enter "Clinical Hypnotherapist" in Professional Title
  2. Enter bio text (at least 100 characters)
  3. Enter "5" in Years of Experience
  4. Enter "Dip.Hyp, CNHC, GHR" in Credentials
  5. Click "Save Changes"
Expected Result:
  - Success toast: "Profile updated"
  - All fields retain entered values
  - Changes visible on public profile /directory/[your-slug]
```

---

**TEST ID: PRAC-003**
**Test: Bio Character Validation**
```
Prerequisite: On Basic Info sub-tab
Steps:
  1. Enter more than 5000 characters in Bio field
  2. Click "Save Changes"
Expected Result:
  - Error message: "Bio must be 5000 characters or less"
  - Form does not submit
```

---

##### Sub-tab: Contact

**Form Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Phone Number | Text | No | Valid phone format |
| Website | URL | No | Valid URL |
| Booking URL | URL | No | External booking system URL |

---

**TEST ID: PRAC-004**
**Test: Add Contact Information**
```
Prerequisite: On Contact sub-tab
Steps:
  1. Click "Contact" sub-tab
  2. Enter [PHONE] in Phone Number field
  3. Enter [YOUR_EMAIL] in Email field
  4. Enter "https://mywebsite.com" in Website field
  5. Click "Save Changes"
Expected Result:
  - Success toast appears
  - Phone shows on public profile with clickable tel: link
  - Website shows as external link
```

---

##### Sub-tab: Location

**Form Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Address Line 1 | Text | No | Max 200 chars |
| Address Line 2 | Text | No | Max 200 chars |
| City | Text | No | Max 100 chars |
| Postal Code | Text | No | Max 20 chars |
| Country | Dropdown | No (defaults to UK) | - |
| Address Visibility | Radio | Yes | - |

**Visibility Options:**
- Full address - Shows complete address
- City only - Shows only city and country
- Hidden - Does not display location

---

**TEST ID: PRAC-005**
**Test: Set Location with Visibility**
```
Prerequisite: On Location sub-tab
Steps:
  1. Click "Location" sub-tab
  2. Enter "123 High Street" in Address Line 1
  3. Enter "London" in City
  4. Enter "W1A 1AA" in Postal Code
  5. Select "City only" for visibility
  6. Click "Save Changes"
Expected Result:
  - Success toast appears
  - Public profile shows "London, United Kingdom" only
  - Full address NOT visible to visitors
```

---

##### Sub-tab: Sessions

**Form Fields:**
| Field | Type | Description |
|-------|------|-------------|
| Session Formats | Checkboxes | Online, In-Person, Phone |
| Offers Free Consultation | Checkbox | Enable free intro calls |
| Availability Notes | Textarea | Custom text about availability (max 1000 chars) |

---

**TEST ID: PRAC-006**
**Test: Configure Session Formats**
```
Prerequisite: On Sessions sub-tab
Steps:
  1. Click "Sessions" sub-tab
  2. Check "Online" checkbox
  3. Check "In-Person" checkbox
  4. Check "Offers Free Consultation"
  5. Enter availability notes
  6. Click "Save Changes"
Expected Result:
  - Success toast appears
  - Public profile shows "Online" and "In-Person" badges
  - "Book Free Consultation" button appears on public profile
```

---

##### Sub-tab: Specializations

**Description:**
A multi-select interface showing all available specializations grouped by category.

---

**TEST ID: PRAC-007**
**Test: Select Specializations**
```
Prerequisite: On Specializations sub-tab
Steps:
  1. Click "Specializations" sub-tab
  2. Expand "Conditions" category
  3. Check "Anxiety", "Stress", "Smoking Cessation"
  4. Click "Save Changes"
Expected Result:
  - Success toast appears
  - Selected specialisations visible on public profile
```

---

#### 2.5.2 Services Tab

**Tab Description:**
Create and manage the services you offer. Each service has its own pricing, duration, and description.

**Service Fields:**
| Field | Type | Required |
|-------|------|----------|
| Service Name | Text | Yes |
| Service Type | Dropdown (Single Session, Package, Programme, Consultation, Subscription) | Yes |
| Description | Textarea | No (max 500 chars) |
| Duration | Number (minutes) | Yes |
| Price | Currency | Yes |
| Image | Upload | No |

> **Note:** Session format (Online/In-Person/Phone) is set at the profile level in the Sessions sub-tab, not per-service.

---

**TEST ID: SVC-001**
**Test: Create New Service**
```
Prerequisite: On Practice > Services tab
Steps:
  1. Click "Services" tab
  2. Click "+ Add Service" button
  3. Enter "Anxiety Relief Session" in name
  4. Enter description
  5. Set duration: 60 minutes
  6. Set price: £80.00
  7. Click "Save"
Expected Result:
  - Service created and visible in list
  - Service appears on public profile
```

---

**TEST ID: SVC-002**
**Test: Edit Service**
```
Prerequisite: Service exists
Steps:
  1. Find service in list
  2. Click "Edit" button
  3. Change price to £90.00
  4. Click "Save"
Expected Result:
  - Price updated
  - Change visible on public profile
```

---

**TEST ID: SVC-003**
**Test: Delete Service**
```
Prerequisite: Service exists with no active bookings
Steps:
  1. Find service to delete
  2. Click "Delete" button
  3. Confirm deletion
Expected Result:
  - Service removed from list
  - Service removed from public profile
```

---

**TEST ID: SVC-004**
**Test: Reorder Services**
```
Prerequisite: Multiple services exist
Steps:
  1. Drag a service to new position
  2. Release to drop
Expected Result:
  - Services reorder
  - New order reflects on public profile
```

---

#### 2.5.3 Content Tab

**Tab Description:**
Upload and manage video content. Videos can be educational content, promotional videos, or testimonials that display on your public profile.

**Video Constraints:**
- File size: Max 50MB
- Duration: 3-90 seconds
- Formats: MP4, WebM, MOV
- Title: Max 100 characters

---

**TEST ID: CONT-001**
**Test: Upload Video**
```
Prerequisite: Have MP4/WebM/MOV video file under 50MB
Steps:
  1. Click "Content" tab
  2. Click "+ Upload Video" button
  3. Select video file
  4. Enter title: "Introduction to Hypnotherapy"
  5. Enter description
  6. Click "Upload"
Expected Result:
  - Upload progress indicator shows
  - Video appears in library when complete
  - Thumbnail generated
```

---

**TEST ID: CONT-002**
**Test: Edit Video**
```
Prerequisite: Video exists
Steps:
  1. Find video in library
  2. Click "Edit" button
  3. Change title
  4. Click "Save"
Expected Result:
  - Video details updated
  - Changes visible on public profile
```

---

**TEST ID: CONT-003**
**Test: Delete Video**
```
Prerequisite: Video exists
Steps:
  1. Find video to delete
  2. Click "Delete" button
  3. Confirm deletion
Expected Result:
  - Video removed from library
  - Video removed from public profile
```

---

#### 2.5.4 Visibility Tab

**Tab Description:**
Control your profile's visibility in the directory, SEO settings, and custom URL.

**Form Fields:**
| Field | Type | Description |
|-------|------|-------------|
| Profile Published | Toggle | Makes profile visible in directory |
| Social Sharing Image | Upload | OG image for social media sharing |
| Meta Description | Textarea | SEO description for search engines (max 160 chars) |

---

**TEST ID: VIS-001**
**Test: Publish Profile**
```
Prerequisite: Profile has required fields completed (bio, at least one service)
Steps:
  1. Click "Visibility" tab
  2. Toggle "Profile Published" to ON
  3. Click "Save Changes"
Expected Result:
  - Success toast appears
  - Profile now visible at /directory/[your-slug]
  - Profile appears in directory search results
```

---

**TEST ID: VIS-002**
**Test: Upload Social Sharing Image**
```
Prerequisite: On Visibility tab
Steps:
  1. Find "Social Sharing Image" section
  2. Click upload area or "Upload Image" button
  3. Select an image file (recommended: 1200x630px)
  4. Wait for upload to complete
Expected Result:
  - Image preview displays
  - Success message appears
  - Image used when profile shared on social media
```

---

**TEST ID: VIS-003**
**Test: Publish Without Required Fields**
```
Prerequisite: New profile with no services added
Steps:
  1. Click "Visibility" tab
  2. Click "Publish Profile" button
Expected Result:
  - Error message: "Please add at least one service before publishing your profile"
  - Profile remains unpublished
```

---

**TEST ID: VIS-004**
**Test: Update SEO Meta Description**
```
Prerequisite: On Visibility tab
Steps:
  1. Find "Search Engine Optimization (SEO)" section
  2. Enter meta description (max 160 characters)
  3. Click "Save SEO Settings"
Expected Result:
  - Success message: "SEO settings updated successfully!"
  - Description used in search engine results
```

---

### 2.6 Settings Page

**URL:** https://findhypnotherapy.co.uk/dashboard/settings

**Page Description:**
The Settings page contains account settings, booking preferences, and billing/subscription management.

**Tabs:**
| Tab | Content |
|-----|---------|
| Account | Name, email, password change |
| Terms | Terms & Conditions editor (required for client invitations) |
| Billing | Subscription status, plan details, Stripe portal |
| Booking Settings | RSVP settings, reminders, video platform, approval settings, slot duration (15-120 mins), buffer time (0-30 mins), minimum notice (0 hours-1 week), booking window (1 week-1 year) |

---

**TEST ID: SET-001**
**Test: Change Password**
```
Prerequisite: Logged in
Steps:
  1. Navigate to /dashboard/settings
  2. Find password change section
  3. Enter current password
  4. Enter new password (meeting complexity requirements)
  5. Confirm new password
  6. Click "Change Password"
Expected Result:
  - Success toast: "Password updated"
  - Can log in with new password
  - Old password no longer works
```

---

**TEST ID: SET-002**
**Test: View Subscription Status**
```
Prerequisite: Logged in
Steps:
  1. Navigate to /dashboard/settings
  2. Find Billing section
Expected Result:
  - Shows current plan
  - Shows trial end date (if in trial)
  - Shows next billing date
  - Price: £29.99/month (or discounted rate with founder code)
```

---

**TEST ID: SET-003**
**Test: Access Billing Portal**
```
Prerequisite: Active subscription
Steps:
  1. Find Billing section
  2. Click "Manage Subscription" or "Billing Portal" link
Expected Result:
  - Redirected to Stripe billing portal
  - Can update payment method
  - Can view invoices
  - Can cancel subscription
```

---

**TEST ID: SET-004**
**Test: Set Up Terms & Conditions**
```
Prerequisite: On Settings page
Steps:
  1. Click "Terms" tab
  2. Enter terms text in rich text editor
  3. Click "Save Changes"
Expected Result:
  - Terms saved successfully
  - Terms shown to clients during onboarding
  - Can now invite clients (terms required for invitations)
```

---

**TEST ID: SET-005**
**Test: Configure Booking Settings**
```
Prerequisite: On Settings page
Steps:
  1. Click "Booking Settings" tab
  2. Configure RSVP settings (enable/disable)
  3. Set reminder preferences
  4. Configure video platform preference
  5. Click "Save Changes"
Expected Result:
  - Settings saved successfully
  - New sessions use updated settings
```

---

> **Note:** The following legacy sections have been consolidated into the pages above:
> - Profile Management → Practice Page > Profile Tab
> - Services & Pricing → Practice Page > Services Tab
> - Availability & Booking Settings → Schedule Page > Availability Tab
> - Intro Calls / Bookings → Clients Page > Intro Calls Tab
> - Messages → Clients Page > Enquiries Tab
> - Clients Management → Clients Page > All Clients Tab
> - Client Detail Page → Clients Page > Client Detail
> - Schedule → Schedule Page > Calendar/Appointments Tabs
> - Calendar → Schedule Page > Calendar Tab
> - Content (Videos) → Practice Page > Content Tab

---

## 3. Client/Visitor Testing

### 3.1 Homepage

**URL:** https://findhypnotherapy.co.uk/

**Page Description:**
The homepage is the main landing page for visitors. It features a hero section with search functionality, educational content about hypnotherapy, evidence/statistics, a showcase of what conditions can be treated, and calls to action for both visitors and practitioners.

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Find Hypnotherapy              [Directory] [Login]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│         Find Your Perfect Hypnotherapist                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ What are you looking for help with?           [Search] ││
│  │ [Specialisation Dropdown ▼]                             ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Empathy Hook Section                                       │
│  "We understand what you're going through..."               │
├─────────────────────────────────────────────────────────────┤
│  Evidence & Statistics                                      │
│  "95% success rate..."                                      │
├─────────────────────────────────────────────────────────────┤
│  What Can Hypnotherapy Help With?                           │
│  [Anxiety] [Stress] [Phobias] [Weight] [Smoking] ...       │
├─────────────────────────────────────────────────────────────┤
│  How It Works                                               │
│  1. Search  2. Choose  3. Book  4. Transform               │
├─────────────────────────────────────────────────────────────┤
│  What is Hypnotherapy?                                      │
│  [Educational content]                                      │
├─────────────────────────────────────────────────────────────┤
│  FAQs                                                       │
│  [Accordion of common questions]                            │
├─────────────────────────────────────────────────────────────┤
│  [Footer with links]                                        │
└─────────────────────────────────────────────────────────────┘
```

---

**TEST ID: HOME-001**
**Test: Homepage Load**
```
Prerequisite: None
Steps:
  1. Navigate to https://findhypnotherapy.co.uk/
  2. Wait for page to fully load
Expected Result:
  - Page loads without errors
  - Hero section visible with search
  - All sections render correctly
  - No broken images or layout issues
```

---

**TEST ID: HOME-002**
**Test: Search from Homepage**
```
Prerequisite: At least one published therapist profile exists
Steps:
  1. On homepage, locate search dropdown
  2. Click dropdown to open specialisation list
  3. Select "Anxiety" from the list
  4. Click "Search" button
Expected Result:
  - Redirected to /directory with filter applied
  - Results show therapists specialising in Anxiety
```

---

**TEST ID: HOME-003**
**Test: Navigation Links**
```
Prerequisite: None
Steps:
  1. Click "Directory" in navigation
Expected Result: Navigates to /directory

  2. Click logo or "Home"
Expected Result: Returns to homepage

  3. Click "Login" in navigation
Expected Result: Navigates to /login
```

---

**TEST ID: HOME-004**
**Test: FAQ Accordion**
```
Prerequisite: None
Steps:
  1. Scroll to FAQ section
  2. Click on first question
Expected Result:
  - Answer expands below question
  - Other questions remain collapsed

  3. Click on second question
Expected Result:
  - Second answer expands
  - First may collapse (accordion behavior)
```

---

### 3.2 Directory Search

**URL:** https://findhypnotherapy.co.uk/directory

**Page Description:**
The directory page is the main search interface for finding therapists. It displays a grid of therapist cards with filtering options at the top. Results are paginated with 20 per page.

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Find a Hypnotherapist                                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Search Filters                                          ││
│  │ [Name Search    ] [Location     ] [Specialisation ▼]   ││
│  │ [Session Format ▼]                                      ││
│  │ [Search] [Clear Filters]                                ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  Showing 1-20 of 45 results                                 │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ [Photo]          │  │ [Photo]          │                │
│  │ Jane Smith       │  │ John Doe         │                │
│  │ Clinical Hypno...│  │ Hypnotherapist   │                │
│  │ London           │  │ Manchester       │                │
│  │ From £75         │  │ From £60         │                │
│  │ ★ Online ★ In-P  │  │ ★ Online         │                │
│  │ [View Profile]   │  │ [View Profile]   │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  [← Previous]                              [Next →]         │
└─────────────────────────────────────────────────────────────┘
```

**Filter Options:**
| Filter | Type | Description |
|--------|------|-------------|
| Name Search | Text | Search by therapist name |
| Location | Text | Filter by city or postal code |
| Specialisation | Dropdown | Filter by area of expertise |
| Session Format | Dropdown | In-Person, Online, Phone |

---

**TEST ID: DIR-001**
**Test: View Directory**
```
Prerequisite: At least one published profile exists
Steps:
  1. Navigate to /directory
  2. Wait for results to load
Expected Result:
  - Results count displayed
  - Therapist cards shown in grid
  - Each card shows: photo, name, title, location, price, formats
```

---

**TEST ID: DIR-002**
**Test: Filter by Name**
```
Prerequisite: Know a therapist's name in the directory
Steps:
  1. Enter therapist name in search field
  2. Click "Search" or press Enter
Expected Result:
  - Results filter to matching names
  - Partial matches may appear
```

---

**TEST ID: DIR-003**
**Test: Filter by Location**
```
Prerequisite: None
Steps:
  1. Enter "London" in Location field
  2. Click "Search"
Expected Result:
  - Results show only therapists in London
  - Results count updates
```

---

**TEST ID: DIR-004**
**Test: Filter by Specialisation**
```
Prerequisite: None
Steps:
  1. Click Specialisation dropdown
  2. Select "Smoking Cessation"
  3. Click "Search"
Expected Result:
  - Results show therapists who specialise in smoking cessation
  - Results count updates
```

---

**TEST ID: DIR-005**
**Test: Filter by Session Format**
```
Prerequisite: None
Steps:
  1. Click Session Format dropdown
  2. Select "Online"
  3. Click "Search"
Expected Result:
  - Results show only therapists offering online sessions
```

---

**TEST ID: DIR-006**
**Test: Combined Filters**
```
Prerequisite: None
Steps:
  1. Enter "London" in Location
  2. Select "Anxiety" in Specialisation
  3. Select "Online" in Session Format
  4. Click "Search"
Expected Result:
  - Results match ALL filters combined
  - Clear Filters button visible
```

---

**TEST ID: DIR-007**
**Test: Clear Filters**
```
Prerequisite: Filters applied
Steps:
  1. Click "Clear Filters" button
Expected Result:
  - All filter fields reset
  - Full results list shown
  - URL parameters cleared
```

---

**TEST ID: DIR-008**
**Test: Pagination**
```
Prerequisite: More than 20 results exist
Steps:
  1. Scroll to bottom of results
  2. Click "Next" button
Expected Result:
  - Page 2 results load
  - "Previous" button now visible
  - Showing "21-40 of X" results
```

---

### 3.3 Therapist Profile

**URL:** https://findhypnotherapy.co.uk/directory/[therapist-slug]

**Page Description:**
The public therapist profile page displays comprehensive information about a therapist. It has a banner image, profile photo, contact options, services list, about section, specialisations, and videos. A sticky sidebar (on desktop) contains the contact form and booking button.

**Visual Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Banner Image - Full Width]                                │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────┬────────────────────────┐│
│  │ [Photo] Jane Smith            │ Contact                ││
│  │         Clinical Hypnotherapist│ ┌──────────────────┐  ││
│  │         London, UK            │ │[Book Consultation]│  ││
│  │         ✓ Verified            │ └──────────────────┘  ││
│  │         Dip.Hyp, CNHC         │ ☎ 07700 900000        ││
│  │         ★Online ★In-Person    │ 🌐 Website            ││
│  │         From £75              │                        ││
│  │         🆓 Free Consultation   │ ┌──────────────────┐  ││
│  │                               │ │ Contact Form     │  ││
│  ├───────────────────────────────┤ │ Name: [        ] │  ││
│  │ Services                      │ │ Email:[        ] │  ││
│  │ ┌─────────────────────────┐  │ │ Message:         │  ││
│  │ │ Hypnotherapy Session    │  │ │ [              ] │  ││
│  │ │ 60 min | £75            │  │ │ [Send Message]   │  ││
│  │ └─────────────────────────┘  │ └──────────────────┘  ││
│  │                               │                        ││
│  │ About                         │ Location               ││
│  │ [Bio text...]                │ London, UK             ││
│  │                               │                        ││
│  │ Specialisations              │                        ││
│  │ [Anxiety] [Stress] [...]     │                        ││
│  └───────────────────────────────┴────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

**TEST ID: PROF-VIS-001**
**Test: View Therapist Profile**
```
Prerequisite: Published therapist profile exists
Steps:
  1. Navigate to /directory/[therapist-slug]
  2. Review all sections
Expected Result:
  - Banner image displays (or default)
  - Profile photo displays
  - Name and title visible
  - Session format badges shown
  - Services listed
  - Specialisations shown as clickable badges
```

---

**TEST ID: PROF-VIS-002**
**Test: View Service Details**
```
Prerequisite: Profile has services
Steps:
  1. Find a service in the Services section
  2. Click on the service name or "View Details"
Expected Result:
  - Navigates to /directory/[slug]/service/[serviceId]
  - Full service details displayed
```

---

### 3.4 Service Details

**URL:** https://findhypnotherapy.co.uk/directory/[slug]/service/[serviceId]

**Page Description:**
A dedicated page for viewing full details of a specific service. Shows service image, description, pricing, what's included, and a link back to the therapist profile.

---

**TEST ID: SVC-VIS-001**
**Test: View Service Details**
```
Prerequisite: Service exists
Steps:
  1. Navigate to service detail page
Expected Result:
  - Service image (or gradient placeholder)
  - Service name and type badge
  - Full description
  - Price with per-session breakdown (for packages)
  - Duration and session count
  - "What's Included" list
  - Therapist mini-card with link
  - "Make an enquiry" button
```

---

**TEST ID: SVC-VIS-002**
**Test: Make Enquiry from Service**
```
Prerequisite: None
Steps:
  1. Click "Make an enquiry" button
Expected Result:
  - Navigates to booking page: /book/[slug]?serviceId=[id]
  - Service pre-selected in booking form
```

---

### 3.5 About Page

**URL:** https://findhypnotherapy.co.uk/about

**Page Description:**
The about page explains the platform's mission and provides information for both visitors seeking therapy and practitioners looking to join.

---

**TEST ID: ABOUT-001**
**Test: View About Page**
```
Prerequisite: None
Steps:
  1. Navigate to /about
  2. Review page content
Expected Result:
  - Mission statement visible
  - Platform benefits explained
  - For Practitioners section
  - CTA buttons for finding therapist and joining
```

---

### 3.6 Videos Page

**URL:** https://findhypnotherapy.co.uk/videos

**Page Description:**
A page listing all videos uploaded by therapists on the platform. Visitors can filter videos by topic or therapist location.

---

**TEST ID: VIDEO-001**
**Test: View Videos Page**
```
Prerequisite: At least one video uploaded by a therapist
Steps:
  1. Navigate to /videos
  2. View video grid
Expected Result:
  - Videos displayed in grid
  - Each shows thumbnail, title, therapist name
  - Filter options available
```

---

**TEST ID: VIDEO-002**
**Test: Watch Video**
```
Prerequisite: Video exists
Steps:
  1. Click on a video thumbnail or title
Expected Result:
  - Navigates to /videos/[slug]
  - Video player loads
  - Can play video
  - Therapist information shown
```

---

### 3.7 For Practitioners Page

**URL:** https://findhypnotherapy.co.uk/for-practitioners

**Page Description:**
Landing page for therapists to learn about platform benefits, pricing, and how to join. Features include platform benefits, pricing information, and sign-up CTAs.

---

**TEST ID: FORPRAC-001**
**Test: View For Practitioners Page**
```
Prerequisite: None
Steps:
  1. Navigate to /for-practitioners
  2. Review page content
Expected Result:
  - Platform benefits explained
  - Features listed
  - Pricing information visible
  - Sign up/Register CTA buttons
```

---

### 3.8 Subscribe Page

**URL:** https://findhypnotherapy.co.uk/subscribe

**Page Description:**
Subscription checkout page for new members. Shows pricing (£29.99/month with 14-day free trial), discount code input, and Stripe checkout.

**Pricing:**
| Plan | Price | Trial |
|------|-------|-------|
| Standard | £29.99/month | 14 days free |
| Founder (with code) | £9.99 or £4.99/month | 14 days free |

---

**TEST ID: SUB-001**
**Test: View Subscribe Page**
```
Prerequisite: Logged in as member without subscription
Steps:
  1. Navigate to /subscribe
Expected Result:
  - Pricing displayed (£29.99/month)
  - 14-day trial mentioned
  - Discount code field visible
  - "Subscribe" button visible
```

---

**TEST ID: SUB-002**
**Test: Apply Founder Code**
```
Prerequisite: Have valid founder discount code
Steps:
  1. Enter discount code
  2. Click "Apply"
Expected Result:
  - Discount applied
  - New price displayed (£9.99 or £4.99/month)
```

---

### 3.9 Booking Flow

**URL:** https://findhypnotherapy.co.uk/book/[therapist-slug]

**Page Description:**
The booking page allows visitors to request an intro call with a therapist. It displays a calendar for selecting a date, time slots for the selected date, and a form for visitor information. Email verification is required.

**Form Fields:**
| Field | Required | Validation |
|-------|----------|------------|
| Full Name | Yes | 2-100 characters |
| Email | Yes | Valid email format |
| Phone | No | Max 20 characters |
| Notes | No | Max 1000 characters |
| Terms checkbox | If therapist has terms | Must be checked |

---

**TEST ID: BOOK-VIS-001**
**Test: Load Booking Page**
```
Prerequisite: Therapist has online booking enabled
Steps:
  1. Navigate to /book/[therapist-slug]
Expected Result:
  - Calendar displays current month
  - Available dates highlighted
  - Form visible on right/below
  - Therapist name in header
```

---

**TEST ID: BOOK-VIS-002**
**Test: Select Date and Time**
```
Prerequisite: On booking page
Steps:
  1. Click on an available date
  2. View available time slots
  3. Click on a time slot
Expected Result:
  - Date highlights as selected
  - Time slots for that date appear
  - Selected time slot highlighted
```

---

**TEST ID: BOOK-VIS-003**
**Test: Submit Booking Request**
```
Prerequisite: Date and time selected
Steps:
  1. Enter full name
  2. Enter email address
  3. Optionally enter phone and notes
  4. Accept terms (if required)
  5. Click "Request Booking" button
Expected Result:
  - Loading indicator shown
  - Success message: "Check your email"
  - Instructions to verify email
Email Check:
  - Verification email sent to visitor
  - Subject: "Verify your booking request"
  - Contains booking summary
  - "Confirm Booking" button
  - Link expires in 24 hours
```

---

**TEST ID: BOOK-VIS-004**
**Test: Verify Booking Email**
```
Prerequisite: Booking verification email received
Steps:
  1. Open verification email
  2. Click "Confirm Booking" button
Expected Result:
  - Redirected to /booking-verified
  - Success message displayed
  - Booking confirmation details shown
Email Check:
  - Therapist receives new booking notification
  - Subject: "New booking request from [VISITOR_NAME]"
```

---

### 3.10 Messaging Flow

**Page Description:**
Visitors can contact therapists through a contact form on the therapist's profile. Email verification is required. After verification, visitors can continue conversations via a unique URL.

---

**TEST ID: MSG-VIS-001**
**Test: Submit Contact Form**
```
Prerequisite: On therapist profile page
Steps:
  1. Scroll to contact form (sidebar or bottom)
  2. Enter name: [YOUR_NAME]
  3. Enter email: [YOUR_EMAIL]
  4. Enter message (min 10 chars)
  5. Click "Send Message"
Expected Result:
  - Success message: "Check your email"
  - Message queued pending verification
Email Check:
  - Verification email received
  - Subject: "Verify your email to contact [THERAPIST_NAME]"
  - Link expires in 24 hours
```

---

**TEST ID: MSG-VIS-002**
**Test: Verify Message Email**
```
Prerequisite: Verification email received
Steps:
  1. Open verification email
  2. Click "Verify Email & Send Message" button
Expected Result:
  - Redirected to /verification-success or /conversation/[token]
  - Message shows as sent
Email Check:
  - Therapist receives message notification
```

---

### 3.11 Client Onboarding Flow

**URL:** https://findhypnotherapy.co.uk/client-onboard/[token]

**Page Description:**
Multi-step onboarding form for clients who have been invited by a therapist. Steps are conditional based on the therapist's requirements for the linked service.

**Onboarding Steps:**
1. Personal Info - First name, last name, phone number
2. Address - Postal address (conditional based on service requirements)
3. Emergency Contact - Name, phone, relationship (conditional)
4. Health Info - Health conditions and GP details (conditional)
5. Terms - Accept therapist's terms and conditions

---

**TEST ID: ONBOARD-001**
**Test: Complete Client Onboarding**
```
Prerequisite: Received client invitation email
Steps:
  1. Open invitation email
  2. Click "Complete Onboarding" button
  3. Complete each step of the form
  4. Accept terms and conditions
  5. Click "Complete Onboarding"
Expected Result:
  - Redirected to /client-onboard/complete
  - Success message shown
  - Instructions for what happens next
Email Check:
  - Therapist notified of completion
  - Client receives portal access email
```

---

**TEST ID: ONBOARD-002**
**Test: Expired Invitation Link**
```
Prerequisite: Wait for invitation to expire (7 days)
Steps:
  1. Click old invitation link
Expected Result:
  - Error page displayed
  - Message: "Invalid or Expired Link"
  - Link to contact therapist
```

---

### 3.12 Session RSVP Flow

**URLs:**
- `/session-rsvp` - Processes accept/decline from email
- `/session-rsvp/confirmed` - Acceptance confirmation
- `/session-rsvp/declined` - Decline confirmation
- `/session-rsvp/error` - Error handling

**Page Description:**
When a therapist schedules a session, the client receives an email with RSVP links. Clicking accept or decline processes the response and shows a confirmation page.

---

**TEST ID: RSVP-001**
**Test: Accept Session via Email**
```
Prerequisite: Received session invitation email
Steps:
  1. Open session invitation email
  2. Click "Accept" button
Expected Result:
  - Redirected to /session-rsvp/confirmed
  - Confirmation message displayed
  - Session details shown
Email Check:
  - Therapist notified of acceptance
```

---

**TEST ID: RSVP-002**
**Test: Decline Session via Email**
```
Prerequisite: Received session invitation email
Steps:
  1. Open session invitation email
  2. Click "Decline" button
Expected Result:
  - Redirected to /session-rsvp/declined
  - Decline confirmation displayed
Email Check:
  - Therapist notified of decline
```

---

### 3.13 Client Portal

**URL:** https://findhypnotherapy.co.uk/portal

**Page Description:**
The client portal is a private area for clients who have been invited by a therapist and completed onboarding. It uses passwordless authentication (magic links) and provides access to sessions, messages, and profile management.

#### 3.13.1 Portal Login

**URL:** https://findhypnotherapy.co.uk/portal/login

---

**TEST ID: PORTAL-001**
**Test: Portal Login (Magic Link)**
```
Prerequisite: Client account exists (onboarding complete)
Steps:
  1. Navigate to /portal/login
  2. Enter your email address
  3. Click "Send Login Link"
Expected Result:
  - Success message: "Check Your Email"
Email Check:
  - Subject: "Your login link for Find Hypnotherapy"
  - Contains "Log In to Portal" button
  - Link expires in 1 hour
```

---

**TEST ID: PORTAL-002**
**Test: Access Portal via Magic Link**
```
Prerequisite: Magic link email received
Steps:
  1. Open email
  2. Click "Log In to Portal" button
Expected Result:
  - Automatically logged in
  - Redirected to /portal (dashboard)
  - Can see upcoming sessions and therapists
```

---

#### 3.13.2 Portal Dashboard

**URL:** https://findhypnotherapy.co.uk/portal

---

**TEST ID: PORTAL-003**
**Test: View Portal Dashboard**
```
Prerequisite: Logged into portal
Steps:
  1. Navigate to /portal
Expected Result:
  - Welcome message with your name
  - Stat cards: Upcoming Sessions, Unread Messages, My Therapists
  - Upcoming sessions widget
  - My Therapists widget
```

---

#### 3.13.3 Portal Sessions

**URL:** https://findhypnotherapy.co.uk/portal/sessions

---

**TEST ID: PORTAL-004**
**Test: View Sessions**
```
Prerequisite: At least one session scheduled
Steps:
  1. Click "Sessions" in navigation
Expected Result:
  - List of all sessions
  - Filter buttons: Upcoming, Past, All
  - Each session shows: title, therapist, date, time, format, status
```

---

#### 3.13.4 Portal Profile

**URL:** https://findhypnotherapy.co.uk/portal/profile

---

**TEST ID: PORTAL-005**
**Test: Update Portal Profile**
```
Prerequisite: Logged into portal
Steps:
  1. Click "Profile" in navigation
  2. Update phone number
  3. Update address fields
  4. Update emergency contact
  5. Click "Save Changes"
Expected Result:
  - Success message: "Profile updated successfully"
  - Changes saved
```

---

#### 3.13.5 Portal Messages

**URL:** https://findhypnotherapy.co.uk/portal/messages

**Page Description:**
Lists all conversations with therapists. Shows unread message indicators and allows clients to communicate with their therapists.

---

**TEST ID: PORTAL-006**
**Test: View Messages List**
```
Prerequisite: Logged into portal, at least one conversation exists
Steps:
  1. Click "Messages" in navigation
Expected Result:
  - List of conversations displayed
  - Each shows: therapist photo, name, last message preview, date
  - Unread count badge on conversations with new messages
```

---

**TEST ID: PORTAL-007**
**Test: View and Reply to Conversation**
```
Prerequisite: Conversation exists with therapist
Steps:
  1. Click on a conversation in the list
  2. View full message thread
  3. Type a reply message
  4. Click "Send"
Expected Result:
  - Full conversation history displayed
  - Messages show sender and timestamp
  - New message appears in thread
  - Therapist receives notification
```

---

#### 3.13.6 Portal Therapists

**URL:** https://findhypnotherapy.co.uk/portal/therapists

**Page Description:**
Shows all therapists the client is connected with, including relationship status and contact options.

---

**TEST ID: PORTAL-008**
**Test: View My Therapists**
```
Prerequisite: Logged into portal, connected to at least one therapist
Steps:
  1. Click "My Therapists" in navigation
Expected Result:
  - Grid of therapist cards displayed
  - Each shows: photo, name, professional title, location
  - Relationship status badge (Active, Paused, Ended)
  - "Working together since" date shown
```

---

## 4. End-to-End Workflows

The following workflows test complete user journeys across multiple features.

### 4.1 New Therapist: Registration to First Booking

**Estimated Time:** 30-45 minutes

**TEST ID: E2E-001**
```
Workflow: New therapist signs up, creates profile, and receives first booking

PART A: Registration
  1. Navigate to /register
  2. Create new account with [NEW_EMAIL]
  3. Verify email via link
  4. Log in

PART B: Profile Setup
  5. Navigate to /dashboard/practice (Profile tab)
  6. Complete Basic Info (title, bio, credentials)
  7. Add contact information (phone, email)
  8. Add location with "City only" visibility
  9. Set session formats (Online checked)
  10. Check "Offers Free Consultation"
  11. Select 3-5 specialisations

PART C: Services
  12. Navigate to /dashboard/practice (Services tab)
  13. Create at least one service:
      - Name: "Hypnotherapy Session"
      - Type: Single Session
      - Duration: 60 minutes
      - Price: £75

PART D: Availability
  14. Navigate to /dashboard/schedule (Availability tab)
  15. Configure booking settings
  16. Enable "Accept Online Bookings"
  17. Set weekly schedule (Mon-Fri, 9-5)

PART E: Publish
  18. Navigate to /dashboard/practice (Visibility tab)
  19. Toggle "Profile Published" ON
  20. Save changes
  21. Verify profile appears at /directory/[your-slug]

PART F: Receive Booking
  22. Open new browser/incognito window
  23. Navigate to your profile
  24. Click "Book Free Consultation"
  25. Select available date and time
  26. Enter visitor details
  27. Submit booking
  28. Open verification email, click link
  29. Back in member account, check /dashboard/clients (Intro Calls tab)
  30. Verify booking appears as "Pending"
  31. Click "Confirm"
  32. Verify visitor receives confirmation email

Expected Final State:
  - Therapist has published profile visible in directory
  - One confirmed booking exists
  - Visitor received confirmation email
```

---

### 4.2 Visitor Journey: Find, Book, Become Client

**Estimated Time:** 20-30 minutes

**TEST ID: E2E-002**
```
Workflow: Visitor searches directory, books intro call, becomes ongoing client

PART A: Find Therapist
  1. Navigate to /directory
  2. Search for therapist by location: "London"
  3. Filter by specialisation: "Anxiety"
  4. Click on a matching therapist profile

PART B: Book Intro Call
  5. Click "Book Free Consultation"
  6. Select date and time
  7. Complete booking form
  8. Verify email
  9. Wait for therapist to confirm

PART C: Become Client
  10. (As therapist) Confirm the booking in /dashboard/clients (Intro Calls tab)
  11. (As therapist) Invite visitor as client
  12. (As visitor) Receive client invitation email
  13. Click "Complete Onboarding"
  14. Fill in onboarding form, accept terms
  15. Submit onboarding

PART D: Access Client Portal
  16. Navigate to /portal/login
  17. Enter your email
  18. Open magic link email
  19. Access portal dashboard

Expected Final State:
  - Client has portal access
  - Therapist has new active client
```

---

### 4.3 Client Session Lifecycle with RSVP

**Estimated Time:** 15-20 minutes

**TEST ID: E2E-003**
```
Workflow: Therapist creates session, client receives RSVP, confirms

PART A: Create Session
  1. (As therapist) Navigate to /dashboard/clients/[client-slug]
  2. Go to Sessions tab
  3. Click "+ Create Session"
  4. Enter session details
  5. Save session

PART B: Client RSVP
  6. (As client) Check email for RSVP request
  7. Click "Accept" button
  8. Verify confirmation page shows

PART C: Confirmation
  9. (As client) Check email for RSVP confirmation
  10. Verify meeting link included

Expected Final State:
  - Session confirmed with accepted RSVP
  - Both parties have session on their schedules
```

---

### 4.4 Complete Message Conversation Flow

**Estimated Time:** 10-15 minutes

**TEST ID: E2E-004**
```
Workflow: Visitor initiates contact, conversation continues

PART A: Initial Contact
  1. (As visitor) Go to therapist profile
  2. Submit contact form
  3. Verify email, message sent

PART B: Therapist Reply
  4. (As therapist) Check /dashboard/clients (Enquiries tab)
  5. Open conversation
  6. Send reply

PART C: Visitor Receives Reply
  7. (As visitor) Check email for reply notification
  8. Click link to conversation
  9. Read and reply

Expected Final State:
  - Ongoing conversation established
  - Both parties can continue messaging
```

---

## 5. Email Testing Checklist

### 5.1 Email Summary Table

Use this table to track email testing. Check each email type as tested.

> **Note:** The codebase contains 24 email template functions that cover these 30 email types. Some functions are reused with different parameters (e.g., reminder emails for different time periods).

| # | Email Type | Trigger | Recipient | Subject Pattern | Expiry | Tested |
|---|------------|---------|-----------|-----------------|--------|--------|
| 1 | Message Verification | Visitor submits contact form | Visitor | "Verify your email to contact [Therapist]" | 24h | ☐ |
| 2 | New Message Notification | Message verified | Therapist | "New message from [Visitor]" | N/A | ☐ |
| 3 | Therapist Reply | Therapist replies | Visitor | "Reply from [Therapist]" | N/A | ☐ |
| 4 | Visitor Reply | Visitor replies | Therapist | "Reply from [Visitor]" | N/A | ☐ |
| 5 | Booking Verification | Visitor submits booking | Visitor | "Confirm your booking with [Therapist]" | 24h | ☐ |
| 6 | New Booking Notification | Booking verified | Therapist | "New booking from [Visitor]" | N/A | ☐ |
| 7 | Booking Confirmed | Therapist confirms | Visitor | "Booking confirmed with [Therapist]" | N/A | ☐ |
| 8 | Booking Cancelled | Therapist cancels | Visitor | "Booking cancelled - [Date]" | N/A | ☐ |
| 9 | Booking Reminder 24h | Scheduled (24h before) | Visitor | "Reminder: Appointment tomorrow with [Therapist]" | N/A | ☐ |
| 10 | Booking Reminder 1h | Scheduled (1h before) | Visitor | "Starting soon: Appointment in 1 hour with [Therapist]" | N/A | ☐ |
| 11 | Therapist Booking Reminder 24h | Scheduled (24h before) | Therapist | "Reminder: Client appointment tomorrow" | N/A | ☐ |
| 12 | Therapist Booking Reminder 1h | Scheduled (1h before) | Therapist | "Starting soon: Client appointment in 1 hour" | N/A | ☐ |
| 13 | Client Invitation | Therapist invites client | Client | "[Therapist] has invited you to join as a client" | 7d | ☐ |
| 14 | Client Onboarding Complete | Client completes onboarding | Therapist | "[Client] has completed onboarding" | N/A | ☐ |
| 15 | Portal Access | Client onboarded | Client | "Welcome to your client portal - [Therapist]" | N/A | ☐ |
| 16 | Client Magic Link | Client requests login | Client | "Your login link for Find Hypnotherapy" | 1h | ☐ |
| 17 | Session Created | Therapist creates session | Client | "New session scheduled: [Title]" | N/A | ☐ |
| 18 | Session Updated | Therapist updates session | Client | "Session updated: [Title]" | N/A | ☐ |
| 19 | Session Cancelled | Therapist cancels session | Client | "Session cancelled: [Title]" | N/A | ☐ |
| 20 | Session RSVP Request | Session created (RSVP on) | Client | "Please confirm: [Title] with [Therapist]" | 7d | ☐ |
| 21 | Session RSVP Accepted | Client accepts | Client | "Confirmed: [Title] with [Therapist]" | N/A | ☐ |
| 22 | Session RSVP Declined (to client) | Client declines | Client | "Session declined: [Title]" | N/A | ☐ |
| 23 | Session RSVP Declined (to therapist) | Client declines | Therapist | "[Client] declined: [Title]" | N/A | ☐ |
| 24 | Session RSVP Reminder 1 | Scheduled | Client | "Reminder: Please confirm your session with [Therapist]" | 7d | ☐ |
| 25 | Session RSVP Reminder 2 | Scheduled | Client | "Final reminder: Please confirm your session with [Therapist]" | 7d | ☐ |
| 26 | Reschedule Proposal | Client proposes reschedule | Therapist | "Reschedule request from [Client]: [Title]" | N/A | ☐ |
| 27 | Reschedule Approved | Therapist approves | Client | "Reschedule approved: [Title]" | N/A | ☐ |
| 28 | Reschedule Declined | Therapist declines | Client | "Reschedule request declined: [Title]" | N/A | ☐ |
| 29 | Client Session Reminder 24h | Scheduled | Client | "Reminder: [Title] tomorrow" | N/A | ☐ |
| 30 | Client Session Reminder 1h | Scheduled | Client | "Reminder: [Title] in 1 hour" | N/A | ☐ |

### 5.2 Email Content Verification Guide

For each email tested, verify:

1. **Delivery**
   - [ ] Email arrives in inbox (not spam)
   - [ ] Arrives within reasonable time (< 2 minutes)

2. **Sender**
   - [ ] From: noreply@findhypnotherapy.com (or configured sender)
   - [ ] Reply-to set appropriately (if applicable)

3. **Subject**
   - [ ] Matches expected pattern
   - [ ] Contains correct names/dates
   - [ ] Not truncated

4. **Content**
   - [ ] Greeting includes correct name
   - [ ] Body text is accurate
   - [ ] Dates/times formatted correctly
   - [ ] No placeholder text visible
   - [ ] No broken HTML

5. **Links**
   - [ ] All links work (not 404)
   - [ ] Links go to correct destination
   - [ ] Links open in appropriate context
   - [ ] Expiring links work before expiry
   - [ ] Expiring links show error after expiry

6. **Styling**
   - [ ] Email renders correctly in major clients (Gmail, Outlook)
   - [ ] Mobile responsive
   - [ ] Logo displays
   - [ ] Colours match brand

7. **Attachments (if applicable)**
   - [ ] ICS file attaches correctly
   - [ ] ICS opens in calendar application
   - [ ] Event details correct in ICS

---

## Document Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | February 2026 | [Tester] | Initial document creation |
| 1.1 | February 2026 | Claude | Accuracy corrections: moved Terms & Conditions from Visibility to Settings tab, updated bio validation (no minimum), added Social Sharing Image and SEO test cases, added Zoom to sync options, corrected error messages |
| 1.2 | February 2026 | Claude | Additional accuracy fixes: corrected dashboard stat card navigation links, fixed client onboarding step order, added missing portal sections (Messages, Therapists) |
| 1.3 | February 2026 | Claude | Final verification pass: removed Session Format from Services fields (profile-level setting), corrected Portal stat card labels, fixed success message text for Portal login and Contact form |
| 1.4 | February 2026 | Claude | Spot test verification: removed Onboarding status (code uses Invited), clarified Zoom as "Coming Soon", added note about 24 email template functions covering 30 email types |
| 1.5 | February 2026 | Claude | Round 2 spot tests: added Service Type field (Single Session, Package, Programme, Consultation, Subscription) to Services section |
| 1.6 | February 2026 | Claude | Round 3 spot tests: corrected video file size limit (50MB not 100MB), added supported formats (MP4/WebM/MOV), documented Booking Settings dropdown options |
| 1.7 | February 2026 | Claude | Round 4 spot tests: added field validations (address max lengths, availability notes 1000 chars, service description optional + 500 chars, video title 100 chars, video duration 3-90 seconds) |

---

## Notes

_Use this section to record any issues, questions, or observations during testing._

---

## END OF DOCUMENT
