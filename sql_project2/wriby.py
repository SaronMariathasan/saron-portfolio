#!/usr/bin/python3

# COMP3311 24T2 Assignment 2
# Print a list of movies written by a given person

import sys
import psycopg2
import helpers

### Globals

db = None
usage = f"Usage: {sys.argv[0]} FullName"

### Command-line args

if len(sys.argv) < 2:
   print(usage)
   exit(1)

# process the command-line args 
name = sys.argv[1]

### Queries
q1 = "select count(*) from people where name=%s;"
q2 = "select people_id from is_a where name=%s and job=%s order by people_id;"
q3 = "select concat(movies.title,' (', movies.year,')') from principals join movies on principals.movie=movies.id where principals.person=%s order by year,title;"
### Manipulating database

try:
   db = psycopg2.connect("dbname=ass2")
   cur = db.cursor()
   
   cur.execute(q1, (name,))
   num_matches = cur.fetchone()[0]

   person_id = None
   
   # Check name exists
   if (num_matches == 0):
      print("No such person")
      db.close()
      exit(1)
   # Check if person has written movies
   else:
      cur.execute(q2, (name, 'writer'))
      matching_writing_creds = cur.fetchall()

      if (len(matching_writing_creds) == 0):
         # check if matching person has written films         
         if ((int(num_matches) == 1)):
            print(f"{name} has not written any movies")
         # check if any of the matching people have written films
         else:
            print(f"None of the people called {name} has written any films")
         db.close()
         exit(1)

   # get id of first writer with matching name
   person_id = matching_writing_creds[0]
   
   # If writer does exist with the given name, print out movies they have written for
   cur.execute(q3, person_id)
   movies_written = cur.fetchall()

   for movie in movies_written:
      print(movie[0])
except Exception as err:
   print("DB error: ", err)
finally:
   if db:
      db.close()
