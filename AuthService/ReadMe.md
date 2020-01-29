# Auth-Service

Test for User:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwustinger\", \"pubK\": \"PUBKEY\", \"privK\": \"PRIVKEY\"}" http://localhost:7000/auth/register

curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"mwustinger\", \"role\": \"USER\"}" http://localhost:7000/auth/challenge

curl -i -X POST -d username=mwustinger -d password=Challenge -c cookieUser.txt http://localhost:7000/auth/login

curl -i -X GET -H "Accept:application/json" -b cookieUser.txt http://localhost:7000/store/mwustinger

curl -i -X POST -b cookieUser.txt http://localhost:7000/admin/remove

```

Test for Group:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"gname\": \"family\", \"pubK\": \"PUBKEY\", \"privK\": \"PRIVKEY\", \"apubK\": \"APUBKEY\", \"aprivK\": \"APRIVKEY\"}" -b cookieUser.txt http://localhost:7000/admin/createGroup

curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"family\", \"role\": \"GROUP\"}" http://localhost:7000/auth/challenge

curl -i -X POST -d username=family -d password=Challenge -c cookieGroup.txt http://localhost:7000/auth/login

curl -i -X GET -H "Accept:application/json" -b cookieGroup.txt http://localhost:7000/store/family

curl -i -X POST -b cookieGroup.txt http://localhost:7000/admin/remove




curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"family\", \"role\": \"ADMIN\"}" http://localhost:7000/auth/challenge

curl -i -X POST -d username=family -d password=Challenge -c cookieAdmin.txt http://localhost:7000/auth/login

curl -i -X GET -H "Accept:application/json" -b cookieAdmin.txt http://localhost:7000/store/family

curl -i -X POST -b cookieAdmin.txt http://localhost:7000/admin/remove
```

Authentication Test:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"mwustinger\", \"role\": \"USER\"}" http://localhost:7000/auth/challenge

curl -i -X POST -d username=mwustinger -d password=Challenge -c cookieUser.txt http://localhost:7000/auth/login

curl -i --header "Accept:application/json" -X GET -b cookieUser.txt http://localhost:7000/store/mwustinger

curl -i -X POST -c cookieUser.txt http://localhost:7000/auth/logout
```

Full Test:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwustinger\", \"role\": \"USER\"}" http://localhost:7000/auth/challenge

curl -i --header "Accept:application/json" -X GET -b cookieUser.txt http://localhost:7000/store/mwustinger

curl -i -X POST -c cookieUser.txt http://localhost:7000/auth/logout

curl -i -X POST -d username=mwustinger -d password=CHALLENGE -c cookieUser.txt http://localhost:7000/auth/login

curl -i --header "Accept:application/json" -X GET -b cookieUser.txt http://localhost:7000/store/mwustinger
```

