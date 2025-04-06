CREATE INDEX IF NOT EXISTS idx_messages_contact_created_at
ON messages(contact_id, created_at DESC);

EXPLAIN ANALYZE
WITH latestMessage AS (
  SELECT
    m.contact_id,
    m.content,
    m.created_at,
    ROW_NUMBER() OVER (PARTITION BY m.contact_id ORDER BY m.created_at DESC) AS rn
  FROM messages m
)
SELECT
  lm.contact_id,
  lm.content,
  lm.created_at
FROM latestMessage lm
WHERE rn = 1
ORDER BY lm.created_at DESC
LIMIT 50;

-- optimised by:
-- 1. indicating columns under select statement instead of using select * 
-- 2. creating indexes for contact_id and created_at

-- results
-- initial time
-- "Planning Time: 0.136 ms"
-- "Execution Time: 104880.351 ms"

-- optimised time
-- "Planning Time: 1.806 ms"
-- "Execution Time: 98279.989 ms"

