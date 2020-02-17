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


curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"488b87a896fd41cab169638af221bdb8\", \"role\": \"GROUP\"}" http://localhost:7000/auth/challenge

curl -i -X POST -d username=488b87a896fd41cab169638af221bdb8 -d password=Challenge -b cookie.txt -c cookie.txt http://localhost:7000/user/auth_group

curl -i -X GET -H "Accept:application/json" -b cookie.txt http://localhost:7000/store/488b87a896fd41cab169638af221bdb8


curl -i -X POST -b cookieUser.txt http://localhost:7000/auth/logout

curl -i -X POST -b cookieGroup.txt http://localhost:7000/admin/remove




curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"family\", \"role\": \"ADMIN\"}" http://localhost:7000/auth/challenge

curl -i -X POST -d username=family -d password=Challenge -c cookieAdmin.txt http://localhost:7000/auth/login

curl -i -X GET -H "Accept:application/json" -b cookieAdmin.txt http://localhost:7000/store/family-p

curl -i -X POST -b cookieAdmin.txt http://localhost:7000/admin/remove
```

