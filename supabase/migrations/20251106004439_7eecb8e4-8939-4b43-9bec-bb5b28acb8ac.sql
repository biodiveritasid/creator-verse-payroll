-- Update shift enum to include new shift types
ALTER TYPE shift_type RENAME TO shift_type_old;

CREATE TYPE shift_type AS ENUM ('PAGI', 'SIANG', 'MALAM');

-- Update the sesi_live table to use the new enum
ALTER TABLE sesi_live 
  ALTER COLUMN shift DROP DEFAULT,
  ALTER COLUMN shift TYPE shift_type USING 
    CASE 
      WHEN shift::text = 'MORNING' THEN 'PAGI'::shift_type
      WHEN shift::text = 'AFTERNOON' THEN 'SIANG'::shift_type
      ELSE 'MALAM'::shift_type
    END,
  ALTER COLUMN shift SET DEFAULT 'PAGI'::shift_type;

DROP TYPE shift_type_old;