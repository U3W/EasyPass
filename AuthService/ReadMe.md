# Auth-Service

Fill with test users:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwustinger\", \"pubK\": \"PUBKEY\", \"privK\": \"PRIVKEY\"}" http://localhost:7000/auth/register
```

Authentication Test:

```
curl -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwustinger\", \"role\": \"USER\"}" http://localhost:7000/auth/challenge

curl -X POST -d username=mwustinger -d password=CHALLENGE -c cookieMwustinger.txt http://localhost:7000/auth/login

curl --header "Accept:application/json" -X GET -b cookieMwustinger.txt http://localhost:7000/store/mwustinger

curl -X POST -c cookieMwustinger.txt http://localhost:7000/auth/logout

curl --header "Accept:application/json" -X GET -b cookieMwustinger.txt http://localhost:7000/store/mwustinger
```

