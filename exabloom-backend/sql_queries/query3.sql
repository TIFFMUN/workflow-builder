CREATE INDEX IF NOT EXISTS idx_messages_contact_id
  ON messages(contact_id);

EXPLAIN ANALYZE
SELECT 
  m.id AS message_id, 
  m.contact_id, 
  m.content,
  m.created_at AS message_created_at,
  c.name AS contact_name, 
  c.phone_number AS contact_phone
FROM messages m
JOIN contacts c ON m.contact_id = c.id
WHERE 
  (m.content ILIKE 'Yea and HE is not even mentioned in it%' OR 
   c.name ILIKE 'Yea and HE is not even mentioned in it%' OR 
   c.phone_number ILIKE 'Yea and HE is not even mentioned in it%')
ORDER BY m.created_at DESC


-- optimised by:
-- 1. indicating columns under select statement instead of using select * 
-- 2. creating an index on the contact_id column of the messages table

-- initial time:
-- "Planning Time: 1.606 ms"
-- "Execution Time: 18152.211 ms"

-- optimised time: 
-- "Planning Time: 1.067 ms"
-- "Execution Time: 18059.236 ms"