#!/usr/bin/python3

# COMP3311 24T2 Assignment 2
# Print a list of countries where a named movie was released

import sys
import psycopg2
import helpers
import re

### Globals

db = None
usage = f"Usage: {sys.argv[0]} 'MovieName' Year"

### Command-line args

if len(sys.argv) < 3:
   print(usage)
   exit(1)

# process the command-line args ...
movie_name = sys.argv[1]
year =  sys.argv[2]

if (re.fullmatch("[0-9]{4}", year) is None):
   print('Invalid year')
   exit(1)

### Queries
q1 = 'select id from movies where title=%s and year=%s;'
q2 = 'select c.name from countries c join releasedin r on c.code=r.country where r.movie=%s order by c.name;'
q3 = 'select name from countries where code = (select origin from movies where id=%s);'

### Manipulating database

try:
   db = psycopg2.connect("dbname=ass2")
   cur = db.cursor()

   # Check if movie exists
   cur.execute(q1, (movie_name, year))
   movie_id = cur.fetchone()

   if (movie_id is None):
      print('No such movie')
      db.close()
      exit(1)
   
   # Get origin country of movie
   cur.execute(q3, movie_id)
   origin = cur.fetchone()

   if (origin is None):
      origin = ''
   else:
      origin = origin[0]

   # Get releases for movie
   cur.execute(q2, movie_id)
   releases = cur.fetchall()

   # Check if movie had any releases
   if (len(releases) == 0):
      print('No releases')
   # Check if movie was only released in it's origin country
   elif ((len(releases) == 1) and releases[0][0] == origin):
      print('The movie was only released in its origin country:', origin)
   else:
      # Print all releases of movie
      for tup in releases:
         print(tup[0])
except psycopg2.Error as err:
   print(err.pgerror)
finally:
   if db:
      db.close()

