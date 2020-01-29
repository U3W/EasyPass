# Auth-Service

Fill with test users:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwustinger\", \"pubK\": \"PUBKEY\", \"privK\": \"PRIVKEY\"}" http://localhost:7000/auth/register

curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"mwustinger\", \"role\": \"USER\"}" http://localhost:7000/auth/challenge

curl -i -X POST -d username=mwustinger -d password=Challenge -c cookieMwustinger.txt http://localhost:7000/auth/login

curl -i -X GET -H "Accept:application/json" -b cookieMwustinger.txt http://localhost:7000/store/mwustinger

curl -i -X POST -b cookieMwustinger.txt http://localhost:7000/admin/mwustinger/remove

curl -i -X POST -H "Content-Type: application/json" -d "{\"gname\": \"family\", \"pubK\": \"PUBKEY\", \"privK\": \"PRIVKEY\", \"apubK\": \"APUBKEY\", \"aprivK\": \"APRIVKEY\"}" http://localhost:7000/auth/group
```

Authentication Test:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"mwustinger\", \"role\": \"USER\"}" http://localhost:7000/auth/challenge

curl -i -X POST -d username=mwustinger -d password=Challenge -c cookieMwustinger.txt http://localhost:7000/auth/login

curl -i --header "Accept:application/json" -X GET -b cookieMwustinger.txt http://localhost:7000/store/mwustinger

curl -i -X POST -c cookieMwustinger.txt http://localhost:7000/auth/logout
```

Full Test:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwustinger\", \"role\": \"USER\"}" http://localhost:7000/auth/challenge

curl -i --header "Accept:application/json" -X GET -b cookieMwustinger.txt http://localhost:7000/store/mwustinger

curl -i -X POST -c cookieMwustinger.txt http://localhost:7000/auth/logout

curl -i -X POST -d username=mwustinger -d password=CHALLENGE -c cookieMwustinger.txt http://localhost:7000/auth/login

curl -i --header "Accept:application/json" -X GET -b cookieMwustinger.txt http://localhost:7000/store/mwustinger
```

