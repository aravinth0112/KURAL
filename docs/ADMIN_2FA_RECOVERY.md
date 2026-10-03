# Admin 2FA Recovery Documentation (Private / Internal)

> **CONFIDENTIAL**: For project administrators and owners only. Do not commit or expose this file to any public website endpoint.

---

## Overview
The LPU Tamizhans admin portal (`/adminnadhan`) enforces Two-Factor Authentication (TOTP 2FA) via Supabase Auth MFA.

If an administrator loses access to their authenticator device or phone, they cannot log in via the regular UI until their registered MFA factor is reset in the backend database.

---

## Recovery Procedure (Supabase Dashboard)

1. Log into your project's **Supabase Dashboard** at:
   `https://supabase.com/dashboard/project/padxsbxfnhtdlbmpjlst`

2. In the left navigation, click **SQL Editor**.

3. Click **New Query** and execute the recovery command:

   ### Option A: Reset 2FA for all Administrators
   ```sql
   DELETE FROM auth.mfa_factors
   WHERE user_id IN (SELECT user_id FROM public.admins);
   ```

   ### Option B: Reset 2FA for a Specific Administrator by Email
   ```sql
   DELETE FROM auth.mfa_factors
   WHERE user_id IN (
     SELECT id FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL@domain.com'
   );
   ```

4. Once the query completes successfully:
   - Go to `https://lputamizhans.com/adminnadhan` (or `http://localhost:3000/adminnadhan`).
   - Enter your email, password, and math captcha.
   - Because the factor has been deleted, the system automatically detects that no verified factor exists and prompts for a **fresh 2FA enrollment**.
   - Scan the new QR code with your authenticator app (Google Authenticator, Microsoft Authenticator, 1Password, etc.) and enter the 6-digit code to re-enroll.

---

## Verification / Dry Run
To inspect active factors before deleting, you can run:
```sql
SELECT 
  f.id AS factor_id,
  f.user_id,
  u.email,
  f.factor_type,
  f.status,
  f.created_at
FROM auth.mfa_factors f
JOIN auth.users u ON u.id = f.user_id;
```
