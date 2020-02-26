# Set host
sed  -i "s/^host.*/host=$HOST/g"             /easylist/DiscoveryService/src/main/resources/application.properties
sed  -i "s/^host.*/host=$HOST/g"             /easylist/AuthService/src/main/resources/application.properties
sed  -i "s/^host.*/host=$HOST/g"             /easylist/WebService/src/main/resources/application.properties

# Set WebService ports
sed  -i "s/^server.port.*/server.port=$HTTPS_PORT/g"             /easylist/WebService/src/main/resources/application.properties
sed  -i "s/^http.port.*/http.port=$HTTP_PORT/g"             /easylist/WebService/src/main/resources/application.properties

# Set if http traffic should be redirected to https in the WebService
sed  -i "s/^redirect.*/redirect=$REDIRECT_TO_HTTPS/g"             /easylist/WebService/src/main/resources/application.properties

# Set Eureka routes
#sed  -i "s/^eureka.instance.ip-address.*/eureka.instance.ip-address=$IPADDRESS/g"             /easylist/DiscoveryService/src/main/resources/application.properties
#sed  -i "s/^eureka.instance.ip-address.*/eureka.instance.ip-address=$IPADDRESS/g"             /easylist/AuthService/src/main/resources/application.properties
#sed  -i "s/^eureka.instance.ip-address.*/eureka.instance.ip-address=$IPADDRESS/g"             /easylist/WebService/src/main/resources/application.properties

sed  -i "s/^eureka.client.serviceUrl.defaultZone.*/eureka.client.serviceUrl.defaultZone = https:\/\/$HOST:9000\/eureka/g"             /easylist/AuthService/src/main/resources/application.properties
sed  -i "s/^eureka.client.serviceUrl.defaultZone.*/eureka.client.serviceUrl.defaultZone = https:\/\/$HOST:9000\/eureka/g"             /easylist/WebService/src/main/resources/application.properties

# we need the bash -c because the script executes the given command with "exec", but we want to be in a bash :)
#./wait-for-it.sh $DBURL:$DBPORT -t 120
# add-cors-to-couchdb http://$DBURL:$DBPORT -u $DBUSER -p $DBPASSWORD

#(./wait-for-it.sh localhost:9000 -t 120 -- bash -c 'cd /easylist/AuthService/ && ./gradlew bootRun') & \
#(./wait-for-it.sh localhost:7000 -t 240 -- bash -c 'cd /easylist/WebService/ && ./gradlew bootRun')
(bash -c 'sleep 10 && add-cors-to-couchdb http://localhost:5984 -u admin -p Password1234') & \
(bash -c 'sleep 12 && cd /easylist/DiscoveryService/ && ./gradlew bootRun') & \
(bash -c 'sleep 13 && cd /easylist/AuthService/ && ./gradlew bootRun') & \
(bash -c 'sleep 14 && cd /easylist/WebService/ && authbind --deep ./gradlew bootRun') 

