# Auth-Service

Fill with test user:

```
curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwustinger\", \"publicKey\": \"M_A_R_T_I_N___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"M_A_R_T_I_N___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register

    curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"kurbaniec\", \"publicKey\": \"K_A_C_P_E_R___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"K_A_C_P_E_R___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register
    
    curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"mwelsch\", \"publicKey\": \"M_O_R_I_T_Z___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"M_O_R_I_T_Z___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register
    
    curl -i -X POST -H "Content-Type: application/json" -d "{\"uname\": \"swahl\", \"publicKey\": \"S_E_B___P_U_B_L_I_C___K_E_Y\", \"privateKey\": \"S_E_B___P_R_I_V_A_T_E___K_E_Y\"}" http://localhost:7000/auth/register

```

