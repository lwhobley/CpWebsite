CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM (
      'owner','gm','manager','captain','bartender','host','kitchen','dishwasher'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checklist_type') THEN
    CREATE TYPE checklist_type AS ENUM ('opening','closing','shift','cleaning','compliance');
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'America/Chicago',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role app_role NOT NULL,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  pin_hash TEXT,
  email TEXT UNIQUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type checklist_type NOT NULL,
  role app_role NOT NULL,
  recurrence TEXT NOT NULL,
  cutoff_time TIME NOT NULL,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  requires_photo BOOLEAN NOT NULL DEFAULT FALSE,
  requires_note BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS checklist_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  photo_url TEXT,
  note TEXT
);

CREATE TABLE IF NOT EXISTS permits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  issued_at DATE,
  expires_at DATE NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  doc_url TEXT,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  issued_at DATE,
  expires_at DATE NOT NULL,
  cert_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES audit_templates(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  ai_notes TEXT,
  pdf_url TEXT,
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT,
  phone TEXT,
  category TEXT,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inventory items catalog
CREATE TABLE inventory_items (
  item_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id         UUID REFERENCES locations(id) ON DELETE CASCADE,
  brand            VARCHAR(100) NOT NULL,
  spirit_type      VARCHAR(50) NOT NULL CHECK (spirit_type IN (
                     'whiskey','vodka','rum','gin','tequila',
                     'liqueur','beer','wine','other'
                   )),
  size             VARCHAR(20) NOT NULL,
  product_number   VARCHAR(50),
  par              INTEGER NOT NULL CHECK (par >= 0),
  expected_quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
  actual_quantity   DECIMAL(10,3) NOT NULL DEFAULT 0,
  variance          DECIMAL(10,3) GENERATED ALWAYS AS
                     (expected_quantity - actual_quantity) STORED,
  distributor      VARCHAR(100),
  cost_per_unit    DECIMAL(10,2),
  last_counted_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Daily count sessions
CREATE TABLE inventory_counts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id          UUID REFERENCES inventory_items(item_id) ON DELETE CASCADE,
  user_id          UUID REFERENCES users(id),
  counted_at       TIMESTAMPTZ DEFAULT NOW(),
  actual_qty       DECIMAL(10,3) NOT NULL,
  expected_qty     DECIMAL(10,3) NOT NULL,
  variance_reason  VARCHAR(50) CHECK (variance_reason IN (
                     'waste','comp','spillage','theft','over_pour','unknown'
                   )),
  notes            TEXT
);

-- Trigger: update inventory_items.actual_quantity + last_counted_at on new count
CREATE OR REPLACE FUNCTION sync_inventory_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory_items
  SET actual_quantity = NEW.actual_qty,
      last_counted_at = NEW.counted_at,
      updated_at = NOW()
  WHERE item_id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_inventory_count ON inventory_counts;
CREATE TRIGGER after_inventory_count
AFTER INSERT ON inventory_counts
FOR EACH ROW EXECUTE FUNCTION sync_inventory_count();

CREATE TABLE IF NOT EXISTS pos_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  pos_system VARCHAR(20) CHECK (pos_system IN ('toast','square')),
  covers INTEGER,
  check_avg DECIMAL(10,2),
  status VARCHAR(20) CHECK (status IN ('success','error','partial')),
  error_msg TEXT,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  location_id UUID REFERENCES locations(id),
  covers INTEGER DEFAULT 0,
  check_avg DECIMAL(10,2) DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  source VARCHAR(20) DEFAULT 'pos'
);

CREATE TABLE IF NOT EXISTS assistant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New session',
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assistant_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES assistant_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('system','user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_location ON users(location_id);
CREATE INDEX IF NOT EXISTS idx_checklists_location_role ON checklists(location_id, role);
CREATE INDEX IF NOT EXISTS idx_permits_location_expiry ON permits(location_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_certs_user_expiry ON certifications(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_inventory_items_venue_type ON inventory_items(venue_id, spirit_type);
CREATE INDEX IF NOT EXISTS idx_inventory_counts_item_time ON inventory_counts(item_id, counted_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_submissions_location_time ON audit_submissions(location_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_location_date ON daily_metrics(location_id, date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_daily_metrics_date_location ON daily_metrics(date, location_id);

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER trg_inventory_items_updated_at
BEFORE UPDATE ON inventory_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.current_app_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_app_role()
RETURNS app_role
LANGUAGE sql
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_location_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT location_id FROM public.users WHERE id = auth.uid();
$$;

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "location members can read locations" ON locations;
CREATE POLICY "location members can read locations" ON locations
FOR SELECT USING (id = public.current_location_id());

DROP POLICY IF EXISTS "users can view same location users" ON users;
CREATE POLICY "users can view same location users" ON users
FOR SELECT USING (
  location_id = public.current_location_id()
  AND (
    public.current_app_role() IN ('owner','gm','manager')
    OR id = auth.uid()
  )
);

DROP POLICY IF EXISTS "admins manage users" ON users;
CREATE POLICY "admins manage users" ON users
FOR ALL USING (public.current_app_role() IN ('owner','gm'))
WITH CHECK (public.current_app_role() IN ('owner','gm'));

DROP POLICY IF EXISTS "location checklist access" ON checklists;
CREATE POLICY "location checklist access" ON checklists
FOR SELECT USING (
  location_id = public.current_location_id()
  AND (
    public.current_app_role() IN ('owner','gm','manager')
    OR role = public.current_app_role()
  )
);

DROP POLICY IF EXISTS "manager checklist write" ON checklists;
CREATE POLICY "manager checklist write" ON checklists
FOR ALL USING (
  location_id = public.current_location_id()
  AND public.current_app_role() IN ('owner','gm','manager')
)
WITH CHECK (
  location_id = public.current_location_id()
  AND public.current_app_role() IN ('owner','gm','manager')
);

DROP POLICY IF EXISTS "location checklist items read" ON checklist_items;
CREATE POLICY "location checklist items read" ON checklist_items
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM checklists c
    WHERE c.id = checklist_items.checklist_id
      AND c.location_id = public.current_location_id()
      AND (
        public.current_app_role() IN ('owner','gm','manager')
        OR c.role = public.current_app_role()
      )
  )
);

DROP POLICY IF EXISTS "staff completion insert" ON checklist_completions;
CREATE POLICY "staff completion insert" ON checklist_completions
FOR INSERT WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM checklist_items ci
    JOIN checklists c ON c.id = ci.checklist_id
    WHERE ci.id = checklist_completions.item_id
      AND c.location_id = public.current_location_id()
      AND (
        public.current_app_role() IN ('owner','gm','manager')
        OR c.role = public.current_app_role()
      )
  )
);

DROP POLICY IF EXISTS "location completion read" ON checklist_completions;
CREATE POLICY "location completion read" ON checklist_completions
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM checklist_items ci
    JOIN checklists c ON c.id = ci.checklist_id
    WHERE ci.id = checklist_completions.item_id
      AND c.location_id = public.current_location_id()
  )
);

DROP POLICY IF EXISTS "location scoped permits" ON permits;
CREATE POLICY "location scoped permits" ON permits
FOR ALL USING (
  location_id = public.current_location_id()
  AND public.current_app_role() IN ('owner','gm','manager')
)
WITH CHECK (
  location_id = public.current_location_id()
  AND public.current_app_role() IN ('owner','gm','manager')
);

DROP POLICY IF EXISTS "certifications read same location" ON certifications;
CREATE POLICY "certifications read same location" ON certifications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = certifications.user_id
      AND u.location_id = public.current_location_id()
      AND (
        public.current_app_role() IN ('owner','gm','manager')
        OR u.id = auth.uid()
      )
  )
);

DROP POLICY IF EXISTS "managers manage certifications" ON certifications;
CREATE POLICY "managers manage certifications" ON certifications
FOR ALL USING (public.current_app_role() IN ('owner','gm','manager'))
WITH CHECK (public.current_app_role() IN ('owner','gm','manager'));

DROP POLICY IF EXISTS "location audit templates" ON audit_templates;
CREATE POLICY "location audit templates" ON audit_templates
FOR ALL USING (
  location_id = public.current_location_id()
  AND public.current_app_role() IN ('owner','gm','manager')
)
WITH CHECK (
  location_id = public.current_location_id()
  AND public.current_app_role() IN ('owner','gm','manager')
);

DROP POLICY IF EXISTS "location audits read" ON audit_submissions;
CREATE POLICY "location audits read" ON audit_submissions
FOR SELECT USING (
  location_id = public.current_location_id()
  AND public.current_app_role() IN ('owner','gm','manager')
);

DROP POLICY IF EXISTS "manager audit insert" ON audit_submissions;
CREATE POLICY "manager audit insert" ON audit_submissions
FOR INSERT WITH CHECK (
  location_id = public.current_location_id()
  AND submitted_by = auth.uid()
  AND public.current_app_role() IN ('owner','gm','manager')
);

DROP POLICY IF EXISTS "location vendors" ON vendors;
CREATE POLICY "location vendors" ON vendors
FOR ALL USING (
  location_id = public.current_location_id()
  AND public.current_app_role() IN ('owner','gm','manager')
)
WITH CHECK (
  location_id = public.current_location_id()
  AND public.current_app_role() IN ('owner','gm','manager')
);

DROP POLICY IF EXISTS "location inventory read" ON inventory_items;
CREATE POLICY "location inventory read" ON inventory_items
FOR SELECT USING (venue_id = public.current_location_id());

DROP POLICY IF EXISTS "location inventory manage" ON inventory_items;
CREATE POLICY "location inventory manage" ON inventory_items
FOR ALL USING (
  venue_id = public.current_location_id()
  AND public.current_app_role() IN ('owner','gm','manager','bartender','captain')
)
WITH CHECK (
  venue_id = public.current_location_id()
  AND public.current_app_role() IN ('owner','gm','manager','bartender','captain')
);

DROP POLICY IF EXISTS "location inventory counts" ON inventory_counts;
CREATE POLICY "location inventory counts" ON inventory_counts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM inventory_items ii
    WHERE ii.item_id = inventory_counts.item_id
      AND ii.venue_id = public.current_location_id()
  )
)
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM inventory_items ii
    WHERE ii.item_id = inventory_counts.item_id
      AND ii.venue_id = public.current_location_id()
  )
);

DROP POLICY IF EXISTS "location pos logs" ON pos_sync_log;
CREATE POLICY "location pos logs" ON pos_sync_log
FOR SELECT USING (
  location_id = public.current_location_id()
  AND public.current_app_role() IN ('owner','gm')
);

DROP POLICY IF EXISTS "location daily metrics" ON daily_metrics;
CREATE POLICY "location daily metrics" ON daily_metrics
FOR SELECT USING (location_id = public.current_location_id());

DROP POLICY IF EXISTS "assistant sessions same user" ON assistant_sessions;
CREATE POLICY "assistant sessions same user" ON assistant_sessions
FOR ALL USING (
  user_id = auth.uid()
  AND location_id = public.current_location_id()
)
WITH CHECK (
  user_id = auth.uid()
  AND location_id = public.current_location_id()
);

DROP POLICY IF EXISTS "assistant messages by session owner" ON assistant_messages;
CREATE POLICY "assistant messages by session owner" ON assistant_messages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM assistant_sessions s
    WHERE s.id = assistant_messages.session_id
      AND s.user_id = auth.uid()
      AND s.location_id = public.current_location_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM assistant_sessions s
    WHERE s.id = assistant_messages.session_id
      AND s.user_id = auth.uid()
      AND s.location_id = public.current_location_id()
  )
);

INSERT INTO locations (id, name, city, timezone, active)
VALUES (
  '7b8c104b-4f70-49aa-ae2f-e7f451e7f44b',
  'Enish Restaurant & Lounge Houston',
  'Houston',
  'America/Chicago',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, role, location_id, pin_hash, email, active)
VALUES (
  '6dbb40ef-df4f-4de9-9e2d-3ec72f2d089b',
  'Liffort Hobley',
  'owner',
  '7b8c104b-4f70-49aa-ae2f-e7f451e7f44b',
  '$2b$10$6pDc01DQlIvY8qLZbw8h3el8wpm1fi.E3Bu2d69ssdqxL4XDXnpQm',
  'liffort@enishhouston.com',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO vendors (name, contact, phone, category, location_id)
VALUES
  ('Southern Glazer''s', 'Houston Beverage Desk', '713-555-0184', 'liquor', '7b8c104b-4f70-49aa-ae2f-e7f451e7f44b'),
  ('Silver Eagle Distributors', 'Beer Program', '713-555-0142', 'beer', '7b8c104b-4f70-49aa-ae2f-e7f451e7f44b')
ON CONFLICT DO NOTHING;

INSERT INTO permits (name, type, issued_at, expires_at, owner_id, location_id)
VALUES
  ('Houston Food Dealer Permit', 'health', '2025-04-21', '2026-04-21', '6dbb40ef-df4f-4de9-9e2d-3ec72f2d089b', '7b8c104b-4f70-49aa-ae2f-e7f451e7f44b'),
  ('TABC Mixed Beverage Permit', 'tabc', '2025-06-01', '2026-05-30', '6dbb40ef-df4f-4de9-9e2d-3ec72f2d089b', '7b8c104b-4f70-49aa-ae2f-e7f451e7f44b'),
  ('Houston Fire Occupancy Inspection', 'fire', '2025-03-31', '2026-03-31', '6dbb40ef-df4f-4de9-9e2d-3ec72f2d089b', '7b8c104b-4f70-49aa-ae2f-e7f451e7f44b')
ON CONFLICT DO NOTHING;

INSERT INTO checklists (title, type, role, recurrence, cutoff_time, location_id)
VALUES
  ('Opening Host Stand', 'opening', 'host', 'daily', '10:15', '7b8c104b-4f70-49aa-ae2f-e7f451e7f44b'),
  ('Opening Bar', 'opening', 'bartender', 'daily', '10:30', '7b8c104b-4f70-49aa-ae2f-e7f451e7f44b'),
  ('Manager Walkthrough', 'opening', 'manager', 'daily', '11:00', '7b8c104b-4f70-49aa-ae2f-e7f451e7f44b'),
  ('Kitchen Line Check', 'opening', 'kitchen', 'daily', '10:45', '7b8c104b-4f70-49aa-ae2f-e7f451e7f44b')
ON CONFLICT DO NOTHING;

INSERT INTO audit_templates (title, category, items, location_id)
VALUES (
  'FOH Readiness',
  'front-of-house',
  '[
    {"label":"ADA route clear","weight":20},
    {"label":"Dining room polished","weight":20},
    {"label":"Handwash stocked","weight":20},
    {"label":"Music and permit signage posted","weight":20},
    {"label":"Host stand ready","weight":20}
  ]'::jsonb,
  '7b8c104b-4f70-49aa-ae2f-e7f451e7f44b'
)
ON CONFLICT DO NOTHING;

INSERT INTO inventory_items
  (venue_id, brand, spirit_type, size, product_number, par, expected_quantity, actual_quantity, distributor, cost_per_unit)
VALUES
  ('7b8c104b-4f70-49aa-ae2f-e7f451e7f44b', 'Tito''s Handmade Vodka', 'vodka', '1 L', 'TI-1L', 16, 8, 3, 'Southern Glazer''s', 24.00),
  ('7b8c104b-4f70-49aa-ae2f-e7f451e7f44b', 'Grey Goose', 'vodka', '750 ml', 'GG-750', 10, 5, 4, 'Southern Glazer''s', 31.00),
  ('7b8c104b-4f70-49aa-ae2f-e7f451e7f44b', 'Hennessy VS', 'other', '750 ml', 'HN-750', 12, 6, 7, 'Southern Glazer''s', 39.00),
  ('7b8c104b-4f70-49aa-ae2f-e7f451e7f44b', 'Don Julio Blanco', 'tequila', '750 ml', 'DJ-750', 10, 5, 2, 'Southern Glazer''s', 44.00),
  ('7b8c104b-4f70-49aa-ae2f-e7f451e7f44b', 'Jameson Irish Whiskey', 'whiskey', '1 L', 'JM-1L', 12, 6, 5, 'Southern Glazer''s', 29.00),
  ('7b8c104b-4f70-49aa-ae2f-e7f451e7f44b', 'Bombay Sapphire', 'gin', '1 L', 'BS-1L', 8, 4, 3, 'Southern Glazer''s', 28.00),
  ('7b8c104b-4f70-49aa-ae2f-e7f451e7f44b', 'Bacardi Superior', 'rum', '1 L', 'BC-1L', 10, 4, 4, 'Southern Glazer''s', 23.00),
  ('7b8c104b-4f70-49aa-ae2f-e7f451e7f44b', 'Patron Silver', 'tequila', '750 ml', 'PT-750', 8, 4, 2, 'Southern Glazer''s', 46.00),
  ('7b8c104b-4f70-49aa-ae2f-e7f451e7f44b', 'Baileys Irish Cream', 'liqueur', '750 ml', 'BY-750', 6, 3, 2, 'Southern Glazer''s', 25.00),
  ('7b8c104b-4f70-49aa-ae2f-e7f451e7f44b', 'Modelo Especial', 'beer', '12 oz', 'MD-12', 48, 24, 11, 'Silver Eagle Distributors', 1.75),
  ('7b8c104b-4f70-49aa-ae2f-e7f451e7f44b', 'Heineken', 'beer', '12 oz', 'HK-12', 36, 18, 12, 'Silver Eagle Distributors', 1.80),
  ('7b8c104b-4f70-49aa-ae2f-e7f451e7f44b', 'La Marca Prosecco', 'wine', '750 ml', 'LM-750', 12, 6, 4, 'Southern Glazer''s', 17.50)
ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('permits-docs', 'permits-docs', FALSE),
  ('cert-images', 'cert-images', FALSE),
  ('audit-photos', 'audit-photos', FALSE),
  ('inventory-scans', 'inventory-scans', FALSE),
  ('checklist-photos', 'checklist-photos', FALSE),
  ('audit-exports', 'audit-exports', FALSE)
ON CONFLICT (id) DO NOTHING;
