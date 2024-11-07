#!/usr/bin/python3

# COMP3311 24T2 Assignment 2
# Print a list of countries where a named movie was released

import sys
import psycopg2
import helpers
import re

### Globals

db = None
usage = f"Usage: {sys.argv[0]} Year"

### Command-line args

if len(sys.argv) < 2:
   print(usage)
   exit(1)

# process the command-line args ...
year = sys.argv[1]

if (helpers.getYear(year) is None):
   print('Invalid year')
   exit(1)

### Queries
q1 = 'select id from movies where year=%s;'
q2 = 'select genre, avg(rating) from movies m join moviegenres g on m.id=g.movie where year=%s group by genre order by avg desc, genre;'

### Manipulating database

try:
   db = psycopg2.connect("dbname=ass2")
   cur = db.cursor()

   # Check if movies were released in given year
   cur.execute(q1, (year,))

   if (cur.fetchone() is None):
      print('No movies')
      db.close()
      exit(1)

   # get top 10 highest rated genres for given year
   cur.execute(q2, (year,))
   
   # print results
   for tup in cur.fetchmany(10):
      print(f'{tup[1]:.2f} {tup[0]}')
except Exception as err:
   print("DB error: ", err)
finally:
   if db:
      db.close()

