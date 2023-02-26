CREATE TABLE
  `event-genre` (
    `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    `eventId` integer NOT NULL,
    `genreId` integer NOT NULL,
    UNIQUE (`eventId`, `genreId`),
    CONSTRAINT `event-genre_ibfk_1` FOREIGN KEY (`eventId`) REFERENCES `events` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `event-genre_ibfk_2` FOREIGN KEY (`genreId`) REFERENCES `genres` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
  );

CREATE TABLE
  `events` (
    `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    `name` varchar(255) NOT NULL,
    `artist` varchar(255) NOT NULL,
    `venue` varchar(255) NOT NULL,
    `city` varchar(255) NOT NULL,
    `time` datetime NOT NULL,
    `price` integer NOT NULL,
    `imageUrl` varchar(500) NOT NULL,
    `description` varchar(500) NOT NULL,
    `deployed` integer NOT NULL,
    `cancelled` integer NOT NULL
  );

CREATE TABLE
  `genres` (
    `id` integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    `name` varchar(255) NOT NULL,
    UNIQUE (`name`)
  );

CREATE INDEX "idx_event-genre_eventgenre_ibfk_1" ON "event-genre" (`eventId`);

CREATE INDEX "idx_event-genre_eventgenre_ibfk_2" ON "event-genre" (`genreId`);
