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


curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"gcf0dee7533ef4a50a998dc1f71573e48\", \"role\": \"GROUP\"}" http://localhost:7000/auth/challenge
curl -i -X POST -d username=gcf0dee7533ef4a50a998dc1f71573e48 -d password=Challenge -b cookie.txt http://localhost:7000/user/auth_group


curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"gcf0dee7533ef4a50a998dc1f71573e48\", \"role\": \"ADMIN\"}" http://localhost:7000/auth/challenge
curl -i -X POST -d username=gcf0dee7533ef4a50a998dc1f71573e48 -d password=Challenge -b cookie.txt http://localhost:7000/user/auth_group


curl -i -X GET -H "Accept:application/json" -b cookie.txt http://localhost:7000/store/gcf0dee7533ef4a50a998dc1f71573e48
curl -i -X POST -H "Accept:application/json" -b cookie.txt http://localhost:7000/group/gcf0dee7533ef4a50a998dc1f71573e48/members


curl -i -X POST -H "Accept:application/json" -b cookie.txt http://localhost:7000/admin/gcf0dee7533ef4a50a998dc1f71573e48/pubK
curl -i -X POST -H "Content-Type: application/json" -d "{\"pubK\": \"Geaendert\", \"privK\": \"Geaendert\", \"apubK\": \"Geaendert\", \"aprivK\": \"Geaendert\"}" -b cookie.txt http://localhost:7000/admin/gcf0dee7533ef4a50a998dc1f71573e48/change_cred
curl -i -X POST -H "Accept:application/json" -b cookie.txt http://localhost:7000/admin/gcf0dee7533ef4a50a998dc1f71573e48/pubK


curl -i -X POST -H "Content-Type: application/json" -d "{\"text\": \"Hallo\"}" -b cookie.txt http://localhost:7000/admin/gcf0dee7533ef4a50a998dc1f71573e48/add_user

curl -i -X POST -b cookie.txt http://localhost:7000/admin/gcf0dee7533ef4a50a998dc1f71573e48/remove
```

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"mwustinger\", \"role\": \"USER\"}" http://localhost:7000/auth/challenge
curl -i -X POST -d username=mwustinger -d password=Challenge -c cookie.txt http://localhost:7000/auth/login


curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"gcf0dee7533ef4a50a998dc1f71573e48\", \"role\": \"GROUP\"}" http://localhost:7000/auth/challenge
curl -i -X POST -d username=gcf0dee7533ef4a50a998dc1f71573e48 -d password=Challenge -b cookie.txt http://localhost:7000/user/auth_group


curl -i -X GET -H "Accept:application/json" -b cookie.txt http://localhost:7000/store/gcf0dee7533ef4a50a998dc1f71573e48
curl -i -X POST -H "Accept:application/json" -b cookie.txt http://localhost:7000/group/gcf0dee7533ef4a50a998dc1f71573e48/test
```

