DO $$ BEGIN
  CREATE TYPE "ApprovalAction" AS ENUM ('APPROVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "meeting_approvals" (
  "id" TEXT PRIMARY KEY,
  "action" "ApprovalAction" NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "meetingId" TEXT NOT NULL,
  "approverId" TEXT NOT NULL,
  CONSTRAINT "meeting_approvals_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "meeting_approvals_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
