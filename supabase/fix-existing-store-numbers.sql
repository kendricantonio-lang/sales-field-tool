-- Run this ONLY if you already imported stores using an earlier version of
-- seed-stores.sql that had the full 6-digit store numbers (e.g. "771911").
-- This strips the internal 2-digit prefix from every existing store record,
-- turning "771911" into "1911", "762784" into "2784", etc.
--
-- If you have not run seed-stores.sql yet, ignore this file — the current
-- version already has the short numbers.

update stores
set data = jsonb_set(data, '{storeNumber}', to_jsonb(substring(data->>'storeNumber' from 3)))
where user_id = (select id from auth.users limit 1)
  and length(data->>'storeNumber') > 2;
