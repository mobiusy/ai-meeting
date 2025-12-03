-- Add new enum value to MeetingStatus in Postgres
DO $$ BEGIN
  ALTER TYPE "MeetingStatus" ADD VALUE IF NOT EXISTS 'PENDING_APPROVAL';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
