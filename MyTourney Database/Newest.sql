CREATE DATABASE  IF NOT EXISTS `mytourney_db` /*!40100 DEFAULT CHARACTER SET utf8 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `mytourney_db`;
-- MySQL dump 10.13  Distrib 8.0.27, for macos11 (x86_64)
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
-- Table structure for table `matchmaking`
--

DROP TABLE IF EXISTS `matchmaking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matchmaking` (
  `match_id` int NOT NULL AUTO_INCREMENT,
  `tourney_query` varchar(255) NOT NULL,
  `tourney_id` int NOT NULL,
  PRIMARY KEY (`match_id`),
  UNIQUE KEY `idnew_table_UNIQUE` (`match_id`),
  UNIQUE KEY `tourney_url_UNIQUE` (`tourney_query`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matchmaking`
--

LOCK TABLES `matchmaking` WRITE;
/*!40000 ALTER TABLE `matchmaking` DISABLE KEYS */;
INSERT INTO `matchmaking` VALUES (1,'&gen=1&team_count=6&g1=20-18&g2=21-17&s1=16-19&s2=0-0&f=0-0',25);
/*!40000 ALTER TABLE `matchmaking` ENABLE KEYS */;
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
  `member_count` int DEFAULT NULL,
  `team_balance` float DEFAULT NULL,
  PRIMARY KEY (`teams_id`,`users_user_id`),
  UNIQUE KEY `team_name_UNIQUE` (`team_name`),
  KEY `fk_teams_users1_idx` (`users_user_id`),
  CONSTRAINT `fk_teams_users1` FOREIGN KEY (`users_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `teams`
--

LOCK TABLES `teams` WRITE;
/*!40000 ALTER TABLE `teams` DISABLE KEYS */;
INSERT INTO `teams` VALUES (14,'Bayern','Ibrahim','268ad6daa3977135dec19e80594a87ab',0,0,0,0,0,0,0,0,0,0,0,0,1,3,30),(16,'Liverpool','Nuts','cb94728212c5377a2bcb5ad39c18fc62',0,0,0,0,0,0,0,0,0,0,0,0,5,3,30),(17,'Real Madrid','user3','285f1a2b8760d873c3d1ee431bda060a',0,0,0,0,0,0,0,0,0,0,0,0,24,3,0),(18,'PSG','user6','a38f90c07a5bf1e2830e5afb4ececd5c',0,0,0,0,0,0,0,0,0,0,0,0,27,3,0),(19,'Juventus','user9','f169a1089fa3a13f02f860637800c3b1',0,0,0,0,0,0,0,0,0,0,0,0,30,3,0),(20,'Dortmund','user12','8721f1943162f4ca1477d9cf54ba48b8',0,0,0,0,0,0,0,0,0,0,0,0,33,3,0),(21,'Ajax','user15','50311d7f3413756f5d4e1d015680f2d7',0,0,0,0,0,0,0,0,0,0,0,0,36,3,0);
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
INSERT INTO `teams_entered_in_tourney` VALUES (16,5,25,2,1),(17,24,25,2,1),(18,27,25,2,1),(19,30,25,2,1),(20,33,25,2,1),(21,36,25,2,1);
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
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tourneys`
--

LOCK TABLES `tourneys` WRITE;
/*!40000 ALTER TABLE `tourneys` DISABLE KEYS */;
INSERT INTO `tourneys` VALUES (9,11,'M','adult','World Cup','San Antonio',29.2128,-98.447,600000,16,30,'846aa5c1a1aa18fbf1a0bfee31d623e2',2,1,0,'2022-01-01 00:00:00'),(10,11,'M','child','CHAMPIONS LEAGUE','Washington DC',38.8637,-76.9468,5400000,16,27,'4eb6ab7169f939de7f114f767187d050',2,1,0,'2022-01-01 00:00:00'),(11,5,'M','mix','OWL CUP','Houston',29.7216,-95.391,900000,8,10,'cbea784ecc9bbdd04f87a4ba19cb6e23',3,5,0,'2022-01-01 00:00:00'),(25,3,'M','child','jsnkns','Corpus Christi',27.649,-97.3908,900000,16,10,'b2a12aed9fc1b3b8f42eb159ec53491e',2,1,6,'2021-12-17 20:45:00');
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
  `entity` varchar(250) DEFAULT NULL,
  `entity_id` int DEFAULT NULL,
  PRIMARY KEY (`transactions_id`,`tourneys_tourneys_id`,`tourneys_hosts_hosts_id`,`tourneys_hosts_users_user_id`,`users_user_id`),
  KEY `fk_transactions_tourneys1_idx` (`tourneys_tourneys_id`,`tourneys_hosts_hosts_id`,`tourneys_hosts_users_user_id`),
  KEY `fk_transactions_users1_idx` (`users_user_id`),
  CONSTRAINT `fk_transactions_tourneys1` FOREIGN KEY (`tourneys_tourneys_id`) REFERENCES `tourneys` (`tourneys_id`),
  CONSTRAINT `fk_transactions_users1` FOREIGN KEY (`users_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transactions`
--

LOCK TABLES `transactions` WRITE;
/*!40000 ALTER TABLE `transactions` DISABLE KEYS */;
INSERT INTO `transactions` VALUES (7,30,'team-host','2021-12-18 03:19:12',25,2,1,5,'team',16),(8,30,'team-host','2021-12-20 01:23:55',25,2,1,24,'team',17),(9,30,'team-host','2021-12-20 01:34:17',25,2,1,27,'team',18),(10,30,'team-host','2021-12-20 01:45:48',25,2,1,30,'team',19),(11,30,'team-host','2021-12-20 01:56:36',25,2,1,33,'team',20),(12,30,'team-host','2021-12-20 02:00:43',25,2,1,36,'team',21);
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
  `team_contribution` float DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_email_UNIQUE` (`user_email`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Ibrahim','$2b$10$cx4sdvkui2FN5Ue3oPlnM.FQXNhi683wjKk4KF4roqYQiUSYDD4R.','isa1@rice.edu','Ibrahim','Al-Akash','M','2003-02-27',NULL,'f4c13c23bc0cc89da2e427ce87a159e5',10000,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,NULL,1,0),(5,'Nuts','$2b$10$miPRUkfwCKn5vaatyVTN8O0uk0Lo01hUtziP1z4mZCPTls739bqhu','user@gmail.com','Luke','Vader','M','2005-11-27',NULL,'23b7095b2a0be7f3bacbc1b7e920d48c',0,0,0,0,0,0,0,0,0,0,0,0,30,16,100,100,30,NULL,1,1),(18,'boss','$2b$10$ecsKxfuV8FZob0rNSbB8h.ilyjD6sU3nH/sUXpK02079KaWA5KGjK','ibrahim.ceo@winmytourney.com','Ibrahim','Al-Akash','M','2003-02-27',NULL,NULL,100,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,'$2b$10$nFBaWkdqRAUeJAW0C7FSQuOTg9LU9u7WSwM.ygVAHqvD.gpb9EDpy',1,0),(20,'texasTanker','$2b$10$dyUgYGdzPyi0JhkkwS2N8eAWE9YwA13byjB9XKNAmvS6eft5dmlJO','ialakash@live.com','Porfirio','Zamora','M','2003-02-27',NULL,'1b8dd206bb6ae3b2ac7d23b6aa38cfb5',0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,'$2b$10$vqI95bWQgdMZ9TzISHN6CuMUJEL2xbYUbTaH5OEZVlp4YHlZoy1te',1,0),(21,'alakais391','$2b$10$TNy7/8/gue59wZMNJIrbC.3anBOADhnii7qh2wIXeWpHqC662IEve','alakashibrahim@gmail.com','Ibrahim','Al-Akash','M','2003-02-27',NULL,NULL,0,0,0,0,0,0,0,0,0,0,0,0,0,14,0,0,0,'$2b$10$1cbZ20RX6kziIuWcNu1mjOt42HXI3O4ZSRz4ZAlD/kNd1UsojLbEC',1,0),(22,'user1','$2b$10$FTzVrtUPevtfU.kmZK4AdOlzJv/qJdsRYGIYQYkSX1Evlwb9NKVGK','1@live.com','john','john','M','2003-12-20',NULL,'75c9ef38ca869d34962723c67adf3c66',0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,'$2b$10$Q4lzWSAuCt/OvBaHmfP8UOhH5sEsgcJIBeWAwmU/4h/4lq7.DClPG',1,0),(23,'user2','$2b$10$fZuyzgdWQ5Kr4o/aqd3.gOWXr7DkXN4bKRp6OzOLBo11KmzEqpW/m','2@live.com','john','john','M','2003-02-28',NULL,NULL,0,0,0,0,0,0,0,0,0,0,0,0,0,16,0,0,0,'$2b$10$o9Fn1ekLJK6FNwxyEYRKS.xCq.9ZHZEEzToJ0retCMvdHjN4Qmu5e',1,0),(24,'user3','$2b$10$wgz1adCVFfDkSkDVnA5Za.X41yFyn0XRhEVMbfB2jNPvimmbSYA.m','3@live.com','jiji','kopk','M','2003-02-02',NULL,'c6bd8b020240b6a82e82c7a6c7a9c38f',0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,'$2b$10$c7Q9EXZJFZOexkULvSj8lOyov.ECvtRqpUu7jRwuqI4afI3Sn3TlK',1,0),(25,'user4','$2b$10$FM/IM.7BR07rZX9cMtCwZeMFlpximdwQKQFaKvTfFOF3B7xxDhgt6','4@live.com','jlkjk','jlkjlk','M','2003-02-20',NULL,'760e8f29c870ebdeb7915863eefe7d54',0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,'$2b$10$BlhCp2ef4IwcIuCzdKvpCeWe9XkisH2OVIm.HypjuASQFkFHZHeH2',1,0),(26,'user5','$2b$10$A8MopeiPX8K0Q/Pnw9ZA3uEHp74o1AxzKhkhK07HL7y/LyCQrjMFS','5@live.com','ohjlk','ljljlkjlk','M','2003-02-02',NULL,NULL,0,0,0,0,0,0,0,0,0,0,0,0,0,17,0,0,0,'$2b$10$NlwxDRdEGW7.slSGeQpTU.FXzO0sbw80D3QIz1aOK3L52QdkYARJi',1,0),(27,'user6','$2b$10$vyFnsZHbbUwOJTA5dLY1JORvzvnt1Cm6yp6FFyqZUAHxz80NTVdiG','6@live.com','ijljlk','jlljkjl','M','2003-02-02',NULL,'0467d4303270e0e8b1ea90201ec57488',0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,'$2b$10$dxnMaRKqB/c63QMFfflzUepqzdxSwPO0/v2gfSaDvufUpak14.3w2',1,0),(28,'user7','$2b$10$4l6VSVcPhsRmWyyu0fz1BOoC9/ogKgTkDPSIGoFusSEmQVi1iNMsG','7@live.com','jllkjaj','lkjkdsjlj','M','2003-02-02',NULL,'84e486613fb7c318e73505f8aed73e26',0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,'$2b$10$lQmjzcXO1gdHVfhGsvPBNOxTK90RobpI/pdhDktN5HQQiPy90GJHi',1,0),(29,'user8','$2b$10$I1EQv6F43ERedk5yedNa2O6rxHQjJNVfKrJmpyoide2ibhHRanjrq','8@live.com','jkljl','kjkl','M','2003-02-02',NULL,'12bb68182b5fafb24a93a6bce5f16966',0,0,0,0,0,0,0,0,0,0,0,0,0,18,0,0,0,'$2b$10$gJB7t5ic1RkF6o0Zr0QEsOkIWxd2Ub969EaJDNr.mX2WYA9T6jp5m',1,0),(30,'user9','$2b$10$cz7k9GSxZgZlcl2ZoDc65uOlw50Bnf7Uojcy.RWQxDii6BVTeTTbK','9@live.com','uhlkjlk','ljlk;jlkj','M','2003-02-20',NULL,'5a00e0c15cfe42c0e3c493391d53368d',0,0,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,'$2b$10$v1/NYmHfDH04OSw.9KGqqeTbHB6/I93.nnTL19CBIjkNJWiuuzqX.',1,0),(31,'user10','$2b$10$RCpLOu3ThAHeTw3Bhxgey.W0vp5qm7LBTy3V3whKfJ3epHj3tkCn.','10@live.com','jlkj','jkljlk','M','2003-02-02',NULL,'2694edd27eac8f90776a3cc69872ea3b',0,0,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,'$2b$10$GdozVHl5BmBzxkIpq2jWyenpPJqFhy6bb/hYBodHTcFuNDQIvFtYW',1,0),(32,'user11','$2b$10$svheBwY7ZOWCcVte/gWPBubfuWX.9ZILoRLIUkQ1R0KNCy0fsa3Cu','11@live.com','jjj','iojiojioj','M','2003-02-20',NULL,'2240cffa20ed59d759427f550f9ec27c',0,0,0,0,0,0,0,0,0,0,0,0,0,19,0,0,0,'$2b$10$JH373XwYJifPJLMh5brvwOWFW7EXPPAfIAQWZQfDvFvcod2llhpvO',1,0),(33,'user12','$2b$10$EpFzAdn6GKjj0zd2pd0JvOF6sOxYu9k9uNTHOBWba2429VoQ2Yi4G','12@live.com','jljk','jjlkjklk','M','2003-02-02',NULL,'86d1c534970f01497b3f88a47d965874',0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,'$2b$10$NAe28Z8oX4JrfUckNtXAE.dGxLY0rITYfVtgGYwNSGkSQ4PuTeJ/W',1,0),(34,'user13','$2b$10$vDvMZrcyC6YNkEhKtwE2d.hzhbdMq2dknL9Z6YsZY6/kwuIo41kFS','13@live.com','lkjjkjlkhj','hjkjhjhl','M','2003-02-02',NULL,'a859a6779b8e148236e604f86f503c37',0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,'$2b$10$EUWYxk.vNcIqIespH.kkpe.Qhe20pgVpbYB0AWv59pHSFaS8rvSm.',1,0),(35,'user14','$2b$10$9Pvgspp6T1F633XCiBdn7Oi.nFVZVAC7vZsa06Ebx.2W3TbTojdA6','14@live.com','jijhhkgg','uggiygg','M','2003-02-02',NULL,'251f266670c39bc9a8ff41a683ccf94d',0,0,0,0,0,0,0,0,0,0,0,0,0,20,0,0,0,'$2b$10$8B69puzOl9F8UnFcrTDUWO2R.ptD0HpDFTS8UCEBSVdxtn1NmJh8G',1,0),(36,'user15','$2b$10$1SUEaRRWFDnErlmRWmSZc.6D/kCydxtm9IJ5ja5gosjoFHRnTNkH6','15@live.com','ojjlakj','aidhhsh','M','2003-02-02',NULL,'25b3ddf5b9670154aa8414954b4d8b47',0,0,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,'$2b$10$Yli7x/ZJFO0nfkNkdlukc.8mnwlSbaWFlddDFSHxAKIhoxEobr5Sa',1,0),(37,'user16','$2b$10$kIxRppmJyacz7VnjMwBJo.W/cU.76OyD7F0vxxJg9Y3PiHnBTBWi2','16@live.com','sjlkdshj','sljkdhskjh','M','2003-02-02',NULL,NULL,0,0,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,'$2b$10$EnW47ikieuNd1o4uMJDVLuxS2yuk1qGpFZvhlI/DG6JtUrqskp6i2',1,0),(38,'user17','$2b$10$T2y.lga.bdztl3PBvma1muARM6s0.eQfmyu4Kdw8PG8nWzovH4the','17@live.com','jhasdhlaj','asuygyiusagoua','M','2003-02-02',NULL,NULL,0,0,0,0,0,0,0,0,0,0,0,0,0,21,0,0,0,'$2b$10$qbGLDn/GRze2pW9Gc8M0eOOmbWjWAdx5cnhHCmxc8zT8MFoauPEDm',0,0);
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

-- Dump completed on 2021-12-21 19:43:16
