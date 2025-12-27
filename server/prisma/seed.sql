-- Seed data for alquileres-app
-- Updated to match the exact planilla data with correct payment months and amounts

-- Insert admin user (actualizar contraseña si ya existe)
INSERT INTO "users" (username, email, password, "createdAt", "updatedAt") VALUES
('admin', 'admin@alquileres.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW())
ON CONFLICT (username) DO UPDATE SET 
  password = EXCLUDED.password,
  "updatedAt" = NOW();

-- Insert tenants (15 unique tenants)
INSERT INTO "tenants" ("firstName", "lastName", "phone", "documentId", "numeroLocal", "rubro", "fechaInicioContrato", "estadoPago", "createdAt", "updatedAt") VALUES
('SEGUNDO', 'ALARCON', '989876543', '10000001', '1', 'TIPEO', '2023-09-01', 'AL_DIA', NOW(), NOW()),
('JIM', 'GAMARRA', '988765432', '10000002', '2', 'PEDICURE', '2023-09-01', 'AL_DIA', NOW(), NOW()),
('MARY', 'VARGAS', '987654321', '10000003', '3', 'TIPEO', '2023-09-01', 'AL_DIA', NOW(), NOW()),
('ERICKA', 'ROJAS', '986543210', '10000004', '4', 'PEDICURE', '2023-09-01', 'AL_DIA', NOW(), NOW()),
('MEDALIT', 'HUAYTA', '985432109', '10000005', '5', 'TIPEO', '2023-09-01', 'AL_DIA', NOW(), NOW()),
('DIANA', 'ROJAS', '984321098', '10000006', '6', 'PEDICURE', '2023-09-01', 'AL_DIA', NOW(), NOW()),
('NELTON', 'NINAHUAMAN', '983210987', '10000007', '7', 'TIPEO', '2023-08-01', 'AL_DIA', NOW(), NOW()),
('MENDEZ', 'MAYTA', '982109876', '10000008', '8', 'PEDICURE', '2023-04-01', 'AL_DIA', NOW(), NOW()),
('ROGER', 'VASQUEZ', '981098765', '10000009', '9', 'TIPEO', '2023-09-01', 'AL_DIA', NOW(), NOW()),
('DENIS', 'REBATA', '980987654', '10000011', '11', 'PEDICURE', '2023-09-01', 'AL_DIA', NOW(), NOW()),
('BETSY', 'SOTO', '979876543', '10000012', '12', 'TIPEO', '2023-09-01', 'AL_DIA', NOW(), NOW()),
('ULISES', 'FLORES', '978765432', '10000013', '13', 'PEDICURE', '2023-09-01', 'AL_DIA', NOW(), NOW()),
('MICHELL', 'REVILLA', '977654321', '10000017', '17', 'TIPEO', '2023-09-01', 'AL_DIA', NOW(), NOW()),
('K', 'MODA', '976543210', '10000021', '21', 'PEDICURE', '2023-09-01', 'AL_DIA', NOW(), NOW()),
('JUAN', 'PARIONA', '975432109', '10000022', '22', 'TIPEO', '2023-09-01', 'AL_DIA', NOW(), NOW());

-- Insert properties (25 properties from planilla)
INSERT INTO "properties" ("localNumber", "ubicacion", "propertyType", "monthlyRent", "tenantId", "createdAt", "updatedAt") VALUES
-- Locales individuales
(1, 'BOULEVARD', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001'), NOW(), NOW()),
(2, 'SAN_MARTIN', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000002'), NOW(), NOW()),
(3, 'BOULEVARD', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000003'), NOW(), NOW()),
(4, 'SAN_MARTIN', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000004'), NOW(), NOW()),
(5, 'BOULEVARD', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000005'), NOW(), NOW()),
(6, 'SAN_MARTIN', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000006'), NOW(), NOW()),
(7, 'BOULEVARD', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000007'), NOW(), NOW()),
(8, 'SAN_MARTIN', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000008'), NOW(), NOW()),
-- ROGER VASQUEZ: locales 9 y 10
(9, 'BOULEVARD', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009'), NOW(), NOW()),
(10, 'SAN_MARTIN', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009'), NOW(), NOW()),
(11, 'BOULEVARD', 'INSIDE', 900.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000011'), NOW(), NOW()),
(12, 'SAN_MARTIN', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000012'), NOW(), NOW()),
(13, 'BOULEVARD', 'INSIDE', 1100.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000013'), NOW(), NOW()),
-- ROGER VASQUEZ: locales 14, 15 y 16
(14, 'SAN_MARTIN', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009'), NOW(), NOW()),
(15, 'BOULEVARD', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009'), NOW(), NOW()),
(16, 'SAN_MARTIN', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009'), NOW(), NOW()),
-- MICHELL REVILLA: locales 17 y 18
(17, 'BOULEVARD', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000017'), NOW(), NOW()),
(18, 'SAN_MARTIN', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000017'), NOW(), NOW()),
-- SEGUNDO ALARCON: locales 19 y 20
(19, 'BOULEVARD', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001'), NOW(), NOW()),
(20, 'SAN_MARTIN', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001'), NOW(), NOW()),
(21, 'BOULEVARD', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000021'), NOW(), NOW()),
-- JUAN PARIONA: locales 22 y 23
(22, 'SAN_MARTIN', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000022'), NOW(), NOW()),
(23, 'BOULEVARD', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000022'), NOW(), NOW()),
-- SEGUNDO ALARCON: locales 24 y 25
(24, 'SAN_MARTIN', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001'), NOW(), NOW()),
(25, 'BOULEVARD', 'INSIDE', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001'), NOW(), NOW());

-- Insert contracts based on payment months from planilla
INSERT INTO "contracts" ("tenantId", "propertyId", "tenantFullName", "startDate", "endDate", "monthlyRent", "status", "createdAt", "updatedAt") VALUES
-- Single properties paying SETIEMBRE (locales 1-6, 11-13, 21)
((SELECT id FROM "tenants" WHERE "documentId" = '10000001'), (SELECT id FROM "properties" WHERE "localNumber" = 1), 'SEGUNDO ALARCON', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000002'), (SELECT id FROM "properties" WHERE "localNumber" = 2), 'JIM GAMARRA', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000003'), (SELECT id FROM "properties" WHERE "localNumber" = 3), 'MARY VARGAS', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000004'), (SELECT id FROM "properties" WHERE "localNumber" = 4), 'ERICKA ROJAS', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000005'), (SELECT id FROM "properties" WHERE "localNumber" = 5), 'MEDALIT HUAYTA', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000006'), (SELECT id FROM "properties" WHERE "localNumber" = 6), 'DIANA ROJAS', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000011'), (SELECT id FROM "properties" WHERE "localNumber" = 11), 'DENIS REBATA', '2023-09-01', '2024-08-31', 900.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000012'), (SELECT id FROM "properties" WHERE "localNumber" = 12), 'BETSY SOTO', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000013'), (SELECT id FROM "properties" WHERE "localNumber" = 13), 'ULISES FLORES', '2023-09-01', '2024-08-31', 1100.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000021'), (SELECT id FROM "properties" WHERE "localNumber" = 21), 'K MODA', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),

-- Multi-property tenants paying SETIEMBRE
-- ROGER VASQUEZ: locales 9 y 10 (pago consolidado 1,600.00)
((SELECT id FROM "tenants" WHERE "documentId" = '10000009'), (SELECT id FROM "properties" WHERE "localNumber" = 9), 'ROGER VASQUEZ', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000009'), (SELECT id FROM "properties" WHERE "localNumber" = 10), 'ROGER VASQUEZ', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
-- ROGER VASQUEZ: locales 14, 15 y 16 (pago consolidado 2,400.00)
((SELECT id FROM "tenants" WHERE "documentId" = '10000009'), (SELECT id FROM "properties" WHERE "localNumber" = 14), 'ROGER VASQUEZ', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000009'), (SELECT id FROM "properties" WHERE "localNumber" = 15), 'ROGER VASQUEZ', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000009'), (SELECT id FROM "properties" WHERE "localNumber" = 16), 'ROGER VASQUEZ', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
-- MICHELL REVILLA: locales 17 y 18 (pago consolidado 1,600.00)
((SELECT id FROM "tenants" WHERE "documentId" = '10000017'), (SELECT id FROM "properties" WHERE "localNumber" = 17), 'MICHELL REVILLA', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000017'), (SELECT id FROM "properties" WHERE "localNumber" = 18), 'MICHELL REVILLA', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
-- SEGUNDO ALARCON: locales 19 y 20 (pago consolidado 1,600.00)
((SELECT id FROM "tenants" WHERE "documentId" = '10000001'), (SELECT id FROM "properties" WHERE "localNumber" = 19), 'SEGUNDO ALARCON', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000001'), (SELECT id FROM "properties" WHERE "localNumber" = 20), 'SEGUNDO ALARCON', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
-- JUAN PARIONA: locales 22 y 23 (pago consolidado 1,600.00)
((SELECT id FROM "tenants" WHERE "documentId" = '10000022'), (SELECT id FROM "properties" WHERE "localNumber" = 22), 'JUAN PARIONA', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000022'), (SELECT id FROM "properties" WHERE "localNumber" = 23), 'JUAN PARIONA', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
-- SEGUNDO ALARCON: locales 24 y 25 (pago consolidado 1,600.00)
((SELECT id FROM "tenants" WHERE "documentId" = '10000001'), (SELECT id FROM "properties" WHERE "localNumber" = 24), 'SEGUNDO ALARCON', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000001'), (SELECT id FROM "properties" WHERE "localNumber" = 25), 'SEGUNDO ALARCON', '2023-09-01', '2024-08-31', 800.00, 'ACTIVE', NOW(), NOW()),

-- Special cases: different payment months
-- MENDEZ MAYTA: local 8 - ABRIL
((SELECT id FROM "tenants" WHERE "documentId" = '10000008'), (SELECT id FROM "properties" WHERE "localNumber" = 8), 'MENDEZ MAYTA', '2023-04-01', '2024-03-31', 800.00, 'ACTIVE', NOW(), NOW()),
-- NELTON NINAHUAMAN: local 7 - AGOSTO y SETIEMBRE
((SELECT id FROM "tenants" WHERE "documentId" = '10000007'), (SELECT id FROM "properties" WHERE "localNumber" = 7), 'NELTON NINAHUAMAN', '2023-08-01', '2024-07-31', 800.00, 'ACTIVE', NOW(), NOW());

-- Payments based on months paid according to planilla
INSERT INTO "payments" ("tenantId", "propertyId", "contractId", "monthNumber", "tenantFullName", "tenantPhone", "amount", "paymentDate", "dueDate", "paymentMethod", "pentamontSettled", "createdAt", "updatedAt") VALUES
-- SETIEMBRE payments (mes 9)
-- Locales individuales (1-6, 11-13, 21)
((SELECT id FROM "tenants" WHERE "documentId" = '10000001'), (SELECT id FROM "properties" WHERE "localNumber" = 1), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000001') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 1)), 9, 'SEGUNDO ALARCON', '989876543', 800.00, '2023-08-28', '2023-09-05', 'YAPE', true, NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000002'), (SELECT id FROM "properties" WHERE "localNumber" = 2), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000002') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 2)), 9, 'JIM GAMARRA', '988765432', 800.00, '2023-08-28', '2023-09-05', 'DEPOSITO', false, NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000003'), (SELECT id FROM "properties" WHERE "localNumber" = 3), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000003') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 3)), 9, 'MARY VARGAS', '987654321', 800.00, '2023-08-28', '2023-09-05', 'TRANSFERENCIA_VIRTUAL', true, NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000004'), (SELECT id FROM "properties" WHERE "localNumber" = 4), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000004') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 4)), 9, 'ERICKA ROJAS', '986543210', 800.00, '2023-08-28', '2023-09-05', 'YAPE', true, NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000005'), (SELECT id FROM "properties" WHERE "localNumber" = 5), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000005') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 5)), 9, 'MEDALIT HUAYTA', '985432109', 800.00, '2023-08-28', '2023-09-05', 'DEPOSITO', false, NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000006'), (SELECT id FROM "properties" WHERE "localNumber" = 6), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000006') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 6)), 9, 'DIANA ROJAS', '984321098', 800.00, '2023-08-28', '2023-09-05', 'TRANSFERENCIA_VIRTUAL', true, NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000011'), (SELECT id FROM "properties" WHERE "localNumber" = 11), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000011') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 11)), 9, 'DENIS REBATA', '980987654', 900.00, '2023-08-28', '2023-09-05', 'YAPE', true, NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000012'), (SELECT id FROM "properties" WHERE "localNumber" = 12), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000012') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 12)), 9, 'BETSY SOTO', '979876543', 800.00, '2023-08-28', '2023-09-05', 'DEPOSITO', true, NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000013'), (SELECT id FROM "properties" WHERE "localNumber" = 13), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000013') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 13)), 9, 'ULISES FLORES', '978765432', 1100.00, '2023-08-28', '2023-09-05', 'YAPE', false, NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000021'), (SELECT id FROM "properties" WHERE "localNumber" = 21), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000021') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 21)), 9, 'K MODA', '976543210', 800.00, '2023-08-28', '2023-09-05', 'TRANSFERENCIA_VIRTUAL', true, NOW(), NOW()),

-- Multi-property SETIEMBRE payments (pagos consolidados)
-- ROGER VASQUEZ: locales 9 y 10 - 1,600.00 (pago consolidado en local 9)
((SELECT id FROM "tenants" WHERE "documentId" = '10000009'), (SELECT id FROM "properties" WHERE "localNumber" = 9), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000009') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 9)), 9, 'ROGER VASQUEZ', '981098765', 1600.00, '2023-08-28', '2023-09-05', 'YAPE', true, NOW(), NOW()),
-- ROGER VASQUEZ: locales 14, 15 y 16 - 2,400.00 (pago consolidado en local 14)
((SELECT id FROM "tenants" WHERE "documentId" = '10000009'), (SELECT id FROM "properties" WHERE "localNumber" = 14), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000009') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 14)), 9, 'ROGER VASQUEZ', '981098765', 2400.00, '2023-08-28', '2023-09-05', 'YAPE', true, NOW(), NOW()),
-- MICHELL REVILLA: locales 17 y 18 - 1,600.00 (pago consolidado en local 17)
((SELECT id FROM "tenants" WHERE "documentId" = '10000017'), (SELECT id FROM "properties" WHERE "localNumber" = 17), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000017') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 17)), 9, 'MICHELL REVILLA', '977654321', 1600.00, '2023-08-28', '2023-09-05', 'YAPE', true, NOW(), NOW()),
-- SEGUNDO ALARCON: locales 19 y 20 - 1,600.00 (pago consolidado en local 19)
((SELECT id FROM "tenants" WHERE "documentId" = '10000001'), (SELECT id FROM "properties" WHERE "localNumber" = 19), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000001') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 19)), 9, 'SEGUNDO ALARCON', '989876543', 1600.00, '2023-08-28', '2023-09-05', 'YAPE', true, NOW(), NOW()),
-- JUAN PARIONA: locales 22 y 23 - 1,600.00 (pago consolidado en local 22)
((SELECT id FROM "tenants" WHERE "documentId" = '10000022'), (SELECT id FROM "properties" WHERE "localNumber" = 22), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000022') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 22)), 9, 'JUAN PARIONA', '975432109', 1600.00, '2023-08-28', '2023-09-05', 'YAPE', true, NOW(), NOW()),
-- SEGUNDO ALARCON: locales 24 y 25 - 1,600.00 (pago consolidado en local 24)
((SELECT id FROM "tenants" WHERE "documentId" = '10000001'), (SELECT id FROM "properties" WHERE "localNumber" = 24), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000001') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 24)), 9, 'SEGUNDO ALARCON', '989876543', 1600.00, '2023-08-28', '2023-09-05', 'YAPE', true, NOW(), NOW()),

-- Special payment months
-- MENDEZ MAYTA: local 8 - ABRIL (mes 4)
((SELECT id FROM "tenants" WHERE "documentId" = '10000008'), (SELECT id FROM "properties" WHERE "localNumber" = 8), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000008') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 8)), 4, 'MENDEZ MAYTA', '982109876', 800.00, '2023-03-28', '2023-04-05', 'YAPE', true, NOW(), NOW()),

-- NELTON NINAHUAMAN: local 7 - AGOSTO (mes 8) y SETIEMBRE (mes 9) - 1,600.00 total
((SELECT id FROM "tenants" WHERE "documentId" = '10000007'), (SELECT id FROM "properties" WHERE "localNumber" = 7), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000007') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 7)), 8, 'NELTON NINAHUAMAN', '983210987', 800.00, '2023-07-28', '2023-08-05', 'YAPE', true, NOW(), NOW()),
((SELECT id FROM "tenants" WHERE "documentId" = '10000007'), (SELECT id FROM "properties" WHERE "localNumber" = 7), (SELECT id FROM "contracts" WHERE "tenantId" = (SELECT id FROM "tenants" WHERE "documentId" = '10000007') AND "propertyId" = (SELECT id FROM "properties" WHERE "localNumber" = 7)), 9, 'NELTON NINAHUAMAN', '983210987', 800.00, '2023-08-28', '2023-09-05', 'YAPE', true, NOW(), NOW());
