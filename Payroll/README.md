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

