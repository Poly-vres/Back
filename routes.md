# Routes of the API

*ne marche pas sur la connexion de l'université !*

### Make an user book a book
**POST REQUEST**
`http://146.59.233.238:3000/library_books/reserve/user_id/book_id`  

*example:*
`http://146.59.233.238:3000/library_books/reserve/22/11`

### Get all books list
**GET REQUEST**
`http://146.59.233.238:3000/library_books`

### Get all users list
**GET REQUEST**
`http://146.59.233.238:3000/library_users`

### Update a user's status
**POST REQUEST**

`http://146.59.233.238:3000/library_user_status_update/user_id/status`
*example:*  
`http://146.59.233.238:3000/library_user_status_update/23/revoked`

valid values:
- revoked
- approved
- pending (default)

### Connect a user 
**POST REQUEST**

`http://146.59.233.238:3000/library_users/connect/:username/:password`
*example:*
`http://146.59.233.238:3000/library_users/connect/claquettes/super_password`

### Create a new user
**POST REQUEST**
`http://146.59.233.238:3000/library_users/create/:name/:surname/:username/:password`

*example:*
`http://146.59.233.238:3000/library_users/create/jeanjean/valljean/boss69/pwd

### Re