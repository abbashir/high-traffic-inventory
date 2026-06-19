-- Enforce one PENDING reservation per user per drop at the DB level
CREATE UNIQUE INDEX one_pending_per_user_drop
ON "Reservation" ("userId", "dropId")
WHERE status = 'PENDING';
