# Auth-Service

## Rest-Calls AuthRestController /auth

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
-d "{\"uid\": \"swahl\", \"pubK\": \"PUBK\"}" ^
http://localhost:7000/auth/register
```

### /challenge

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"uid\": \"mwustinger\" \"role\": \"USER\"}" ^
http://localhost:7000/auth/challenge
```

### /login

Fill in the right challenge obtained by the call above

```
curl -i ^
-X POST ^
-d username=mwustinger ^
-d password=qN84U11FOg ^
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

## Rest-Calls CouchDB-Store /store

### /{dbname}

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

## Rest-Calls UserRestController /user

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
-d "{\"gpubK\": \"GPUBK\", \"gprivK\": \"GPRIVK_ENC_GMK\", \"apubK\": \"APUBK\", \"aprivK\": \"APRIVK_ENC_AMK\", \"gmk\": \"GMK_ENC_PUBK\", \"amk\": \"AMK_ENC_PUBK\", \"title\": \"TITLE_ENC_GPUBK\"}" ^
-b cookie.txt ^
http://localhost:7000/user/create_group
```

### /auth_group

#### as regular user

Fill in the right gid saved in the meta-database

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"uid\": \"gdfb77707efe54cc8a4c5fd4235111181\", \"role\": \"GROUP\"}" ^
http://localhost:7000/auth/challenge
```

Fill in the right challenge obtained by the call above

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"gid\": \"gb96eb65d802c429786f815fe013558f7\", \"pwd\": \"KtTZ1UpmVb\"}" ^
-b cookie.txt ^
http://localhost:7000/user/auth_group
```

#### as admin user

Fill in the right gid saved in the meta-database

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"uid\": \"g34338f2cc05042919a3ef86289403e8e\", \"role\": \"ADMIN\"}" ^
http://localhost:7000/auth/challenge
```

Fill in the right challenge obtained by the call above

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"gid\": \"g34338f2cc05042919a3ef86289403e8e\", \"pwd\": \"BhUBP1kvKT\"}" ^
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

## Rest-Calls GroupRestController /group

### /members

```
curl -i ^
-X POST ^
-H "Accept:application/json" ^
-b cookie.txt ^
http://localhost:7000/group/g34338f2cc05042919a3ef86289403e8e/members
```

## Rest-Calls AdminRestController /admin

### /{gid}/remove

```
curl -i ^
-X POST ^
-b cookie.txt ^
http://localhost:7000/admin/g34338f2cc05042919a3ef86289403e8e/remove
```

### /{gid}/add_user

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"uid\": \"mwelsch\", \"euid\": \"mwelsch_ENC_GPUBK\", \"gmk\": \"GMK_ENC_PUBK\", \"amk\": \"AMK_ENC_PUBK\"}" ^
-b cookie.txt ^
http://localhost:7000/admin/g34338f2cc05042919a3ef86289403e8e/add_user
```

### /{gid}/change_cred

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"gpubK\": \"GPUBK2\", \"gprivK\": \"GPRIVK2_ENC_GMK\", \"apubK\": \"APUBK2\", \"aprivK\": \"APRIVK2_ENC_AMK\", \"gmk\": \"GMK_ENC_PUBK\", \"amk\": \"AMK_ENC_PUBK\"}" ^
-b cookie.txt ^
http://localhost:7000/admin/gdfb77707efe54cc8a4c5fd4235111181/change_cred
```



## Test if Challenge is set to 'challenge'

```
curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"uid\": \"mwustinger\", \"role\": \"USER\"}" ^
http://localhost:7000/auth/challenge

curl -i ^
-X POST ^
-d username=mwustinger ^
-d password=challenge ^
-c cookie.txt ^
http://localhost:7000/auth/login

curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"uid\": \"gdfb77707efe54cc8a4c5fd4235111181\", \"role\": \"ADMIN\"}" ^
http://localhost:7000/auth/challenge

curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"gid\": \"gdfb77707efe54cc8a4c5fd4235111181\", \"pwd\": \"challenge\"}" ^
-b cookie.txt ^
http://localhost:7000/user/auth_group

curl -i ^
-X POST ^
-H "Content-Type: application/json" ^
-d "{\"gpubK\": \"GPUBK2\", \"gprivK\": \"GPRIVK2_ENC_GMK\", \"apubK\": \"APUBK2\", \"aprivK\": \"APRIVK2_ENC_AMK\", \"gmk\": \"GMK_ENC_PUBK\", \"amk\": \"AMK_ENC_PUBK\"}" ^
-b cookie.txt ^
http://localhost:7000/admin/gdfb77707efe54cc8a4c5fd4235111181/change_cred
```

