CREATE DATABASE  IF NOT EXISTS `mytourney_db` /*!40100 DEFAULT CHARACTER SET utf8 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `mytourney_db`;
-- MySQL dump 10.13  Distrib 8.0.27, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: mytourney_db
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
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `games` (
  `games_id` int NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NULL DEFAULT NULL,
  `winner_points` int DEFAULT NULL,
  `tourneys_tourneys_id` int NOT NULL,
  `tourneys_hosts_hosts_id` int NOT NULL,
  `tourneys_hosts_users_user_id` int NOT NULL,
  `loser_points` int DEFAULT NULL,
  `game_type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`games_id`,`tourneys_tourneys_id`,`tourneys_hosts_hosts_id`,`tourneys_hosts_users_user_id`),
  UNIQUE KEY `games_id_UNIQUE` (`games_id`),
  KEY `fk_games_tourneys1_idx` (`tourneys_tourneys_id`,`tourneys_hosts_hosts_id`,`tourneys_hosts_users_user_id`),
  CONSTRAINT `fk_games_tourneys1` FOREIGN KEY (`tourneys_tourneys_id`) REFERENCES `tourneys` (`tourneys_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_game_record`
--

DROP TABLE IF EXISTS `team_game_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `team_game_record` (
  `games_games_id` int NOT NULL,
  `teams_teams_id_winner` int NOT NULL,
  `teams_users_user_id_winner` int NOT NULL,
  `teams_teams_id_loser` int DEFAULT NULL,
  `teams_users_user_id_loser` int DEFAULT NULL,
  `teams_points_winner` int DEFAULT NULL,
  `teams_points_loser` int DEFAULT NULL,
  PRIMARY KEY (`games_games_id`,`teams_teams_id_winner`,`teams_users_user_id_winner`),
  KEY `fk_team_game_record_teams1_idx` (`teams_teams_id_winner`,`teams_users_user_id_winner`),
  CONSTRAINT `fk_team_game_record_games1` FOREIGN KEY (`games_games_id`) REFERENCES `games` (`games_id`),
  CONSTRAINT `fk_team_game_record_teams1` FOREIGN KEY (`teams_teams_id_winner`, `teams_users_user_id_winner`) REFERENCES `teams` (`teams_id`, `users_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_game_record`
--

LOCK TABLES `team_game_record` WRITE;
/*!40000 ALTER TABLE `team_game_record` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_game_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams` (
  `teams_id` int NOT NULL AUTO_INCREMENT,
  `team_name` varchar(255) NOT NULL,
  `team_leader` varchar(255) DEFAULT NULL,
  `team_logo` varchar(1296) DEFAULT NULL,
  `tourneys_played` int DEFAULT NULL,
  `tourneys_won` int DEFAULT NULL,
  `tourneys_lost` int DEFAULT NULL,
  `games_played` int DEFAULT NULL,
  `games_won` int DEFAULT NULL,
  `games_lost` int DEFAULT NULL,
  `team_points` int DEFAULT NULL,
  `goals_for` int DEFAULT NULL,
  `goals_against` int DEFAULT NULL,
  `shots` int DEFAULT NULL,
  `saves` int DEFAULT NULL,
  `shutouts` int DEFAULT NULL,
  `users_user_id` int NOT NULL,
  PRIMARY KEY (`teams_id`,`users_user_id`),
  UNIQUE KEY `team_name_UNIQUE` (`team_name`),
  KEY `fk_teams_users1_idx` (`users_user_id`),
  CONSTRAINT `fk_teams_users1` FOREIGN KEY (`users_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (1,'Madrid','Ibrahim',NULL,0,0,0,0,0,0,100,0,0,0,0,0,1);
/*!40000 ALTER TABLE `teams` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `teams_entered_in_tourney`
--

DROP TABLE IF EXISTS `teams_entered_in_tourney`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `teams_entered_in_tourney` (
  `teams_teams_id` int NOT NULL,
  `teams_users_user_id` int NOT NULL,
  `tourneys_tourneys_id` int NOT NULL,
  `tourneys_hosts_hosts_id` int NOT NULL,
  `tourneys_hosts_users_user_id` int NOT NULL,
  PRIMARY KEY (`teams_teams_id`,`teams_users_user_id`,`tourneys_tourneys_id`,`tourneys_hosts_hosts_id`,`tourneys_hosts_users_user_id`),
  KEY `fk_teams_entered_in_tourney_tourneys1_idx` (`tourneys_tourneys_id`,`tourneys_hosts_hosts_id`,`tourneys_hosts_users_user_id`),
  CONSTRAINT `fk_teams_entered_in_tourney_teams1` FOREIGN KEY (`teams_teams_id`, `teams_users_user_id`) REFERENCES `teams` (`teams_id`, `users_user_id`),
  CONSTRAINT `fk_teams_entered_in_tourney_tourneys1` FOREIGN KEY (`tourneys_tourneys_id`) REFERENCES `tourneys` (`tourneys_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams_entered_in_tourney`
--

LOCK TABLES `teams_entered_in_tourney` WRITE;
/*!40000 ALTER TABLE `teams_entered_in_tourney` DISABLE KEYS */;
/*!40000 ALTER TABLE `teams_entered_in_tourney` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tourney_hosts`
--

DROP TABLE IF EXISTS `tourney_hosts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tourney_hosts` (
  `hosts_id` int NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `membership` varchar(10) DEFAULT NULL,
  `users_user_id` int NOT NULL,
  PRIMARY KEY (`hosts_id`,`users_user_id`),
  KEY `fk_hosts_users_idx` (`users_user_id`),
  CONSTRAINT `fk_hosts_users` FOREIGN KEY (`users_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tourney_hosts`
--

LOCK TABLES `tourney_hosts` WRITE;
/*!40000 ALTER TABLE `tourney_hosts` DISABLE KEYS */;
INSERT INTO `tourney_hosts` VALUES (2,NULL,NULL,1),(3,NULL,NULL,5),(4,NULL,NULL,20);
/*!40000 ALTER TABLE `tourney_hosts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tourneys`
--

DROP TABLE IF EXISTS `tourneys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tourneys` (
  `tourneys_id` int NOT NULL AUTO_INCREMENT,
  `team_sizes` int DEFAULT NULL,
  `gender` varchar(45) DEFAULT NULL,
  `age_group` varchar(45) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `city` varchar(255) DEFAULT NULL,
  `lat_coord` float DEFAULT NULL,
  `lon_coord` float DEFAULT NULL,
  `duration_time` int DEFAULT NULL,
  `max_participants` int DEFAULT NULL,
  `entry_fee` float DEFAULT NULL,
  `photo` varchar(1296) DEFAULT NULL,
  `hosts_hosts_id` int NOT NULL,
  `hosts_users_user_id` int NOT NULL,
  `current_participants` int DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  PRIMARY KEY (`tourneys_id`,`hosts_hosts_id`,`hosts_users_user_id`),
  KEY `fk_tourneys_hosts1_idx` (`hosts_hosts_id`,`hosts_users_user_id`),
  CONSTRAINT `fk_tourneys_hosts1` FOREIGN KEY (`hosts_hosts_id`, `hosts_users_user_id`) REFERENCES `tourney_hosts` (`hosts_id`, `users_user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tourneys`
--

LOCK TABLES `tourneys` WRITE;
/*!40000 ALTER TABLE `tourneys` DISABLE KEYS */;
INSERT INTO `tourneys` VALUES (9,11,'M','adult','World Cup','San Antonio',29.2128,-98.447,600000,16,30,'846aa5c1a1aa18fbf1a0bfee31d623e2',2,1,0,'2022-01-01 00:00:00'),(10,11,'M','child','CHAMPIONS LEAGUE','Washington DC',38.8637,-76.9468,5400000,16,27,'4eb6ab7169f939de7f114f767187d050',2,1,0,'2022-01-01 00:00:00'),(11,5,'M','mix','OWL CUP','Houston',29.7216,-95.391,900000,8,10,'cbea784ecc9bbdd04f87a4ba19cb6e23',3,5,0,'2022-01-01 00:00:00');
/*!40000 ALTER TABLE `tourneys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `transactions_id` int NOT NULL AUTO_INCREMENT,
  `price` float DEFAULT NULL,
  `direction` varchar(45) DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  `tourneys_tourneys_id` int NOT NULL,
  `tourneys_hosts_hosts_id` int NOT NULL,
  `tourneys_hosts_users_user_id` int NOT NULL,
  `users_user_id` int NOT NULL,
  PRIMARY KEY (`transactions_id`,`tourneys_tourneys_id`,`tourneys_hosts_hosts_id`,`tourneys_hosts_users_user_id`,`users_user_id`),
  KEY `fk_transactions_tourneys1_idx` (`tourneys_tourneys_id`,`tourneys_hosts_hosts_id`,`tourneys_hosts_users_user_id`),
  KEY `fk_transactions_users1_idx` (`users_user_id`),
  CONSTRAINT `fk_transactions_tourneys1` FOREIGN KEY (`tourneys_tourneys_id`) REFERENCES `tourneys` (`tourneys_id`),
  CONSTRAINT `fk_transactions_users1` FOREIGN KEY (`users_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `user_name` varchar(255) NOT NULL,
  `user_pass` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_first` varchar(255) NOT NULL,
  `user_last` varchar(255) NOT NULL,
  `user_gender` varchar(10) NOT NULL,
  `age` date NOT NULL,
  `bio` text,
  `photo` varchar(1296) DEFAULT NULL,
  `points` int DEFAULT NULL,
  `tourneys_played` int DEFAULT NULL,
  `tourneys_won` int DEFAULT NULL,
  `tourneys_lost` int DEFAULT NULL,
  `games_played` int DEFAULT NULL,
  `games_won` int DEFAULT NULL,
  `games_lost` int DEFAULT NULL,
  `goals_for` int DEFAULT NULL,
  `goals_against` int DEFAULT NULL,
  `shots` int DEFAULT NULL,
  `saves` int DEFAULT NULL,
  `shutouts` int DEFAULT NULL,
  `balance` float DEFAULT NULL,
  `team_id` int DEFAULT NULL,
  `earnings` float DEFAULT NULL,
  `withdrawals` float DEFAULT NULL,
  `losses` float DEFAULT NULL,
  `verification_code` varchar(255) DEFAULT NULL,
  `verified` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_email_UNIQUE` (`user_email`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Ibrahim','$2b$10$cx4sdvkui2FN5Ue3oPlnM.FQXNhi683wjKk4KF4roqYQiUSYDD4R.','isa1@rice.edu','Ibrahim','Al-Akash','M','2003-02-27',NULL,NULL,10000,0,0,0,0,0,0,0,0,0,0,0,0,NULL,0,0,0,NULL,1),(5,'Nuts','$2b$10$miPRUkfwCKn5vaatyVTN8O0uk0Lo01hUtziP1z4mZCPTls739bqhu','user@gmail.com','Luke','Vader','M','2005-11-27',NULL,NULL,0,0,0,0,0,0,0,0,0,0,0,0,30,NULL,0,100,30,NULL,1),(18,'boss','$2b$10$ecsKxfuV8FZob0rNSbB8h.ilyjD6sU3nH/sUXpK02079KaWA5KGjK','ibrahim.ceo@winmytourney.com','Ibrahim','Al-Akash','M','2003-02-27',NULL,NULL,100,0,0,0,0,0,0,0,0,0,0,0,0,NULL,0,0,0,'$2b$10$nFBaWkdqRAUeJAW0C7FSQuOTg9LU9u7WSwM.ygVAHqvD.gpb9EDpy',1),(20,'texasTanker','$2b$10$dyUgYGdzPyi0JhkkwS2N8eAWE9YwA13byjB9XKNAmvS6eft5dmlJO','ialakash@live.com','Porfirio','Zamora','M','2003-02-27',NULL,NULL,0,0,0,0,0,0,0,0,0,0,0,0,0,NULL,0,0,0,'$2b$10$vqI95bWQgdMZ9TzISHN6CuMUJEL2xbYUbTaH5OEZVlp4YHlZoy1te',1),(21,'alakais391','$2b$10$TNy7/8/gue59wZMNJIrbC.3anBOADhnii7qh2wIXeWpHqC662IEve','alakashibrahim@gmail.com','Ibrahim','Al-Akash','M','2003-02-27',NULL,NULL,0,0,0,0,0,0,0,0,0,0,0,0,0,NULL,0,0,0,'$2b$10$1cbZ20RX6kziIuWcNu1mjOt42HXI3O4ZSRz4ZAlD/kNd1UsojLbEC',1);
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

-- Dump completed on 2021-12-13  7:19:45
