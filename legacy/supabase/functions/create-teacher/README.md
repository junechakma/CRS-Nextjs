# Create Teacher Edge Function

This Supabase Edge Function handles teacher creation with Supabase Auth integration and email confirmation.

## Features

- Creates teacher accounts using Supabase Auth
- Sends email confirmation links to new teachers
- Validates university admin permissions
- Ensures data integrity across auth and database
- Handles rollback if database insertion fails

## Local Development

### Deploy the function locally:

```bash
npx supabase functions serve create-teacher
```

### Test the function:

```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-teacher' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"John Doe","email":"john@example.com","initial":"JD","phone":"1234567890","department_id":"uuid-here","temp_password":"password123"}'
```

## Production Deployment

### Deploy to production:

```bash
npx supabase functions deploy create-teacher
```

### Set environment variables in Supabase Dashboard:
- Navigate to Project Settings > Functions
- Add the following secrets:
  - `SUPABASE_URL` (automatically available)
  - `SUPABASE_SERVICE_ROLE_KEY` (automatically available)
  - `SUPABASE_ANON_KEY` (automatically available)

## Email Configuration

For local development, emails are captured by Inbucket:
- View emails at: http://127.0.0.1:54324

For production:
- Configure SMTP settings in Supabase Dashboard > Authentication > Email Templates
- Or use Supabase's built-in email service

## Security

- Uses `SECURITY DEFINER` database function to bypass RLS
- Validates university admin role before creating teachers
- Requires authenticated session
- Service role key is only used server-side
- Rolls back auth user creation if database insertion fails
