docker build -f=./Dockerfile -t docker.codechem.com/ednevnik-api:latest .
docker build -f=./client/Dockerfile -t docker.codechem.com/ednevnik-spa:latest .
docker push docker.codechem.com/ednevnik-api
docker push docker.codechem.com/ednevnik-spa