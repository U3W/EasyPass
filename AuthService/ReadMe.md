# Auth-Service

Test for User:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"uid\": \"mwustinger\", \"pubK\": \"PUBKEY\", \"privK\": \"PRIVKEY\"}" http://localhost:7000/auth/register


curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"mwustinger\", \"role\": \"USER\"}" http://localhost:7000/auth/challenge
curl -i -X POST -d username=mwustinger -d password=Challenge -c cookie.txt http://localhost:7000/auth/login


curl -i -X GET -H "Accept:application/json" -b cookie.txt http://localhost:7000/store/mwustinger
curl -i -X GET -H "Accept:application/json" -b cookie.txt http://localhost:7000/store/mwustinger-meta


curl -i -X POST -b cookie.txt http://localhost:7000/auth/logout
curl -i -X POST -b cookie.txt http://localhost:7000/user/remove
```

Test for Group:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"pubK\": \"PUBKEY\", \"privK\": \"PRIVKEY\", \"apubK\": \"APUBKEY\", \"aprivK\": \"APRIVKEY\"}" -b cookie.txt http://localhost:7000/user/create_group


curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"g8a77239b7f0b43cfbd0e4210a3f685c3\", \"role\": \"GROUP\"}" http://localhost:7000/auth/challenge
curl -i -X POST -d username=g8a77239b7f0b43cfbd0e4210a3f685c3 -d password=Challenge -b cookie.txt http://localhost:7000/user/auth_group


curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"g8a77239b7f0b43cfbd0e4210a3f685c3\", \"role\": \"ADMIN\"}" http://localhost:7000/auth/challenge
curl -i -X POST -d username=g8a77239b7f0b43cfbd0e4210a3f685c3 -d password=Challenge -b cookie.txt http://localhost:7000/user/auth_group


curl -i -X GET -H "Accept:application/json" -b cookie.txt http://localhost:7000/store/g8a77239b7f0b43cfbd0e4210a3f685c3


curl -i -X POST -b cookie.txt http://localhost:7000/admin/remove
```

