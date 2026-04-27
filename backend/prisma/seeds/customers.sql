-- PROJECT BRIDGE - Customer Data Seed
-- SQL dump of 20 realistic UK customers for seeding the database
-- Usage: psql -d project_bridge_db < backend/prisma/seeds/customers.sql

INSERT INTO "Customer" (email, "firstName", "lastName", phone, address, postcode, "utilityAccountNo", "utilityType", "monthlyBill", arrears) VALUES
('john.smith@example.com', 'John', 'Smith', '07700 900001', '42 Oak Street', 'M1 1AA', 'GAS00001234', 'Gas', 89.50, 245.00),
('jane.doe@example.com', 'Jane', 'Doe', '07700 900002', '17 Maple Road', 'B5 5RD', 'ELEC00005678', 'Electricity', 125.75, 0.00),
('robert.johnson@example.com', 'Robert', 'Johnson', '07700 900003', '88 Church Lane', 'E1 6AN', 'GAS00002345', 'Gas', 65.00, 195.00),
('sarah.williams@example.com', 'Sarah', 'Williams', '07700 900004', '52 Queens Avenue', 'SW1 1AA', 'ELEC00006789', 'Electricity', 98.50, 392.00),
('michael.brown@example.com', 'Michael', 'Brown', '07700 900005', '73 Park Road', 'L1 1AA', 'GAS00003456', 'Gas', 72.25, 144.50),
('emily.davis@example.com', 'Emily', 'Davis', '07700 900006', '99 High Street', 'E8 1AA', 'ELEC00007890', 'Electricity', 110.00, 550.00),
('david.miller@example.com', 'David', 'Miller', '07700 900007', '34 Main Street', 'G1 1AA', 'GAS00004567', 'Gas', 81.75, 0.00),
('laura.wilson@example.com', 'Laura', 'Wilson', '07700 900008', '15 Central Avenue', 'M2 1AA', 'WATER0008901', 'Water', 45.00, 90.00),
('james.moore@example.com', 'James', 'Moore', '07700 900009', '66 West Lane', 'S1 1AA', 'ELEC00008901', 'Electricity', 105.50, 317.00),
('sophia.taylor@example.com', 'Sophia', 'Taylor', '07700 900010', '28 South Road', 'B1 1AA', 'GAS00005678', 'Gas', 58.00, 232.00),
('daniel.anderson@example.com', 'Daniel', 'Anderson', '07700 900011', '44 North Street', 'N1 1AA', 'ELEC00009012', 'Electricity', 135.00, 0.00),
('olivia.thomas@example.com', 'Olivia', 'Thomas', '07700 900012', '11 Park Lane', 'E2 1AA', 'GAS00006789', 'Gas', 76.50, 153.00),
('william.jackson@example.com', 'William', 'Jackson', '07700 900013', '89 Garden Road', 'CV1 1AA', 'WATER0009012', 'Water', 52.00, 0.00),
('isabella.white@example.com', 'Isabella', 'White', '07700 900014', '21 Forest Street', 'N2 1AA', 'ELEC00000123', 'Electricity', 99.75, 598.50),
('alexander.harris@example.com', 'Alexander', 'Harris', '07700 900015', '57 Maple Drive', 'M3 1AA', 'GAS00007890', 'Gas', 68.00, 68.00),
('amelia.martin@example.com', 'Amelia', 'Martin', '07700 900016', '33 Cherry Lane', 'B2 1AA', 'ELEC00001234', 'Electricity', 115.25, 345.75),
('christopher.lee@example.com', 'Christopher', 'Lee', '07700 900017', '74 Birch Road', 'S2 1AA', 'GAS00008901', 'Gas', 79.50, 0.00),
('mia.perez@example.com', 'Mia', 'Perez', '07700 900018', '46 Elm Street', 'L2 1AA', 'WATER0000123', 'Water', 48.00, 144.00),
('benjamin.clark@example.com', 'Benjamin', 'Clark', '07700 900019', '19 Oak Avenue', 'G2 1AA', 'ELEC00002345', 'Electricity', 122.00, 610.00),
('charlotte.lewis@example.com', 'Charlotte', 'Lewis', '07700 900020', '63 Ash Lane', 'E3 1AA', 'GAS00009012', 'Gas', 85.00, 170.00);
