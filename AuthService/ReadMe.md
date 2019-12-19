# Auth-Service

Fill with test users:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwustinger\", \"publicKey\": \"M_A_R_T_I_N___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"M_A_R_T_I_N___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register

    curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"kurbaniec\", \"publicKey\": \"K_A_C_P_E_R___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"K_A_C_P_E_R___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register
    
    curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwelsch\", \"publicKey\": \"M_O_R_I_T_Z___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"M_O_R_I_T_Z___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register
    
    curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"swahl\", \"publicKey\": \"S_E_B___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"S_E_B___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register

```

Authentication Test:

```
curl -i --header "Accept:application/json" -X GET -b cookieMwustinger.txt http://localhost:7000/store/mwustinger

curl -X POST http://localhost:7000/auth/challenge?uname=mwustinger

curl -X POST -d username=mwustinger -d password=D_A_S___I_S_T___E_I_N_E___C_H_A_L_L_E_N_G_E -c cookieMwustinger.txt http://localhost:7000/auth/login

curl --header "Accept:application/json" -X GET -b cookieMwustinger.txt http://localhost:7000/store/mwustinger

curl -X POST -c cookieMwustinger.txt http://localhost:7000/auth/logout

curl -i --header "Accept:application/json" -X GET -b cookieMwustinger.txt http://localhost:7000/store/mwustinger

```

Wrong Authentication:

```
curl -i -X POST http://localhost:7000/auth/challenge?uname=mwustinger

curl -i -X POST -d username=mwustinger -d password=D_A_S___I_S_T___K_E_I_N_E___C_H_A_L_L_E_N_G_E -c cookieMwustinger.txt http://localhost:7000/login

curl -i -X POST -d username=mwustinger -d password=D_A_S___I_S_T___K_E_I_N_E___C_H_A_L_L_E_N_G_E -c cookieMwustinger.txt http://localhost:7000/login

curl -i -X POST -d username=mwustinger -d password=D_A_S___I_S_T___E_I_N_E___C_H_A_L_L_E_N_G_E -c cookieMwustinger.txt http://localhost:7000/login




curl -i -X POST http://localhost:7000/auth/challenge?uname=mwustinger

curl -i -X POST -d username=mwustinger -d password=D_A_S___I_S_T___K_E_I_N_E___C_H_A_L_L_E_N_G_E -c cookieMwustinger.txt http://localhost:7000/login

curl -i -X POST -d username=mwustinger -d password=D_A_S___I_S_T___E_I_N_E___C_H_A_L_L_E_N_G_E -c cookieMwustinger.txt http://localhost:7000/login

curl -i --header "Accept:application/json" -X GET -b cookieMwustinger.txt http://localhost:7000/couchdb/mwustinger

curl -i --header "Accept:application/json" -X GET -b cookieMwustinger.txt http://localhost:7000/couchdb/mwelsch

curl -i --header "Accept:application/json" -X GET -b cookieMwustinger.txt http://localhost:7000/couchdb/sbreit



curl -i -X POST http://localhost:7000/auth/challenge?uname=mwustinger

curl -i -X POST -d username=mwustinger -d password=D_A_S___I_S_T___E_I_N_E___C_H_A_L_L_E_N_G_E -c cookieMwustinger.txt http://localhost:7000/auth/login

curl -i --header "Accept:application/json" -X GET -b cookieMwustinger.txt http://localhost:7000/couchdb/mwustinger
```

