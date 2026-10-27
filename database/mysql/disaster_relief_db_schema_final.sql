-- MySQL dump 10.13  Distrib 26.7.0, for macos15 (arm64)
--
-- Host: localhost    Database: disaster_relief_db
-- ------------------------------------------------------
-- Server version	26.7.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Aid_Request`
--

DROP TABLE IF EXISTS `Aid_Request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Aid_Request` (
  `Request_ID` int NOT NULL AUTO_INCREMENT,
  `Center_ID` int NOT NULL,
  `Disaster_ID` int NOT NULL,
  `Request_Date` datetime DEFAULT CURRENT_TIMESTAMP,
  `Priority` enum('Low','Medium','High','Critical') NOT NULL,
  `Status` enum('Pending','Partially Allocated','Allocated','Rejected','Completed') DEFAULT 'Pending',
  PRIMARY KEY (`Request_ID`),
  KEY `fk_request_center` (`Center_ID`),
  KEY `fk_request_disaster` (`Disaster_ID`),
  KEY `idx_aid_request_status` (`Status`),
  CONSTRAINT `fk_request_center` FOREIGN KEY (`Center_ID`) REFERENCES `Relief_Center` (`Center_ID`),
  CONSTRAINT `fk_request_disaster` FOREIGN KEY (`Disaster_ID`) REFERENCES `Disaster` (`Disaster_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Allocation`
--

DROP TABLE IF EXISTS `Allocation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Allocation` (
  `Allocation_ID` int NOT NULL AUTO_INCREMENT,
  `Request_ID` int NOT NULL,
  `Allocation_Date` datetime DEFAULT CURRENT_TIMESTAMP,
  `Allocation_Status` enum('Pending','Approved','Dispatched','Delivered') DEFAULT 'Pending',
  PRIMARY KEY (`Allocation_ID`),
  KEY `fk_allocation_request` (`Request_ID`),
  CONSTRAINT `fk_allocation_request` FOREIGN KEY (`Request_ID`) REFERENCES `Aid_Request` (`Request_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Allocation_Item`
--

DROP TABLE IF EXISTS `Allocation_Item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Allocation_Item` (
  `Allocation_ID` int NOT NULL,
  `Resource_ID` int NOT NULL,
  `Allocated_Quantity` int NOT NULL,
  PRIMARY KEY (`Allocation_ID`,`Resource_ID`),
  KEY `fk_allocation_item_resource` (`Resource_ID`),
  CONSTRAINT `fk_allocation_item_allocation` FOREIGN KEY (`Allocation_ID`) REFERENCES `Allocation` (`Allocation_ID`) ON DELETE CASCADE,
  CONSTRAINT `fk_allocation_item_resource` FOREIGN KEY (`Resource_ID`) REFERENCES `Resource` (`Resource_ID`),
  CONSTRAINT `chk_allocated_quantity` CHECK ((`Allocated_Quantity` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `App_User`
--

DROP TABLE IF EXISTS `App_User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `App_User` (
  `User_ID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(50) NOT NULL,
  `Password_Hash` varchar(255) NOT NULL,
  `Role` enum('Admin','Coordinator','Viewer') NOT NULL DEFAULT 'Viewer',
  `Is_Active` tinyint(1) NOT NULL DEFAULT '1',
  `Created_At` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`User_ID`),
  UNIQUE KEY `Username` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Beneficiary`
--

DROP TABLE IF EXISTS `Beneficiary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Beneficiary` (
  `Beneficiary_ID` int NOT NULL AUTO_INCREMENT,
  `Beneficiary_Name` varchar(100) NOT NULL,
  `Age` int DEFAULT NULL,
  `Gender` varchar(20) DEFAULT NULL,
  `Contact_Number` varchar(15) DEFAULT NULL,
  `Vulnerability_Level` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `Center_ID` int NOT NULL,
  `Disaster_ID` int NOT NULL,
  PRIMARY KEY (`Beneficiary_ID`),
  KEY `fk_beneficiary_disaster` (`Disaster_ID`),
  KEY `idx_beneficiary_center` (`Center_ID`),
  CONSTRAINT `fk_beneficiary_center` FOREIGN KEY (`Center_ID`) REFERENCES `Relief_Center` (`Center_ID`),
  CONSTRAINT `fk_beneficiary_disaster` FOREIGN KEY (`Disaster_ID`) REFERENCES `Disaster` (`Disaster_ID`),
  CONSTRAINT `chk_beneficiary_age` CHECK ((`Age` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Disaster`
--

DROP TABLE IF EXISTS `Disaster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Disaster` (
  `Disaster_ID` int NOT NULL AUTO_INCREMENT,
  `Disaster_Name` varchar(100) NOT NULL,
  `Disaster_Type` varchar(50) NOT NULL,
  `Location` varchar(150) NOT NULL,
  `Start_Date` date NOT NULL,
  `Severity` enum('Low','Medium','High','Critical') NOT NULL,
  `Status` enum('Active','Controlled','Closed') DEFAULT 'Active',
  PRIMARY KEY (`Disaster_ID`),
  KEY `idx_disaster_location` (`Location`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Distribution`
--

DROP TABLE IF EXISTS `Distribution`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Distribution` (
  `Distribution_ID` int NOT NULL AUTO_INCREMENT,
  `Allocation_ID` int NOT NULL,
  `Beneficiary_ID` int NOT NULL,
  `Distribution_Date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Distribution_ID`),
  KEY `fk_distribution_allocation` (`Allocation_ID`),
  KEY `fk_distribution_beneficiary` (`Beneficiary_ID`),
  CONSTRAINT `fk_distribution_allocation` FOREIGN KEY (`Allocation_ID`) REFERENCES `Allocation` (`Allocation_ID`),
  CONSTRAINT `fk_distribution_beneficiary` FOREIGN KEY (`Beneficiary_ID`) REFERENCES `Beneficiary` (`Beneficiary_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Distribution_Item`
--

DROP TABLE IF EXISTS `Distribution_Item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Distribution_Item` (
  `Distribution_ID` int NOT NULL,
  `Resource_ID` int NOT NULL,
  `Quantity_Distributed` int NOT NULL,
  PRIMARY KEY (`Distribution_ID`,`Resource_ID`),
  KEY `fk_distribution_item_resource` (`Resource_ID`),
  CONSTRAINT `fk_distribution_item_distribution` FOREIGN KEY (`Distribution_ID`) REFERENCES `Distribution` (`Distribution_ID`) ON DELETE CASCADE,
  CONSTRAINT `fk_distribution_item_resource` FOREIGN KEY (`Resource_ID`) REFERENCES `Resource` (`Resource_ID`),
  CONSTRAINT `chk_distributed_quantity` CHECK ((`Quantity_Distributed` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `distribution_summary`
--

DROP TABLE IF EXISTS `distribution_summary`;
/*!50001 DROP VIEW IF EXISTS `distribution_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `distribution_summary` AS SELECT
 1 AS `Distribution_ID`,
 1 AS `Beneficiary_Name`,
 1 AS `Resource_Name`,
 1 AS `Quantity_Distributed`,
 1 AS `Distribution_Date`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Inventory_Audit`
--

DROP TABLE IF EXISTS `Inventory_Audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Inventory_Audit` (
  `Audit_ID` int NOT NULL AUTO_INCREMENT,
  `Resource_ID` int NOT NULL,
  `Old_Quantity` int NOT NULL,
  `New_Quantity` int NOT NULL,
  `Change_Date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Audit_ID`),
  KEY `fk_audit_resource` (`Resource_ID`),
  CONSTRAINT `fk_audit_resource` FOREIGN KEY (`Resource_ID`) REFERENCES `Resource` (`Resource_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `low_stock_resources`
--

DROP TABLE IF EXISTS `low_stock_resources`;
/*!50001 DROP VIEW IF EXISTS `low_stock_resources`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `low_stock_resources` AS SELECT
 1 AS `Resource_ID`,
 1 AS `Resource_Name`,
 1 AS `Category`,
 1 AS `Available_Quantity`,
 1 AS `Minimum_Stock`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `pending_high_priority_requests`
--

DROP TABLE IF EXISTS `pending_high_priority_requests`;
/*!50001 DROP VIEW IF EXISTS `pending_high_priority_requests`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `pending_high_priority_requests` AS SELECT
 1 AS `Request_ID`,
 1 AS `Center_Name`,
 1 AS `Disaster_Name`,
 1 AS `Disaster_Location`,
 1 AS `Request_Date`,
 1 AS `Priority`,
 1 AS `Status`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Relief_Center`
--

DROP TABLE IF EXISTS `Relief_Center`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Relief_Center` (
  `Center_ID` int NOT NULL AUTO_INCREMENT,
  `Center_Name` varchar(100) NOT NULL,
  `Location` varchar(150) NOT NULL,
  `Capacity` int NOT NULL,
  `Contact_Number` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`Center_ID`),
  CONSTRAINT `chk_center_capacity` CHECK ((`Capacity` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Request_Item`
--

DROP TABLE IF EXISTS `Request_Item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Request_Item` (
  `Request_ID` int NOT NULL,
  `Resource_ID` int NOT NULL,
  `Quantity_Requested` int NOT NULL,
  `Quantity_Allocated` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`Request_ID`,`Resource_ID`),
  KEY `fk_request_item_resource` (`Resource_ID`),
  CONSTRAINT `fk_request_item_request` FOREIGN KEY (`Request_ID`) REFERENCES `Aid_Request` (`Request_ID`) ON DELETE CASCADE,
  CONSTRAINT `fk_request_item_resource` FOREIGN KEY (`Resource_ID`) REFERENCES `Resource` (`Resource_ID`),
  CONSTRAINT `chk_quantity_allocated` CHECK (((`Quantity_Allocated` >= 0) and (`Quantity_Allocated` <= `Quantity_Requested`))),
  CONSTRAINT `chk_quantity_requested` CHECK ((`Quantity_Requested` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Resource`
--

DROP TABLE IF EXISTS `Resource`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Resource` (
  `Resource_ID` int NOT NULL AUTO_INCREMENT,
  `Resource_Name` varchar(100) NOT NULL,
  `Category` enum('Food','Water','Medicine','Clothing','Shelter','Other') NOT NULL,
  `Unit` varchar(30) NOT NULL,
  `Available_Quantity` int NOT NULL DEFAULT '0',
  `Minimum_Stock` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`Resource_ID`),
  KEY `idx_resource_category` (`Category`),
  CONSTRAINT `chk_available_quantity` CHECK ((`Available_Quantity` >= 0)),
  CONSTRAINT `chk_minimum_stock` CHECK ((`Minimum_Stock` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 */ /*!50003 TRIGGER `trg_inventory_audit` AFTER UPDATE ON `resource` FOR EACH ROW BEGIN
    IF OLD.Available_Quantity <>
       NEW.Available_Quantity THEN

        INSERT INTO Inventory_Audit (
            Resource_ID,
            Old_Quantity,
            New_Quantity
        )
        VALUES (
            NEW.Resource_ID,
            OLD.Available_Quantity,
            NEW.Available_Quantity
        );

    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping events for database 'disaster_relief_db'
--

--
-- Dumping routines for database 'disaster_relief_db'
--
/*!50003 DROP PROCEDURE IF EXISTS `Get_Allocation_Report` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE  PROCEDURE `Get_Allocation_Report`(
    IN p_Request_ID INT
)
BEGIN
    SELECT
        AR.Request_ID,
        AR.Priority,
        AR.Status,
        R.Resource_Name,
        RI.Quantity_Requested,
        RI.Quantity_Allocated,
        (
            RI.Quantity_Requested -
            RI.Quantity_Allocated
        ) AS Shortage
    FROM Aid_Request AR
    JOIN Request_Item RI
        ON AR.Request_ID = RI.Request_ID
    JOIN Resource R
        ON RI.Resource_ID = R.Resource_ID
    WHERE AR.Request_ID = p_Request_ID;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `distribution_summary`
--

/*!50001 DROP VIEW IF EXISTS `distribution_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `distribution_summary` AS select `D`.`Distribution_ID` AS `Distribution_ID`,`B`.`Beneficiary_Name` AS `Beneficiary_Name`,`R`.`Resource_Name` AS `Resource_Name`,`DI`.`Quantity_Distributed` AS `Quantity_Distributed`,`D`.`Distribution_Date` AS `Distribution_Date` from (((`distribution` `D` join `beneficiary` `B` on((`D`.`Beneficiary_ID` = `B`.`Beneficiary_ID`))) join `distribution_item` `DI` on((`D`.`Distribution_ID` = `DI`.`Distribution_ID`))) join `resource` `R` on((`DI`.`Resource_ID` = `R`.`Resource_ID`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `low_stock_resources`
--

/*!50001 DROP VIEW IF EXISTS `low_stock_resources`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `low_stock_resources` AS select `resource`.`Resource_ID` AS `Resource_ID`,`resource`.`Resource_Name` AS `Resource_Name`,`resource`.`Category` AS `Category`,`resource`.`Available_Quantity` AS `Available_Quantity`,`resource`.`Minimum_Stock` AS `Minimum_Stock` from `resource` where (`resource`.`Available_Quantity` <= `resource`.`Minimum_Stock`) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `pending_high_priority_requests`
--

/*!50001 DROP VIEW IF EXISTS `pending_high_priority_requests`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013  SQL SECURITY DEFINER */
/*!50001 VIEW `pending_high_priority_requests` AS select `AR`.`Request_ID` AS `Request_ID`,`RC`.`Center_Name` AS `Center_Name`,`D`.`Disaster_Name` AS `Disaster_Name`,`D`.`Location` AS `Disaster_Location`,`AR`.`Request_Date` AS `Request_Date`,`AR`.`Priority` AS `Priority`,`AR`.`Status` AS `Status` from ((`aid_request` `AR` join `relief_center` `RC` on((`AR`.`Center_ID` = `RC`.`Center_ID`))) join `disaster` `D` on((`AR`.`Disaster_ID` = `D`.`Disaster_ID`))) where ((`AR`.`Status` = 'Pending') and (`AR`.`Priority` in ('High','Critical'))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-27 13:30:06
