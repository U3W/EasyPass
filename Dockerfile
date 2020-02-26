FROM rust as builder

# wasm-pack
RUN curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# cargo-generate
RUN apt-get -yqq install pkg-config libssl-dev git;	\
	cargo install cargo-generate; \
rustup toolchain install nightly && \
rustup default nightly
ENV USER root
COPY . /easylist/
WORKDIR /easylist/WebService/src/main/rust/
RUN wasm-pack build --release --no-typescript

FROM openjdk:8-jdk

ARG IPADDRESS

WORKDIR /easylist/
COPY --from=builder /easylist/ .
USER root
RUN apt update && \
apt-get install authbind -y&& \
touch /etc/authbind/byport/80 && \
touch /etc/authbind/byport/443 && \
chmod 777 /etc/authbind/byport/80 && \
chmod 777 /etc/authbind/byport/443 && \
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
