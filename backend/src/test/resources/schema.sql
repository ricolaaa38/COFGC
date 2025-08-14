CREATE TABLE breves {
	id_breve INT PRIMARY KEY NOT NULL AUTO INCREMENT,
	bqsm_num VARCHAR(48) NOT NULL,
	date DATE NOT NULL,
	titre VARCHAR(96) NOT NULL,
	categorie VARCHAR(48) NOT NULL,
	zone VARCHAR(96),
	pays VARCHAR(48),
	latitude DECIMAL(9,6),
	longitude DECIMAL(9,6),
	contenu TEXT,
}