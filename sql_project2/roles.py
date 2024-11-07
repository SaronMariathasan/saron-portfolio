# !/usr/bin/python3

# COMP3311 24T2 Assignment 2
# Print a list of character roles played by an actor/actress

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

# process the command-line args ...
name = sys.argv[1]

### Queries

q1= "select people_id from people_principals_movies v where v.name=%s group by people_id order by people_id;"
q2= "select people_id from people_principals_movies v where v.name=%s and (v.job='actor' or v.job='actress' or v.job='self') group by people_id order by people_id;"
q3= "select people_id, principals_id, title, year, rating from people_principals_movies v where v.name=%s and (v.job='actor' or v.job='actress' or v.job='self') order by people_id, year, title;"
q4 = 'select role from playsrole where inmovie=%s order by role;'
### Manipulating database

try:
   db = psycopg2.connect("dbname=ass2")
   cur = db.cursor()
   
   # Get matching persons
   cur.execute(q1, (name,))
   matching_persons = cur.fetchall()
   
   # Check if person exists
   if (len(matching_persons) == 0):
      print('No such person')
      db.close()
      exit(1)

   # Get actors with matching name
   cur.execute(q2, (name,))
   matching_actors = cur.fetchall()
   
   # Check if any actors with matching name
   if (len(matching_actors) == 0):
      print('No acting roles')
      db.close()
      exit(1)

   # Get acting roles of matching actors
   cur.execute(q3, (name,))
   acting_jobs = cur.fetchall()
   
   # Print acting roles
   i = 1 # if more than 1 person with same name, use counter to distinguish
   for person in matching_persons:
      if (person in matching_actors):
         # print actor name + number
         if (len(matching_persons) > 1):
            print(f'{name} #{i}')
            i += 1
         # get current actor's id
         prev_person = acting_jobs[0][0]
         # remove already printed actor from acting_jobs list 
         for tup in acting_jobs:
            if (prev_person != tup[0]):
               acting_jobs = acting_jobs[acting_jobs.index(tup):]
               break
            # get roles played in job
            cur.execute(q4, (tup[1],))
            # print roles
            for role in cur.fetchall():
               print(f'{role[0]} in {tup[2]} ({tup[3]}) {tup[4]}')
            prev_person = tup[0]   
      else:
         # if matching person didn't act, print as such
         if (len(matching_persons) > 1):
            print(f'{name} #{i}')
            i += 1
         print('No acting roles')
except psycopg2.Error as err:
   print(err.pgerror)
finally:
   if db:
      db.close()

