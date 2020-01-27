# Auth-Service

Fill with test users:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwustinger\", \"pubK\": \"PUBKEY\", \"privK\": \"PRIVKEY\"}" http://localhost:7000/auth/register

curl -i -X POST -H "Content-Type: application/json" -d "{\"gname\": \"family\", \"pubK\": \"PUBKEY\", \"privK\": \"PRIVKEY\", \"apubK\": \"APUBKEY\", \"aprivK\": \"APRIVKEY\"}" http://localhost:7000/auth/group
```

Authentication Test:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"mwustinger\", \"role\": \"USER\"}" http://localhost:7000/auth/challenge

curl -i -X POST -d username=mwustinger -d password=GPqpDMLr4FacWW4frcDRhKUemURZ9z9VOaBeEbe1Pl6MlrzZwNo7qVrDF2zk6QKGBErmxjl4tVVPMIPiSkuI1Cl669krYaugqFQqwgXYgnzeIZuE80aiT6U04oDFMXt5IgFLw6GEYTRmsItwz8QOfXEVfn6BWqIXOki4GNhJq6fi7DKBpFWwxZ0p5Tnvp1lBNq0jzhz1NfW5zf57ulBQxyqHdER9kqusSOm9TuFq5GqZiC8COfEn13aeCdBIiit7 -c cookieMwustinger.txt http://localhost:7000/auth/login

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

