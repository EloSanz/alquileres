-- Seed data for alquileres-app
-- Updated to match the exact planilla data with correct payment months and amounts
-- Now creates 12 payments per contract

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
('JUAN', 'PARIONA', '975432109', '10000022', '22', 'TIPEO', '2023-09-01', 'AL_DIA', NOW(), NOW())
ON CONFLICT ("documentId") DO NOTHING;

-- Insert properties (25 properties from planilla)
INSERT INTO "properties" ("localNumber", "ubicacion", "monthlyRent", "tenantId", "createdAt", "updatedAt") VALUES
-- Locales individuales
(1, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001'), NOW(), NOW()),
(2, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000002'), NOW(), NOW()),
(3, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000003'), NOW(), NOW()),
(4, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000004'), NOW(), NOW()),
(5, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000005'), NOW(), NOW()),
(6, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000006'), NOW(), NOW()),
(7, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000007'), NOW(), NOW()),
(8, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000008'), NOW(), NOW()),
-- ROGER VASQUEZ: locales 9 y 10
(9, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009'), NOW(), NOW()),
(10, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009'), NOW(), NOW()),
(11, 'BOULEVAR', 900.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000011'), NOW(), NOW()),
(12, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000012'), NOW(), NOW()),
(13, 'BOULEVAR', 1100.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000013'), NOW(), NOW()),
-- ROGER VASQUEZ: locales 14, 15 y 16
(14, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009'), NOW(), NOW()),
(15, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009'), NOW(), NOW()),
(16, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000009'), NOW(), NOW()),
-- MICHELL REVILLA: locales 17 y 18
(17, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000017'), NOW(), NOW()),
(18, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000017'), NOW(), NOW()),
-- SEGUNDO ALARCON: locales 19 y 20
(19, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001'), NOW(), NOW()),
(20, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001'), NOW(), NOW()),
(21, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000021'), NOW(), NOW()),
-- JUAN PARIONA: locales 22 y 23
(22, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000022'), NOW(), NOW()),
(23, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000022'), NOW(), NOW()),
-- SEGUNDO ALARCON: locales 24 y 25
(24, 'SAN_MARTIN', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001'), NOW(), NOW()),
(25, 'BOULEVAR', 800.00, (SELECT id FROM "tenants" WHERE "documentId" = '10000001'), NOW(), NOW());

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

-- Create 12 payments for each contract
-- Function to calculate payment status based on paymentDate and dueDate
DO $$
DECLARE
  contract_rec RECORD;
  month_num INT;
  due_date DATE;
  payment_date DATE;
  payment_status TEXT;
  now_date DATE := CURRENT_DATE;
BEGIN
  FOR contract_rec IN SELECT c.id, c."tenantId", c."propertyId", c."startDate", c."monthlyRent", c."tenantFullName", t.phone as tenant_phone
                      FROM "contracts" c
                      LEFT JOIN "tenants" t ON c."tenantId" = t.id
  LOOP
    FOR month_num IN 1..12 LOOP
      -- Calculate due date: startDate + (monthNumber - 1) months
      due_date := (contract_rec.startDate::date + (month_num - 1 || ' months')::interval)::date;
      
      -- Determine payment date and status based on historical data
      -- For month 9 (SETIEMBRE) contracts starting 2023-09-01, mark as paid
      IF contract_rec.startDate::date = '2023-09-01'::date AND month_num = 9 THEN
        payment_date := due_date - INTERVAL '4 days'; -- 2023-08-28
        payment_status := 'PAGADO';
      -- For MENDEZ MAYTA (local 8, ABRIL), month 4 is paid
      ELSIF contract_rec.startDate::date = '2023-04-01'::date AND month_num = 4 THEN
        payment_date := due_date - INTERVAL '4 days'; -- 2023-03-28
        payment_status := 'PAGADO';
      -- For NELTON NINAHUAMAN (local 7, AGOSTO), months 8 and 9 are paid
      ELSIF contract_rec.startDate::date = '2023-08-01'::date AND (month_num = 8 OR month_num = 9) THEN
        payment_date := due_date - INTERVAL '4 days';
        payment_status := 'PAGADO';
      ELSE
        -- No payment date for unpaid months
        payment_date := NULL;
        -- Calculate status: if due_date < now and not paid, it's VENCIDO, else FUTURO
        IF due_date < now_date THEN
          payment_status := 'VENCIDO';
        ELSE
          payment_status := 'FUTURO';
        END IF;
      END IF;
      
      -- Insert payment
      INSERT INTO "payments" (
        "tenantId", "propertyId", "contractId", "monthNumber",
        "tenantFullName", "tenantPhone", "amount",
        "paymentDate", "dueDate", "paymentMethod", "status",
        "pentamontSettled", "createdAt", "updatedAt"
      ) VALUES (
        contract_rec."tenantId",
        contract_rec."propertyId",
        contract_rec.id,
        month_num,
        contract_rec."tenantFullName",
        contract_rec.tenant_phone,
        contract_rec."monthlyRent",
        payment_date,
        due_date,
        'YAPE',
        payment_status::"PaymentStatus",
        CASE WHEN payment_status = 'PAGADO' THEN true ELSE false END,
        NOW(),
        NOW()
      )
      ON CONFLICT ("contractId", "monthNumber") DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
