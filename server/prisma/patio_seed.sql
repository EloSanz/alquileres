-- ============================================================
-- Seed: Inquilinos del Patio Amadeo
-- Idempotente: seguro de correr múltiples veces (no duplica datos)
-- ============================================================

INSERT INTO patio_tenants (id, nombre, "nombreComercial", "razonSocial", apodo, "numerosLocales", "montoAlquiler", telefono, rubro, "estadoPago", "updatedAt")
VALUES
  (1,  'Angelica Huamani',       'Angelica Huamani',    NULL, 'Angicita',         '1 2 3 4',         400.00,  NULL, NULL, 'AL_DIA', NOW()),
  (2,  'Mary Pacaya Yuyarima',   'Mary Pacaya',         NULL, 'Mary',             '7',               250.00,  NULL, NULL, 'AL_DIA', NOW()),
  (3,  'Yery Dominguez',         'Yery Dominguez',      NULL, 'Iconica',          '9 10',            350.00,  NULL, NULL, 'AL_DIA', NOW()),
  (4,  'Eteldita Perez',         'Eteldita Perez',      NULL, 'Ettel',            '13',              200.00,  NULL, NULL, 'AL_DIA', NOW()),
  (5,  'Melissa Karin Chota',    'Melissa Karin',       NULL, 'Karen',            '14',              200.00,  NULL, NULL, 'AL_DIA', NOW()),
  (6,  'Emperatriz Vela',        'Emperatriz Vela',     NULL, 'Princess',         '15',              200.00,  NULL, NULL, 'AL_DIA', NOW()),
  (7,  'Yesenia Humani',         'Yesenia Humani',      NULL, 'Amira',            '16',              200.00,  NULL, NULL, 'AL_DIA', NOW()),
  (8,  'Regina Sacha',           'Regina Sacha',        NULL, 'Masajes',          '20',              300.00,  NULL, NULL, 'AL_DIA', NOW()),
  (9,  'Thais Mezza',            'Thais Mezza',         NULL, 'Thais',            '21',              200.00,  NULL, NULL, 'AL_DIA', NOW()),
  (10, 'Melisa Rivera',          'Melisa Rivera',       NULL, 'Melisa',           '22',              200.00,  NULL, NULL, 'AL_DIA', NOW()),
  (11, 'Victoria Albino Narvaez','Victoria Albino',    NULL, 'Todo por un 1',    '29 30 31 32 33',  600.00,  NULL, NULL, 'AL_DIA', NOW())
ON CONFLICT (id) DO UPDATE SET
  "nombreComercial" = EXCLUDED."nombreComercial",
  "montoAlquiler" = EXCLUDED."montoAlquiler",
  "numerosLocales" = EXCLUDED."numerosLocales";

-- Resetear la secuencia para que futuros inserts no colisionen
SELECT setval('patio_tenants_id_seq', GREATEST((SELECT MAX(id) FROM patio_tenants), 11));

SELECT id, nombre, apodo, "numerosLocales", "montoAlquiler" FROM patio_tenants ORDER BY id;
