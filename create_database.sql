SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

CREATE DATABASE IF NOT EXISTS `time-register` DEFAULT CHARACTER SET latin1 COLLATE latin1_general_ci;
USE `time-register`;

CREATE TABLE IF NOT EXISTS `customer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `hourly_rate` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `project` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) DEFAULT NULL,
  `name` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `period` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) DEFAULT NULL,
  `start` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `stop` timestamp NULL DEFAULT NULL,
  `billed` int(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

INSERT IGNORE INTO `customer` (`id`, `name`, `email`, `hourly_rate`) VALUES(1, 'James', 'james@somedomain.com', 40);
INSERT IGNORE INTO `customer` (`id`, `name`, `email`, `hourly_rate`) VALUES(2, 'Alex', 'alex@somedomain.com', 50);
INSERT IGNORE INTO `customer` (`id`, `name`, `email`, `hourly_rate`) VALUES(3, 'Mark', 'mark@somedomain.com', 60);

INSERT IGNORE INTO `period` (`id`, `project_id`, `start`, `stop`, `billed`) VALUES(1, 1, '2014-06-06 01:43:58', '2014-06-06 02:43:58', b'0');
INSERT IGNORE INTO `period` (`id`, `project_id`, `start`, `stop`, `billed`) VALUES(2, 1, '2014-06-06 03:43:58', '2014-06-06 05:43:58', b'0');
INSERT IGNORE INTO `period` (`id`, `project_id`, `start`, `stop`, `billed`) VALUES(3, 2, '2014-06-06 01:43:58', '2014-06-06 02:43:58', b'0');
INSERT IGNORE INTO `period` (`id`, `project_id`, `start`, `stop`, `billed`) VALUES(4, 2, '2014-06-06 02:43:58', '2014-06-06 06:43:58', b'0');
INSERT IGNORE INTO `period` (`id`, `project_id`, `start`, `stop`, `billed`) VALUES(5, 3, '2014-06-06 01:43:58', '2014-06-06 06:43:58', b'0');

INSERT IGNORE INTO `project` (`id`, `customer_id`, `name`) VALUES(1, 1, 'Project 1');
INSERT IGNORE INTO `project` (`id`, `customer_id`, `name`) VALUES(2, 1, 'Project 2');
INSERT IGNORE INTO `project` (`id`, `customer_id`, `name`) VALUES(3, 2, 'Project 3');
INSERT IGNORE INTO `project` (`id`, `customer_id`, `name`) VALUES(4, 2, 'Project 4');