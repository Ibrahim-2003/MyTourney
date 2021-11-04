CREATE DATABASE  IF NOT EXISTS `mytourney` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `mytourney`;
-- MySQL dump 10.13  Distrib 8.0.27, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: mytourney
-- ------------------------------------------------------
-- Server version	8.0.27

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) DEFAULT NULL,
  `user_pass` varchar(255) DEFAULT NULL,
  `user_email` varchar(255) DEFAULT NULL,
  `user_first` varchar(255) DEFAULT NULL,
  `user_last` varchar(255) DEFAULT NULL,
  `user_gender` varchar(10) DEFAULT NULL,
  `age` tinyint unsigned DEFAULT NULL,
  `bio` longtext,
  `photo` varchar(1296) DEFAULT NULL,
  `points` int DEFAULT NULL,
  `tourneys_played` int DEFAULT NULL,
  `tourneys_won` int DEFAULT NULL,
  `tourneys_lost` int DEFAULT NULL,
  `games_played` int DEFAULT NULL,
  `games_lost` int DEFAULT NULL,
  `goals_for` int DEFAULT NULL,
  `goals_against` int DEFAULT NULL,
  `shots` int DEFAULT NULL,
  `saves` int DEFAULT NULL,
  `shutouts` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_email` (`user_email`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Ibrahim','password','user@gmail.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,'ahmad','$2b$10$avSrP/ZHQULIXp.hPwQ2luvM2ErCw5l6RI9W2kEtEyEqtwnKzKGwi','ahmad@gmail.com','ahmad','ajmi','M',18,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,'ibracadabra','$2b$10$daLhYH8Bgle1FlSEVyQlCOjlTOv75AehHbjF/0gTXSSvi.aDHSipm','isa1@rice.edu','ibrahim','al-akash','M',18,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,'Rommel','$2b$10$QSLa2tEXUP6BELcM.HXRX.tfIzCI1Exc3eiTyLYnNFuHrQn4.XqGy','rc87@rice.edu','Rommel','Caballero','M',18,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,'Gabert','$2b$10$CSyG.RR/iVT3nqD0ATqz6eEn4C/teP78/lfqyUDzgQp93k9gyHl6O','gs5@rice.edu','Gabe','Skariah','M',19,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,'Salakash','$2b$10$xElnsEaFWzjonNY9QJHZX.eBQChTB86npPImDFwvnszv8oh3LBpNa','samhar.al-akash@dchstx.org','Samhar','Al-Akash','M',53,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-10-30 11:39:40
