#!/usr/bin/python3

# COMP3311 24T2 Assignment 2
# Print info about one movie; may need to choose

import sys
import psycopg2
import helpers

### Globals

db = None
usage = f"Usage: {sys.argv[0]} 'PartialMovieName'"

### Command-line args

if len(sys.argv) < 2:
   print(usage)
   exit(1)

title_pattern = sys.argv[1]

### Queries
q1 = 'select id, title, year from movies where title ~* %s order by title, year;'
q2 = 'select name, principals_id, ord, job from people_principals_movies where id=%s order by ord;'
q3 = 'select role from playsrole where inmovie=%s;'

### Manipulating database

try:
   db = psycopg2.connect("dbname=ass2")
   cur = db.cursor()
   
   # get matching movies
   cur.execute(q1, (title_pattern,)) 
   options = cur.fetchall()

   # check if any matchess
   if (len(options) == 0):
      print(f"No movie matching: '{title_pattern}'")
      db.close()
      exit(1)

   # print options if more than 1 match
   if (len(options) > 1):
      for tup in options:
         print(f'{options.index(tup) + 1}. {tup[1]} ({tup[2]})')
      # get which option
      choice = input('Which movie? ')
      # get chosen movie from list of matching movies
      matching_movie = options[int(choice) - 1]
   else:
      matching_movie = options[0]

   movie_id = matching_movie[0]

   # print movie
   print(f'{matching_movie[1]} ({matching_movie[2]})')

   # get all principals involved in matching movie, ordered by ord
   cur.execute(q2, (movie_id,))

   # print details of each principal in movie
   for tup in cur.fetchall():
      # if job is actor/actress/self get character played
      if ((tup[3] == 'actor') or (tup[3] == 'actress') or (tup[3] == 'self')):
         cur.execute(q3, (tup[1],))
         # print each role played by the current principal
         roles = cur.fetchall()
         if (len(roles) == 0):
            print(f'{tup[0]} plays ???')
         else:
            for role in roles:
               print(f'{tup[0]} plays {role[0]}')
      # if job is anything else, print job
      else:
         print(f'{tup[0]}: {tup[3]}')
except Exception as err:
   print("DB error: ", err)
finally:
   if db:
      db.close()

