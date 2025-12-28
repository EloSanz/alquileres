-- Seed data for alquileres-app
-- Updated to match the exact planilla data with correct payment months and amounts
-- All contracts start on 2025-01-01 and end on 2025-12-31
-- ALL payments (months 1-12) are marked as PAGADO
-- All payments are due on day 4 of each month (límite de pago)

-- Insert tenants (24 unique tenants - ROGER VASQUEZ has locals 9 and 10)
INSERT INTO "tenants" ("firstName", "lastName", "phone", "documentId", "numeroLocal", "rubro", "fechaInicioContrato", "estadoPago", "createdAt", "updatedAt") VALUES
('SEGUNDO', 'ALARCON', '989876543', '10000001', '1', 'TIPEO', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('JIM', 'LENIN', '988765432', '10000002', '2', 'PEDICURE', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('MARY', 'VARGAS', '987654321', '10000003', '3', 'TIPEO', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('ERIKA', 'ROJAS', '986543210', '10000004', '4', 'PEDICURE', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('MEDALIT', 'HUAYTA', '985432109', '10000005', '5', 'TIPEO', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('DIANA', 'ROJAS', '984321098', '10000006', '6', 'PEDICURE', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('NELTON', 'NINAHUAMAN', '983210987', '10000007', '7', 'TIPEO', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('MENDEZ', 'MAYTA', '982109876', '10000008', '8', 'PEDICURE', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('ROGER', 'VASQUEZ', '981098765', '10000009', '9', 'TIPEO', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('LIDIA', 'HUANIO', '980987654', '10000011', '11', 'PEDICURE', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('BETSY', 'SOTO', '979876543', '10000012', '12', 'TIPEO', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('KATY', 'EX SRA SUSY', '978765432', '10000013', '13', 'PEDICURE', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('Fatima', 'Angeles', '977654321', '10000014', '14', 'TIPEO', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('Maria', 'Mercy', '976543210', '10000015', '15', 'PEDICURE', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('Katty', 'apolinario', '975432109', '10000016', '16', 'TIPEO', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('MICHELL', 'REVILLA', '974321098', '10000017', '17', 'PEDICURE', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('Nagaid', 'Huaman', '973210987', '10000018', '18', 'TIPEO', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('Maria', 'Salazar', '972109876', '10000019', '19', 'PEDICURE', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('Gianina', 'Salazar', '971098765', '10000020', '20', 'TIPEO', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('Florencia', 'Catalan', '970987654', '10000021', '21', 'PEDICURE', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('JUAN', 'PARIONA', '969876543', '10000022', '22', 'TIPEO', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('Elizabeth', 'Reginaldo', '968765432', '10000023', '23', 'PEDICURE', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('Fiorella', 'Salazar', '967654321', '10000024', '24', 'TIPEO', '2025-01-01', 'AL_DIA', NOW(), NOW()),
('LIDIA', 'SALAZAR', '966543210', '10000025', '25', 'PEDICURE', '2025-01-01', 'AL_DIA', NOW(), NOW())
ON CONFLICT ("documentId") DO UPDATE SET
  "firstName" = EXCLUDED."firstName",
  "lastName" = EXCLUDED."lastName",
  "numeroLocal" = EXCLUDED."numeroLocal",
  "fechaInicioContrato" = EXCLUDED."fechaInicioContrato";

<<<<<<< HEAD
-- Insert properties (25 properties from planilla)
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") VALUES
-- Locales individuales
(1, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001' LIMIT 1), NOW(), NOW()),
(2, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000002' LIMIT 1), NOW(), NOW()),
(3, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000003' LIMIT 1), NOW(), NOW()),
(4, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000004' LIMIT 1), NOW(), NOW()),
(5, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000005' LIMIT 1), NOW(), NOW()),
(6, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000006' LIMIT 1), NOW(), NOW()),
(7, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000007' LIMIT 1), NOW(), NOW()),
(8, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000008' LIMIT 1), NOW(), NOW()),
-- ROGER VASQUEZ: locales 9 y 10
(9, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009' LIMIT 1), NOW(), NOW()),
(10, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009' LIMIT 1), NOW(), NOW()),
(11, 'BOULEVAR', 900.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000011' LIMIT 1), NOW(), NOW()),
(12, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000012' LIMIT 1), NOW(), NOW()),
(13, 'BOULEVAR', 1100.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000013' LIMIT 1), NOW(), NOW()),
-- ROGER VASQUEZ: locales 14, 15 y 16
(14, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009' LIMIT 1), NOW(), NOW()),
(15, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009' LIMIT 1), NOW(), NOW()),
(16, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009' LIMIT 1), NOW(), NOW()),
-- MICHELL REVILLA: locales 17 y 18
(17, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000017' LIMIT 1), NOW(), NOW()),
(18, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000017' LIMIT 1), NOW(), NOW()),
-- SEGUNDO ALARCON: locales 19 y 20
(19, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001' LIMIT 1), NOW(), NOW()),
(20, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001' LIMIT 1), NOW(), NOW()),
(21, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000021' LIMIT 1), NOW(), NOW()),
-- JUAN PARIONA: locales 22 y 23
(22, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000022' LIMIT 1), NOW(), NOW()),
(23, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000022' LIMIT 1), NOW(), NOW()),
-- SEGUNDO ALARCON: locales 24 y 25
(24, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001' LIMIT 1), NOW(), NOW()),
(25, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001' LIMIT 1), NOW(), NOW());

-- Insert contracts based on payment months from planilla
INSERT INTO "contracts" ("tenantId", "propertyId", "tenantFullName", "startDate", "endDate", "monthlyRent", "status", "createdAt", "updatedAt") VALUES
-- Single properties paying SETIEMBRE (locales 1-6, 11-13, 21)
((SELECT id FROM "tenants" WHERE "documentId" = '10000001' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 1 LIMIT 1), 'SEGUNDO ALARCON', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000002' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 2 LIMIT 1), 'JIM GAMARRA', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000003' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 3 LIMIT 1), 'MARY VARGAS', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000004' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 4 LIMIT 1), 'ERICKA ROJAS', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000005' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 5 LIMIT 1), 'MEDALIT HUAYTA', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000006' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 6 LIMIT 1), 'DIANA ROJAS', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000011' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 11 LIMIT 1), 'DENIS REBATA', '2023-09-01', '2024-08-31', 900.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000012' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 12 LIMIT 1), 'BETSY SOTO', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000013' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 13 LIMIT 1), 'ULISES FLORES', '2023-09-01', '2024-08-31', 1100.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000021' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 21 LIMIT 1), 'K MODA', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),

-- Multi-property tenants paying SETIEMBRE
-- ROGER VASQUEZ: locales 9 y 10 (pago consolidado 1,600.00)
((SELECT id FROM "tenants" WHERE "documentId" = '10000009' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 9 LIMIT 1), 'ROGER VASQUEZ', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000009' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 10 LIMIT 1), 'ROGER VASQUEZ', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
-- ROGER VASQUEZ: locales 14, 15 y 16 (pago consolidado 2,400.00)
((SELECT id FROM "tenants" WHERE "documentId" = '10000009' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 14 LIMIT 1), 'ROGER VASQUEZ', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000009' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 15 LIMIT 1), 'ROGER VASQUEZ', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000009' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 16 LIMIT 1), 'ROGER VASQUEZ', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
-- MICHELL REVILLA: locales 17 y 18 (pago consolidado 1,600.00)
((SELECT id FROM "tenants" WHERE "documentId" = '10000017' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 17 LIMIT 1), 'MICHELL REVILLA', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000017' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 18 LIMIT 1), 'MICHELL REVILLA', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
-- SEGUNDO ALARCON: locales 19 y 20 (pago consolidado 1,600.00)
((SELECT id FROM "tenants" WHERE "documentId" = '10000001' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 19 LIMIT 1), 'SEGUNDO ALARCON', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000001' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 20 LIMIT 1), 'SEGUNDO ALARCON', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
-- JUAN PARIONA: locales 22 y 23 (pago consolidado 1,600.00)
((SELECT id FROM "tenants" WHERE "documentId" = '10000022' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 22 LIMIT 1), 'JUAN PARIONA', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000022' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 23 LIMIT 1), 'JUAN PARIONA', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
-- SEGUNDO ALARCON: locales 24 y 25 (pago consolidado 1,600.00)
((SELECT id FROM "tenants" WHERE "documentId" = '10000001' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 24 LIMIT 1), 'SEGUNDO ALARCON', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000001' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 25 LIMIT 1), 'SEGUNDO ALARCON', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),

-- Special cases: different payment months
-- MENDEZ MAYTA: local 8 - ABRIL
((SELECT id FROM "tenants" WHERE "documentId" = '10000008' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 8 LIMIT 1), 'MENDEZ MAYTA', '2023-04-01', '2024-03-31', 800.00, 'ACTIVE', NOW(), NOW()),
-- NELTON NINAHUAMAN: local 7 - AGOSTO y SETIEMBRE
((SELECT id FROM "tenants" WHERE "documentId" = '10000007' LIMIT 1), (SELECT id FROM "properties" WHERE "localNumber" = 7 LIMIT 1), 'NELTON NINAHUAMAN', '2023-08-01', '2024-07-31', 800.00, 'ACTIVE', NOW(), NOW());
=======
-- Update properties with correct monthly rent amounts
-- Montos según planilla NOVIEMBRE 2025: mayoría = S/ 1,600.00; local 8 = S/ 3,200.00; local 13 = S/ 2,000.00; local 17 = S/ 1,500.00; local 22 = S/ 5,600.00
UPDATE "properties" SET 
  "monthlyRent" = CASE 
    WHEN "localNumber" = 1 THEN 1600.00
    WHEN "localNumber" = 2 THEN 1600.00
    WHEN "localNumber" = 3 THEN 1600.00
    WHEN "localNumber" = 4 THEN 1600.00
    WHEN "localNumber" = 5 THEN 1600.00
    WHEN "localNumber" = 6 THEN 1600.00
    WHEN "localNumber" = 7 THEN 1600.00
    WHEN "localNumber" = 8 THEN 3200.00
    WHEN "localNumber" = 9 THEN 1600.00
    WHEN "localNumber" = 10 THEN 1600.00
    WHEN "localNumber" = 11 THEN 1600.00
    WHEN "localNumber" = 12 THEN 1600.00
    WHEN "localNumber" = 13 THEN 2000.00
    WHEN "localNumber" = 14 THEN 1600.00
    WHEN "localNumber" = 15 THEN 1600.00
    WHEN "localNumber" = 16 THEN 1600.00
    WHEN "localNumber" = 17 THEN 1500.00
    WHEN "localNumber" = 18 THEN 1600.00
    WHEN "localNumber" = 19 THEN 1600.00
    WHEN "localNumber" = 20 THEN 1600.00
    WHEN "localNumber" = 21 THEN 1600.00
    WHEN "localNumber" = 22 THEN 5600.00
    WHEN "localNumber" = 23 THEN 1600.00
    WHEN "localNumber" = 24 THEN 1600.00
    WHEN "localNumber" = 25 THEN 1600.00
    ELSE 1600.00
  END,
  "tenantId" = CASE 
    WHEN "localNumber" = 1 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000001')
    WHEN "localNumber" = 2 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000002')
    WHEN "localNumber" = 3 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000003')
    WHEN "localNumber" = 4 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000004')
    WHEN "localNumber" = 5 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000005')
    WHEN "localNumber" = 6 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000006')
    WHEN "localNumber" = 7 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000007')
    WHEN "localNumber" = 8 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000008')
    WHEN "localNumber" = 9 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000009')
    WHEN "localNumber" = 10 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000009')
    WHEN "localNumber" = 11 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000011')
    WHEN "localNumber" = 12 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000012')
    WHEN "localNumber" = 13 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000013')
    WHEN "localNumber" = 14 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000014')
    WHEN "localNumber" = 15 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000015')
    WHEN "localNumber" = 16 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000016')
    WHEN "localNumber" = 17 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000017')
    WHEN "localNumber" = 18 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000018')
    WHEN "localNumber" = 19 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000019')
    WHEN "localNumber" = 20 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000020')
    WHEN "localNumber" = 21 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000021')
    WHEN "localNumber" = 22 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000022')
    WHEN "localNumber" = 23 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000023')
    WHEN "localNumber" = 24 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000024')
    WHEN "localNumber" = 25 THEN (SELECT id FROM "tenants" WHERE "documentId" = '10000025')
  END
WHERE "localNumber" BETWEEN 1 AND 25;

-- Insert properties if they don't exist (simplified approach)
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 1, 'BOULEVAR'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 1);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 2, 'SAN_MARTIN'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000002'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 2);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 3, 'BOULEVAR'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000003'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 3);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 4, 'SAN_MARTIN'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000004'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 4);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 5, 'BOULEVAR'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000005'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 5);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 6, 'SAN_MARTIN'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000006'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 6);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 7, 'BOULEVAR'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000007'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 7);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 8, 'SAN_MARTIN'::"UbicacionType", 3200.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000008'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 8);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 9, 'BOULEVAR'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 9);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 10, 'SAN_MARTIN'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 10);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 11, 'BOULEVAR'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000011'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 11);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 12, 'SAN_MARTIN'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000012'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 12);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 13, 'BOULEVAR'::"UbicacionType", 2000.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000013'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 13);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 14, 'SAN_MARTIN'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000014'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 14);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 15, 'BOULEVAR'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000015'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 15);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 16, 'SAN_MARTIN'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000016'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 16);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 17, 'BOULEVAR'::"UbicacionType", 1500.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000017'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 17);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 18, 'SAN_MARTIN'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000018'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 18);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 19, 'BOULEVAR'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000019'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 19);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 20, 'SAN_MARTIN'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000020'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 20);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 21, 'BOULEVAR'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000021'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 21);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 22, 'SAN_MARTIN'::"UbicacionType", 5600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000022'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 22);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 23, 'BOULEVAR'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000023'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 23);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 24, 'SAN_MARTIN'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000024'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 24);
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") 
SELECT 25, 'BOULEVAR'::"UbicacionType", 1600.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000025'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "properties" WHERE "localNumber" = 25);

-- Update existing contracts to start on 2025-01-01 and end on 2025-12-31
UPDATE "contracts" c
SET 
  "startDate" = '2025-01-01'::date,
  "endDate" = '2025-12-31'::date,
  "updatedAt" = NOW()
WHERE c."propertyId" IS NOT NULL;

-- Insert contracts - one contract per property
-- All contracts start on 2025-01-01 and end on 2025-12-31
INSERT INTO "contracts" ("tenantId", "propertyId", "tenantFullName", "startDate", "endDate", "monthlyRent", "status", "createdAt", "updatedAt") 
SELECT 
  p."tenantId",
  p.id as "propertyId",
  t."firstName" || ' ' || t."lastName" as "tenantFullName",
  '2025-01-01'::date as "startDate",
  '2025-12-31'::date as "endDate",
  p."monthlyRent",
  'ACTIVE'::"ContractStatus" as "status",
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM "properties" p
LEFT JOIN "tenants" t ON p."tenantId" = t.id
WHERE p."tenantId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "contracts" c2 
    WHERE c2."propertyId" = p.id
  );

-- Helper function to calculate payment dates for a given month
-- Returns payment_date (day 2) and due_date (day 4) for the specified month
CREATE OR REPLACE FUNCTION get_payment_dates(month_number INT, base_year INT DEFAULT 2025)
RETURNS TABLE(payment_date DATE, due_date DATE) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (DATE_TRUNC('month', (base_year || '-01-01')::date) + (month_number - 1 || ' months')::interval + INTERVAL '1 day')::date as payment_date,
    (DATE_TRUNC('month', (base_year || '-01-01')::date) + (month_number - 1 || ' months')::interval + INTERVAL '3 days')::date as due_date;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
>>>>>>> 02a1dead0529ed532df95afc955e6cb787759164

-- Create 12 payments for each contract
-- Payments correspond to months 1-12 (January to December 2025)
-- All payments are due on day 4 of each month (límite de pago)
-- Payment date is set to day 2 of each month (2 days before due date)
DO $$
DECLARE
  contract_rec RECORD;
  month_num INT;
  payment_dates RECORD;
BEGIN
  FOR contract_rec IN 
    SELECT 
      c.id, 
      c."tenantId", 
      c."propertyId", 
      c."monthlyRent", 
      c."tenantFullName", 
      t.phone as tenant_phone
    FROM "contracts" c
    LEFT JOIN "tenants" t ON c."tenantId" = t.id
    WHERE c."status" = 'ACTIVE'
  LOOP
    FOR month_num IN 1..12 LOOP
      -- Get payment dates using helper function
      SELECT * INTO payment_dates FROM get_payment_dates(month_num);
      
      -- Insert payment
      INSERT INTO "payments" (
        "tenantId", 
        "propertyId", 
        "contractId", 
        "monthNumber",
        "tenantFullName", 
        "tenantPhone", 
        "amount",
        "paymentDate", 
        "dueDate", 
        "paymentMethod", 
        "status",
        "pentamontSettled", 
        "createdAt", 
        "updatedAt"
      ) VALUES (
        contract_rec."tenantId",
        contract_rec."propertyId",
        contract_rec.id,
        month_num,
        contract_rec."tenantFullName",
        contract_rec.tenant_phone,
        contract_rec."monthlyRent",
        payment_dates.payment_date,
        payment_dates.due_date,
        'YAPE',
        'PAGADO'::"PaymentStatus",
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT ("contractId", "monthNumber") DO UPDATE SET
        "amount" = EXCLUDED."amount",
        "paymentDate" = EXCLUDED."paymentDate",
        "dueDate" = EXCLUDED."dueDate",
        "status" = EXCLUDED."status",
        "pentamontSettled" = EXCLUDED."pentamontSettled",
        "updatedAt" = NOW();
    END LOOP;
  END LOOP;
END $$;
