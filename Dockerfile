FROM ubuntu:18.04

FROM openjdk:8-jdk

ARG IPADDRESS

COPY . /easylist/
WORKDIR /easylist/

RUN apt update && \
apt-get install authbind && \
apt-get install sudo && \
sudo touch /etc/authbind/byport/80 && \
sudo touch /etc/authbind/byport/443 && \
sudo chmod 777 /etc/authbind/byport/80 && \
sudo chmod 777 /etc/authbind/byport/443 && \
curl -sL https://deb.nodesource.com/setup_8.x | bash - &&\
apt-get install -y nodejs build-essential && \
npm install npm -g && \
npm install -g add-cors-to-couchdb 

RUN (chmod -R 777 *) && \
(cd /easylist/AuthService && ./gradlew build) && \
(cd /easylist/DiscoveryService && ./gradlew build) && \
(cd /easylist/WebService && ./gradlew appInstall && ./gradlew appBuild && ./gradlew appCopy )

EXPOSE 8090
EXPOSE 7000
EXPOSE 9000
CMD ./startScriptForDocker.sh
