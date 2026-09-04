-- One-time bulk import of store records transcribed from your delivery-days
-- spreadsheet screenshot. Run this once in the Supabase SQL Editor, after
-- schema.sql has been applied (the `stores` table must already exist).
--
-- Assumes there is exactly one Supabase auth user in this project (you).
-- If that's not the case, replace the subquery below with the specific
-- user's id from Authentication > Users in the Supabase dashboard.
--
-- Note: row 17 ("Rolling Hills Esta") looked truncated in the screenshot —
-- likely "Rolling Hills Estates". Fix it in the app afterward if so; every
-- field here is editable from the Stores tab like any other record.
--
-- Store numbers have the internal 2-digit prefix stripped (e.g. 771911 -> 1911).
-- If you already ran an earlier version of this file with the full 6-digit
-- numbers, use fix-existing-store-numbers.sql instead of re-running this one.

insert into stores (user_id, data) values
  ((select id from auth.users limit 1), '{"storeNumber": "1911", "address": "21181 Newport Coast Drive", "city": "Newport Beach", "deliveryDays": "Mon, Wed, Fri", "deliOps": "Toni"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "1912", "address": "2660 San Miguel Drive", "city": "Newport Beach", "deliveryDays": "Tue, Thurs", "deliOps": "Toni"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2089", "address": "600 N. Pacific Coast Highway", "city": "Laguna Beach", "deliveryDays": "Tue, Fri", "deliOps": "Toni"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2101", "address": "1040 Coast Village Rd", "city": "Montecito", "deliveryDays": "Tue, Thurs", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2105", "address": "4365 Glencoe Ave", "city": "Marina Del Rey", "deliveryDays": "Tue, Fri", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2110", "address": "715 Pier Ave", "city": "Hermosa Beach", "deliveryDays": "Tue, Fri", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2119", "address": "3850 Valley Centre Dr", "city": "San Diego", "deliveryDays": "Tue, Fri", "deliOps": "Toni"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2210", "address": "26022 Marguerite Parkway", "city": "Mission Viejo", "deliveryDays": "Tue, Fri", "deliOps": "Toni"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2212", "address": "11030 Jefferson Blvd", "city": "Culver City", "deliveryDays": "Wed, Fri", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2214", "address": "1110 W. Alameda Ave.", "city": "Burbank", "deliveryDays": "Mon, Wed, Fri", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2215", "address": "1135 Lindero Canyon Rd", "city": "Thousand Oaks", "deliveryDays": "Tue, Fri", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2217", "address": "22451 Antonio Parkway", "city": "Rancho Santa Margarita", "deliveryDays": "Tue, Fri", "deliOps": "Toni"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2225", "address": "6534 Platt Ave", "city": "West Hills", "deliveryDays": "Tue, Fri", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2228", "address": "1213 South Fair Oaks", "city": "South Pasadena", "deliveryDays": "Wed, Fri", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2229", "address": "727 N. Vine Street", "city": "Los Angeles", "deliveryDays": "Mon, Wed, Fri", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2231", "address": "820 Montana Avenue", "city": "Santa Monica", "deliveryDays": "Tue, Fri", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2233", "address": "7 Peninsula Center", "city": "Rolling Hills Estates", "deliveryDays": "Tue, Fri", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2235", "address": "1000 Bayside Drive", "city": "Newport Beach", "deliveryDays": "Wed", "deliOps": "Toni"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2323", "address": "7544 Girard Ave", "city": "La Jolla", "deliveryDays": "Mon, Wed, Fri", "deliOps": "Toni"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2412", "address": "3901 Portola Parkway", "city": "Irvine", "deliveryDays": "Tue, Fri", "deliOps": "Toni"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2508", "address": "27320 Alicia Parkway", "city": "Laguna Niguel", "deliveryDays": "Tue, Fri", "deliOps": "Toni"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2724", "address": "3439 Via Montebello", "city": "Carlsbad", "deliveryDays": "Wed, Fri", "deliOps": "Toni"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2739", "address": "8969 Santa Monica Blvd", "city": "West Hollywood", "deliveryDays": "Mon, Wed, Fri", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2784", "address": "515 W Washington St", "city": "San Diego", "deliveryDays": "Tue, Fri", "deliOps": "Toni"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2803", "address": "1101 Pacific Coast Highway", "city": "Seal Beach", "deliveryDays": "Tue, Thurs", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2813", "address": "29211 Heathercliff Rd", "city": "Malibu", "deliveryDays": "Wed, Fri", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "2989", "address": "14845 Ventura Blvd", "city": "Sherman Oaks", "deliveryDays": "Tue, Fri", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "3005", "address": "3100 W Balboa Blvd", "city": "Newport Beach", "deliveryDays": "Wed, Fri", "deliOps": "Toni"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "3237", "address": "9467 W. Olympic Blvd", "city": "Beverly Hills", "deliveryDays": "Thurs", "deliOps": "Winnie"}'),
  ((select id from auth.users limit 1), '{"storeNumber": "4563", "address": "989 Avenida Pico", "city": "San Clemente", "deliveryDays": "Mon, Thurs", "deliOps": "Toni"}');
