CREATE TABLE Users(
   id COUNTER,
   username VARCHAR(50) NOT NULL,
   password VARCHAR(255) NOT NULL,
   last_connected DATETIME,
   is_owner LOGICAL NOT NULL,
   PRIMARY KEY(id),
   UNIQUE(username)
);

CREATE TABLE Catalogs(
   id COUNTER,
   address VARCHAR(50) NOT NULL,
   private_key VARCHAR(50) NOT NULL,
   name VARCHAR(50) NOT NULL,
   description VARCHAR(255),
   PRIMARY KEY(id),
   UNIQUE(address)
);

CREATE TABLE can_access(
   id INT,
   id_1 INT,
   PRIMARY KEY(id, id_1),
   FOREIGN KEY(id) REFERENCES Users(id),
   FOREIGN KEY(id_1) REFERENCES Catalogs(id)
);
