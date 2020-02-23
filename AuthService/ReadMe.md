# Auth-Service

## Rest-Calls AuthRestController

### /register

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"uid\": \"mwustinger\", \"pubK\": \"PUBK\", \"privK\": \"PRIVK_ENC_MK\"}" ^
http://localhost:7000/auth/register

curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"uid\": \"mwelsch\", \"pubK\": \"PUBK\", \"privK\": \"PRIVK_ENC_MK\"}" ^
http://localhost:7000/auth/register
```

### /challenge

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"uid\": \"mwustinger\", \"role\": \"USER\"}" ^
http://localhost:7000/auth/challenge
```

### /login

Fill in the right challenge obtained by the call above

```
curl -i ^
-X POST ^
-d username=mwustinger ^
-d password=Zra2K8ZOfI ^
-c cookie.txt ^
http://localhost:7000/auth/login
```

### /logout

```
curl -i ^
-X POST ^
-b cookie.txt ^
http://localhost:7000/auth/logout
```

## Rest-Calls CouchDB-Store

### /store/{dbname}

```
curl -i ^
-X GET ^
-H "Accept:application/json" ^
-b cookie.txt ^
http://localhost:7000/store/mwustinger

curl -i ^
-X GET ^
-H "Accept:application/json" ^
-b cookie.txt ^
http://localhost:7000/store/mwustinger-meta
```

## Rest-Calls UserRestController

### /remove

```
curl -i ^
-X POST ^
-b cookie.txt ^
http://localhost:7000/user/remove
```

### /create_group

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"gpubK\": \"GPUBK\", \"gprivK\": \"GPRIVK_ENC_GMK\", \"apubK\": \"APUBK\", \"aprivK\": \"APRIVK_ENC_AMK\", \"gmk\": \"GMK_ENC_PUBK\", \"amk\": \"AMK_ENC_PUBK\", \"title\": \"TITLE_ENC_PUBK\"}" ^
-b cookie.txt ^
http://localhost:7000/user/create_group
```

### /auth_group

# ISSUE DOESNT QUITE WORK

#### as regular user

Fill in the right gid saved in the meta-database

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"uid\": \"gab9c9e4373e94a059a829f8e17ee20ab\", \"role\": \"GROUP\"}" ^
http://localhost:7000/auth/challenge
```

Fill in the right challenge obtained by the call above

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"gid\": \"gcf0dee7533ef4a50a998dc1f71573e48\", \"pwd\": \"VF8Jw5aSQu\"}" ^
-b cookie.txt ^
http://localhost:7000/user/auth_group
```

#### as admin user

Fill in the right gid saved in the meta-database

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"uid\": \"gab9c9e4373e94a059a829f8e17ee20ab\", \"role\": \"ADMIN\"}" ^
http://localhost:7000/auth/challenge
```

Fill in the right challenge obtained by the call above

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"gid\": \"gcf0dee7533ef4a50a998dc1f71573e48\", \"pwd\": \"kZc4d8USy1\"}" ^
-b cookie.txt ^
http://localhost:7000/user/auth_group
```

### /my_keys

```
curl -i ^
-X POST ^
-b cookie.txt ^
http://localhost:7000/user/my_keys
```

### /pubkey

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"uid\": \"mwelsch\"}" ^
-b cookie.txt ^
http://localhost:7000/user/pubkey
```





Test for User:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"uid\": \"mwustinger\", \"pubK\": \"PUBKEY\", \"privK\": \"PRIVKEY\"}" http://localhost:7000/auth/register


curl -i -X POST -H "Content-Type: application/json" -d "{\"hash\": \"mwustinger\", \"role\": \"USER\"}" http://localhost:7000/auth/challenge
curl -i -X POST -d username=mwustinger -d password=Challenge -c cookie.txt http://localhost:7000/auth/login


curl -i -X GET -H "Accept:application/json" -b cookie.txt http://localhost:7000/store/mwustinger
curl -i -X GET -H "Accept:application/json" -b cookie.txt http://localhost:7000/store/mwustinger-meta


curl -i -X POST -b cookie.txt http://localhost:7000/user/remove
curl -i -X POST -b cookie.txt http://localhost:7000/auth/logout
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

## 