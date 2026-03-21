link to typo 'nnot'
https://spring.io/guides/tutorials/rest#:~:text=nnot

--------------------------------------------------------------------------------

To run:
```console
./mvnw clean spring-boot:run
```

List all employees:
```console
curl -v localhost:8080/employees
```

Get employee:
```console
curl -v localhost:8080/employees/1
```

Add employee:
```console
curl -X POST localhost:8080/employees -H 'Content-type:application/json' -d '{"name": "Samwise Gamgee", "role": "gardener"}'
```

Example: change user role:
```console
curl -X PUT localhost:8080/employees/3 -H 'Content-type:application/json' -d '{"name": "Samwise Gamgee", "role": "ring bearer"}'
```

Delete employee:
```console
curl -X DELETE localhost:8080/employees/3
```

---

Create new user with old syntax (name instead of firstName and lastName)
```console
curl -v -X POST localhost:8080/employees -H 'Content-Type:application/json' -d '{"name": "Samwise Gamgee", "role": "gardener"}' | json_pp
```

Create new user with new syntax
```console
curl -v -X POST localhost:8080/employees -H 'Content-Type:application/json' -d '{"firstName": "Samwise", "lastName": "Gamgee", "role": "gardener"}' | json_pp
```

Update a user
```console
curl -v -X PUT localhost:8080/employees/3 -H 'Content-Type:application/json' -d '{"name": "Samwise Gamgee", "role": "ring bearer"}' | json_pp
```

DELETE a user
```console
curl -v -X DELETE localhost:8080/employees/1
```

--------------------------------------------------------------------------------

# What is REST and what is not

- Pretty URLs, such as `/employees/3`, aren't REST.
- Merely using GET, POST, and so on is not REST.
- Having all the CRUD operations laid out is not REST.

A service with these 3 properties should be called RPC (Remote Procedure Call)


