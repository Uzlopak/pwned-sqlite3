# adapted from https://github.com/ChrisInmodis/Haveibeenpwned-Local-Version

import sqlite3
import codecs

# Modify these if necessary
path = "./pwned-passwords-sha1-ordered-by-hash-v7.txt"
dbName = "pwned.sqlite3"

#erstellt automatisch eine SQLite DB mit dem Titel: pwned_indexed
conn = sqlite3.connect(dbName)
c = conn.cursor()

#deactivate all the stuff, we dont need as we would just restart the process if the process fails
c.execute("PRAGMA foreign_keys = false")
c.execute("PRAGMA journal_mode = off")
c.execute("PRAGMA synchronous = off")
c.execute("PRAGMA locking_mode = exclusive")
c.execute("PRAGMA automatic_index = false")
c.execute("PRAGMA secure_delete = false")

#DB wird im selben Verzeichnis erstellt in dem das Skript liegt
# Use BLOBs so we store the hash as 20 byte (8 * 20 = 160 bits of sha1)
# We declare hash as Primary Key to save the index, also we dont need the ROWID as hash is the primary key
c.execute("CREATE TABLE pwned (hash BLOB PRIMARY KEY) WITHOUT ROWID ")

hashvalue = ""
count = 0

print("Starting...")

input_file = open(path,"r")
for line in input_file: 
    split = line.split(":")
    hashvalue = split[0]
    prevalence = split[1]
    blob = memoryview((codecs.decode(hashvalue, 'hex_codec')))

    conn.execute("INSERT INTO pwned (hash) VALUES(?)", (blob, ))
    if(count % 1000000 == 0):
        print("Processed " + str(count))
    count += 1

conn.commit()
print("Successfully imported " + str(count) + " hashes")

print("Optimizing the Database. This may take a while...")
c.execute("VACUUM")
print("Successfully optimized the Database.")

conn.close()